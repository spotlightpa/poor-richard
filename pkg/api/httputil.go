package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/carlmjohnson/resperr"
	"github.com/getsentry/sentry-go"
)

func (app *appEnv) versionMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("SpotlightPA-App-Version", BuildVersion)
		h.ServeHTTP(w, r)
	})
}

func (app *appEnv) jsonResponse(ctx context.Context, statusCode int, w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	enc := json.NewEncoder(w)
	if err := enc.Encode(data); err != nil {
		app.logErr(ctx, err)
	}
}

func (app *appEnv) errorResponse(ctx context.Context, w http.ResponseWriter, err error) {
	app.logErr(ctx, err)

	code := resperr.StatusCode(err)
	msg := resperr.UserMessage(err)
	app.jsonResponse(ctx, code, w, struct {
		Error string `json:"error"`
	}{msg})
}

func (app *appEnv) logErr(ctx context.Context, err error) {
	if hub := sentry.GetHubFromContext(ctx); hub != nil {
		hub.CaptureException(err)
	} else {
		app.Printf("sentry not in context")
	}

	app.Printf("err: %v", err)
}

var errPing = fmt.Errorf("test ping")

func (app *appEnv) pingErr(w http.ResponseWriter, r *http.Request) {
	code := 500
	fmt.Sscanf(r.URL.Path, "/api/healthcheck/%d", &code)
	app.Printf("start pingErr [%d]", code)
	app.errorResponse(r.Context(), w, resperr.WithStatusCode(errPing, code))
}
