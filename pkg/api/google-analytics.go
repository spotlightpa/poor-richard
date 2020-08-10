package api

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/spotlightpa/poor-richard/pkg/httpjson"
)

func (app *appEnv) getMostPopular(w http.ResponseWriter, r *http.Request) {
	app.Printf("starting getMostPopular")

	type response struct {
		Pages []string `json:"pages"`
	}
	var (
		resp response
		err  error
	)
	// Let's cache no matter what…
	w.Header().Set("Cache-Control", "public, max-age=900") // 15 minutes
	w.Header().Set("Access-Control-Allow-Origin", "*")

	client := app.googleClient(r.Context())
	if client == nil {
		app.errorResponse(r.Context(), w, fmt.Errorf("client not available"))
		return
	}
	resp.Pages, err = getMostPopular(r.Context(), client, app.viewID)
	app.Printf("got %d most popular pages", len(resp.Pages))
	if err != nil {
		app.errorResponse(r.Context(), w, err)
		return
	}

	app.jsonResponse(r.Context(), http.StatusOK, w, &resp)
}

func getMostPopular(ctx context.Context, client *http.Client, viewID string) ([]string, error) {
	req := &AnalyticsRequest{
		ReportRequests: []ReportRequest{{
			ViewID: viewID,
			Metrics: []Metric{{
				Expression: "ga:uniquePageviews",
			}},
			Dimensions: []Dimension{{
				Name: "ga:pagePath",
			}},
			DateRanges: []DateRange{{
				StartDate: "today",
				EndDate:   "today",
			}},
			OrderBys: []OrderBy{{
				FieldName: "ga:uniquePageviews",
				SortOrder: "DESCENDING",
			}},
			FiltersExpression: `ga:pagePath=~^/news/\d\d\d\d`,
			PageSize:          20,
		}},
	}
	var data AnalyticsResponse
	if err := httpjson.Post(
		ctx,
		client,
		"https://analyticsreporting.googleapis.com/v4/reports:batchGet",
		req,
		&data,
	); err != nil {
		return nil, err
	}

	if len(data.Reports) != 1 {
		return nil, fmt.Errorf("got bad report length: %d", len(data.Reports))
	}
	report := &data.Reports[0]
	pages := make([]string, 0, len(report.Data.Rows))
	pagesSet := make(map[string]bool, len(report.Data.Rows))
	for _, row := range report.Data.Rows {
		if len(row.Dimensions) != 1 {
			return nil, fmt.Errorf("got bad row length: %d", len(row.Dimensions))
		}
		page := row.Dimensions[0]
		u, err := url.Parse(page)
		if err != nil {
			continue
		}
		// TODO: We could go through and add up all the query string variants
		// then re-sort, but seems like overkill
		page = u.Path
		if !pagesSet[page] {
			pagesSet[page] = true
			pages = append(pages, page)
		}
	}

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
