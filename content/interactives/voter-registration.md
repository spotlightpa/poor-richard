+++
title = "Voter registration"
title-tag = "Pennsylvania Voter Registration"
description = "Track key data about voter registration trends in Pennsylvania."
kicker = "Elections"
authors = ["Alexandra Harris"]
published = "2025-09-29T00:00:00-04:00"
layout = "voter-registration"
url = "/news/voter-registration/"
no-index = false
ad-header-desktop-active = false
ad-header-mobile-active = false

image = "2024/04/01k1-fvsv-86f6-4s99.jpeg"
image-alt = "Illustration of election pins"
image-credit = "Illustration by Leise Hook / For Spotlight PA"

[data]
sources = [
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/total.xlsx",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/county.xlsx",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/party-year.xlsx",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/congress.xlsx",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/senate.xlsx",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/house.xlsx",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/county-year.xlsx"
]
popup = true
cacheVersion = 1
maxCacheAge = 24
delimiter = ","
numericFields = ["Total", "Democrat", "Democratic", "Republican", "No Affiliation", "Other", "Democrat Share", "Republican Share", "No Affiliation Share", "Other Share"]
metadata = "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-registration/metadata.json"

[geojson]
sources = [
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/map-files/pa-counties.geojson",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/map-files/house-2022.geojson",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/map-files/congress-2022.geojson",
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/map-files/senate-2022.geojson"
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
