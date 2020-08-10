package httpjson

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
)

func Request(ctx context.Context, c *http.Client, method, url string, send, receive interface{}, acceptStatuses ...int) error {
	if c == nil {
		c = http.DefaultClient
	}

	var body io.Reader
	if send != nil {
		b, err := json.Marshal(send)
		if err != nil {
			return err
		}
		body = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return err
	}
	if send != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if err = StatusCheck(resp, acceptStatuses...); err != nil {
		return err
	}
	if receive == nil {
		return nil
	}
	if err = json.Unmarshal(b, receive); err != nil {
		return err
	}

	return nil
}

var goodStatuses = []int{
	http.StatusOK,
	http.StatusCreated,
	http.StatusAccepted,
	http.StatusNonAuthoritativeInfo,
	http.StatusNoContent,
}

func StatusCheck(resp *http.Response, acceptStatuses ...int) error {
	if len(acceptStatuses) == 0 {
		acceptStatuses = goodStatuses
	}
	for _, code := range acceptStatuses {
		if resp.StatusCode == code {
			return nil
		}
	}

	return fmt.Errorf("unexpected status: %s", resp.Status)
}
