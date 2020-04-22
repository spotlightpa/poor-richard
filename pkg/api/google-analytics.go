package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/net/context/ctxhttp"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func (app *appEnv) getMostPopular(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Pages []string `json:"pages"`
	}
	var (
		resp response
		err  error
	)
	resp.Pages, err = getMostPopular(r.Context(), app.googleCreds, app.viewID)
	if err != nil {
		app.errorResponse(r.Context(), w, err)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=300")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	app.jsonResponse(http.StatusOK, w, &resp)
}

func getMostPopular(ctx context.Context, jsonGoogleCredentials, viewID string) ([]string, error) {
	var (
		client *http.Client
		err    error
	)
	if len(jsonGoogleCredentials) == 0 {
		client, err = google.DefaultClient(ctx, "https://www.googleapis.com/auth/analytics.readonly")
	} else {
		creds, errShdw := google.CredentialsFromJSON(
			ctx,
			[]byte(jsonGoogleCredentials),
			"https://www.googleapis.com/auth/analytics.readonly",
		)
		client = oauth2.NewClient(oauth2.NoContext, creds.TokenSource)
		err = errShdw
	}
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.Encode(&AnalyticsRequest{
		ReportRequests: []ReportRequest{{
			ViewID: viewID,
			Metrics: []Metric{{
				Expression: "ga:uniquePageviews",
			}},
			Dimensions: []Dimension{{
				Name: "ga:pagePath",
			}},
			DateRanges: []DateRange{{
				StartDate: "2daysAgo",
				EndDate:   "yesterday",
			}},
			OrderBys: []OrderBy{{
				FieldName: "ga:uniquePageviews",
				SortOrder: "DESCENDING",
			}},
			FiltersExpression: `ga:pagePath=~^/news/\d\d\d\d`,
			PageSize:          20,
		}},
	})

	resp, err := ctxhttp.Post(
		ctx,
		client,
		"https://analyticsreporting.googleapis.com/v4/reports:batchGet",
		"application/json",
		&buf,
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data AnalyticsResponse
	dec := json.NewDecoder(resp.Body)
	if err = dec.Decode(&data); err != nil {
		return nil, err
	}
	if len(data.Reports) != 1 {
		return nil, fmt.Errorf("got bad report length: %d", len(data.Reports))
	}
	pages := make([]string, 0, len(data.Reports[0].Data.Rows))
	for _, row := range data.Reports[0].Data.Rows {
		if len(row.Dimensions) != 1 {
			return nil, fmt.Errorf("got bad row length: %d", len(row.Dimensions))
		}
		pages = append(pages, row.Dimensions[0])
	}
	// todo normalize their crap data
	return pages, nil
}

type AnalyticsRequest struct {
	ReportRequests []ReportRequest `json:"reportRequests"`
}

type ReportRequest struct {
	ViewID            string      `json:"viewId"`
	DateRanges        []DateRange `json:"dateRanges"`
	Dimensions        []Dimension `json:"dimensions"`
	Metrics           []Metric    `json:"metrics"`
	FiltersExpression string      `json:"filtersExpression"`
	OrderBys          []OrderBy   `json:"orderBys"`
	PageSize          int         `json:"pageSize"`
	PageToken         string      `json:"pageToken"`
}

type DateRange struct {
	EndDate   string `json:"endDate"`
	StartDate string `json:"startDate"`
}

type Dimension struct {
	Name string `json:"name"`
}

type Metric struct {
	Expression string `json:"expression"`
}

type OrderBy struct {
	FieldName string `json:"fieldName"`
	SortOrder string `json:"sortOrder"`
}

type AnalyticsResponse struct {
	Reports []Report `json:"reports"`
}

type Report struct {
	ColumnHeader ColumnHeader `json:"columnHeader"`
	Data         Data         `json:"data"`
}

type Data struct {
	Rows     []Row    `json:"rows"`
	Totals   []Values `json:"totals"`
	RowCount int      `json:"rowCount"`
	Minimums []Values `json:"minimums"`
	Maximums []Values `json:"maximums"`
}

type MetricHeaderEntry struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type MetricHeader struct {
	MetricHeaderEntries []MetricHeaderEntry `json:"metricHeaderEntries"`
}

type ColumnHeader struct {
	Dimensions   []string     `json:"dimensions"`
	MetricHeader MetricHeader `json:"metricHeader"`
}

type Values struct {
	Values []string `json:"values"`
}

type Row struct {
	Dimensions []string `json:"dimensions"`
	Metrics    []Values `json:"metrics"`
}
