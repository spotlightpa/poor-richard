+++
title = "Voter registration"
title-tag = "Tracking Pennsylvania voter registration trends"
description = "Explore the latest voter registration changes in Pennsylvania by party and county with our interactive graphics."
kicker = "Elections"
authors = ["Alexandra Harris"]
published = "2025-11-03T00:00:00-04:00"
layout = "voter-registration"
url = "/pennsylvania-voter-registration"
no-index = false
ad-header-desktop-active = false
ad-header-mobile-active = false
internal-id = "SPLVOTERREG"

image = "2024/04/01k1-fvsv-86f6-4s99.jpeg"
image-alt = "Illustration of election pins"
image-credit = "Illustration by Leise Hook / For Spotlight PA"

[data]
sources = [
  "https://interactives.data.spotlightpa.org/2025/voter-registration/total.xlsx",
  "https://interactives.data.spotlightpa.org/2025/voter-registration/county.xlsx",
  "https://interactives.data.spotlightpa.org/2025/voter-registration/party-year.xlsx",
  "https://interactives.data.spotlightpa.org/2025/voter-registration/congress.xlsx",
  "https://interactives.data.spotlightpa.org/2025/voter-registration/senate.xlsx",
  "https://interactives.data.spotlightpa.org/2025/voter-registration/house.xlsx",
  "https://interactives.data.spotlightpa.org/2025/voter-registration/county-year.xlsx"
]
popup = true
cacheVersion = 1
maxCacheAge = 24
delimiter = ","
numericFields = ["Total", "Democrat", "Democratic", "Republican", "No Affiliation", "Other", "Democrat Share", "Republican Share", "No Affiliation Share", "Other Share"]
metadata = "https://interactives.data.spotlightpa.org/2025/voter-registration/metadata.json"

[geojson]
sources = [
  "https://interactives.data.spotlightpa.org/map-files/pa-counties.geojson",
  "https://interactives.data.spotlightpa.org/map-files/house-2022.geojson",
  "https://interactives.data.spotlightpa.org/map-files/congress-2022.geojson",
  "https://interactives.data.spotlightpa.org/map-files/senate-2022.geojson"
]

[map]
controls = ["navigation"]
bounds = [[-80.5199, 39.7198], [-74.6895, 42.26986]]
padding = 24
minZoom = 3
maxZoom = 18
zoom = 6
styleURL = "https://tiles.openfreemap.org/styles/positron"
+++
