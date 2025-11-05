+++
title = "Voter turnout"
title-tag = "Tracking Pennsylvania voter turnout trends"
description = "Explore the latest voter registration changes in Pennsylvania by party and county with our interactive graphics."
kicker = "Elections"
authors = ["Alexandra Harris"]
published = "2025-11-10T00:00:00-04:00"
layout = "voter-turnout"
url = "/pennsylvania-voter-turnout"
no-index = false
ad-header-desktop-active = false
ad-header-mobile-active = false
internal-id = "SPLVOTERTURNOUT"

image = "external/9b02rsyscxwdnw0xpe9w7p3jar.jpeg"
image-alt = "People in line at a polling place."
image-credit = "Amanda Berg / For Spotlight PA"

credits = """
{{<featured/credit
    eyebrow="Design and development"
    name="Alexandra Harris"
    role="Newsroom Developer"
    email="aharris@spotlightpa.org"
>}}
{{<featured/credit
    eyebrow="Data analysis"
    name="Carlana Johnson"
    role="Director of Technology"
    email="cjohnson@spotlightpa.org"
>}}
"""

[data]
sources = [
  "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/voter-turnout/counts.csv"
]
popup = true
cacheVersion = 1
maxCacheAge = 24
delimiter = ","
numericFields = [
  "Total registered",
  "Recent voter turnout",
  "Turnout percentage",
  "Males registered",
  "Male turnout",
  "Male turnout percentage",
  "Male percentage of registration",
  "Male percentage of total turnout",
  "Male turnout performance",
  "Females registered",
  "Female turnout",
  "Female turnout percentage",
  "Female percentage of registration",
  "Female percentage of total turnout",
  "Female turnout performance",
  "Republicans registered",
  "Republican turnout",
  "Republican turnout percentage",
  "Republican percentage of registration",
  "Republican percentage of total turnout",
  "Republican turnout performance",
  "Democrats registered",
  "Democratic turnout",
  "Democratic turnout percentage",
  "Democratic percentage of registration",
  "Democratic percentage of total turnout",
  "Democratic turnout performance",
  "Other party registered",
  "Other party turnout",
  "Other party turnout percentage",
  "Other party percentage of registration",
  "Other party percentage of total turnout",
  "Other party turnout performance"
]
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