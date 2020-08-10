package httpjson

import (
	"context"
	"net/http"
)

func Post(ctx context.Context, c *http.Client, url string, send, receive interface{}, acceptStatuses ...int) error {
	return Request(ctx, c, http.MethodPost, url, send, receive, acceptStatuses...)
}

func Put(ctx context.Context, c *http.Client, url string, send, receive interface{}, acceptStatuses ...int) error {
	return Request(ctx, c, http.MethodPut, url, send, receive, acceptStatuses...)
}
