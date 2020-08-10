package httpjson

import (
	"context"
	"net/http"
)

func Receive(ctx context.Context, c *http.Client, method, url string, v interface{}, acceptStatuses ...int) error {
	return Request(ctx, c, method, url, nil, v, acceptStatuses...)
}

func Get(ctx context.Context, c *http.Client, url string, v interface{}, acceptStatuses ...int) error {
	return Receive(ctx, c, http.MethodGet, url, v, acceptStatuses...)
}

func Delete(ctx context.Context, c *http.Client, url string, v interface{}, acceptStatuses ...int) error {
	return Receive(ctx, c, http.MethodDelete, url, v, acceptStatuses...)
}
