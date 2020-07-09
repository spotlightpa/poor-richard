package api

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"github.com/carlmjohnson/feed2json"
	"github.com/carlmjohnson/resperr"
	"golang.org/x/net/context/ctxhttp"
)

func (app *appEnv) feed(url string) http.Handler {
	var h http.HandlerFunc
	h = func(w http.ResponseWriter, r *http.Request) {
		rsp, err := ctxhttp.Get(r.Context(), nil, url)
		if err != nil {
			err = resperr.WithStatusCode(err, http.StatusBadGateway)
			err = fmt.Errorf("error connecting to %q: %w", url, err)
			app.errorResponse(r.Context(), w, err)
			return
		}
		defer rsp.Body.Close()
		var from, to bytes.Buffer
		if _, err = from.ReadFrom(rsp.Body); err != nil {
			err = resperr.WithStatusCode(err, http.StatusBadGateway)
			err = fmt.Errorf("error reading %q: %v", url, err)
			app.errorResponse(r.Context(), w, err)
			return
		}
		if err = feed2json.Convert(&from, &to); err != nil {
			err = fmt.Errorf("error converting %q: %v", url, err)
			app.errorResponse(r.Context(), w, err)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=900") // 15 minutes
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if _, err = io.Copy(w, &to); err != nil {
			app.logErr(r.Context(), err)
			return
		}
		app.Printf("[200] converted %q", url)
	}
	return h
}
