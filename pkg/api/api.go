package api

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/carlmjohnson/flagext"
	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/peterbourgon/ff/v2"
	"github.com/piotrkubisa/apigo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const AppName = "spotlightpa-api"

var BuildVersion string = "Development"

func CLI(args []string) error {
	var app appEnv
	if err := app.parseArgs(args); err != nil {
		fmt.Fprintf(os.Stderr, "Startup error: %v\n", err)
		return err
	}
	if err := app.exec(); err != nil {
		fmt.Fprintf(os.Stderr, "Runtime error: %v\n", err)
		return err
	}
	return nil
}

func (app *appEnv) parseArgs(args []string) error {
	fl := flag.NewFlagSet(AppName, flag.ContinueOnError)
	app.Logger = log.New(nil, AppName+" ", log.LstdFlags)
	flagext.LoggerVar(fl, app.Logger, "silent", flagext.LogSilent, "silence logging")

	fl.BoolVar(&app.isLambda, "lambda", false, "use AWS Lambda rather than HTTP")
	fl.StringVar(&app.port, "port", ":12345", "listen on port (HTTP only)")
	sentryDSN := fl.String("sentry-dsn", "", "DSN `pseudo-URL` for Sentry")
	// Using a crazy callback because Netlify is getting
	// tripped up by the real credentials
	flagext.Callback(fl, "google-json", "", "GZIP Base64 JSON credentials for Google",
		func(s string) error {
			b, err := base64.StdEncoding.DecodeString(s)
			if err != nil {
				return err
			}
			g, err := gzip.NewReader(bytes.NewReader(b))
			if err != nil {
				return err
			}
			defer g.Close()
			b, err = ioutil.ReadAll(g)
			if err != nil {
				return err
			}
			creds, err := google.CredentialsFromJSON(
				oauth2.NoContext, b, "https://www.googleapis.com/auth/analytics.readonly",
			)
			if err != nil {
				return err
			}
			app.googleHTTPClient = oauth2.NewClient(oauth2.NoContext, creds.TokenSource)

			return nil
		})
	fl.StringVar(&app.viewID, "view-id", "", "view ID for Google Analytics")

	fl.Usage = func() {
		fmt.Fprintf(fl.Output(), "spotlightpa-api help\n\n")
		fl.PrintDefaults()
	}
	if err := ff.Parse(fl, args, ff.WithEnvVarPrefix("POOR_RICHARD")); err != nil {
		return err
	}

	if err := app.initSentry(*sentryDSN, app.Logger); err != nil {
		return err
	}

	return nil
}

type appEnv struct {
	port     string
	isLambda bool
	*log.Logger
	googleHTTPClient *http.Client
	viewID           string
}

func (app *appEnv) exec() error {
	app.Printf("starting %s (%s)", AppName, BuildVersion)
	routes := sentryhttp.
		New(sentryhttp.Options{
			WaitForDelivery: true,
			Timeout:         5 * time.Second,
		}).
		Handle(app.routes())

	if app.isLambda {
		app.Printf("initialized on AWS Lambda")
		apigo.ListenAndServe("", routes)
		panic("unreachable")
	}

	app.Printf("listening on port %s", app.port)

	return http.ListenAndServe(app.port, routes)
}

func (app *appEnv) initSentry(dsn string, l *log.Logger) error {
	var transport sentry.Transport
	if app.isLambda {
		l.Printf("setting sentry sync with timeout")
		transport = &sentry.HTTPSyncTransport{Timeout: 5 * time.Second}
	}
	return sentry.Init(sentry.ClientOptions{
		Dsn:       dsn,
		Release:   BuildVersion,
		Transport: transport,
	})
}

const mailchimpFeed = "https://us3.campaign-archive.com/feed?u=4f6d92afd9b3de3ddb48714b9&id=0466df5ab5"

func (app *appEnv) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/healthcheck/", app.pingErr)
	mux.HandleFunc("/api/most-popular", app.getMostPopular)
	mux.Handle("/api/newsletter.json", app.feed(mailchimpFeed))
	return app.versionMiddleware(mux)
}

func (app *appEnv) googleClient(ctx context.Context) *http.Client {
	if app.googleHTTPClient == nil {
		app.Printf("falling back to default credentials")
		var err error
		app.googleHTTPClient, err = google.DefaultClient(ctx, "https://www.googleapis.com/auth/analytics.readonly")
		if err != nil {
			app.logErr(ctx, err)
		}
	}
	return app.googleHTTPClient
}

func (app *appEnv) cacheControlMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=900") // 15 minutes
		w.Header().Set("Access-Control-Allow-Origin", "*")

		h.ServeHTTP(w, r)
	})
}
