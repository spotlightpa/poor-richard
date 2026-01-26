+++
layout = "restaurant-inspections"
url = "/restaurant-inspections/"
suppress-footer-newsletter = true

ad-header-desktop-active = false
ad-header-mobile-active = false

title = "Pennsylvania Restaurant Safety Tracker"
deck = "Free, real-time updates about health inspections at restaurants near you."

sign-up-button = "Sign up for alerts"
search-instructions = "Search by restaurant name, city, or zip across 61 counties"
search-placeholder = "Facility name, city, zip"
search-desktop-placeholder = "Enter facility name, city, zip"
search-location = true

show-alerts-button = false

[data]
source = "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/restaurant-inspections/inspections.csv.gz"
popup = false
cacheVersion = 1
maxCacheAge = 24
delimiter = ","
numericFields = ["Latitude", "Longitude"]

[params]
about-title = "*About This Tool"
about-description = """
Spotlight PA’s Pennsylvania Restaurant Safety Tracker is an interactive database developed to help Pennsylvanians better understand public inspection data for retail food facilities. The database utilizes information from the <a href="https://www.pa.gov/agencies/pda/food/food-safety/retail-food-inspection-reports">Pennsylvania Department of Agriculture</a>, which produces retail food inspection reports for 61 of Pennsylvania’s 67 counties. Allegheny, Bucks, Delaware, Erie, Montgomery, and Philadelphia county health departments conduct their own inspections.
<br><br>
As noted by the Department of Agriculture, inspections are a “snapshot” of a particular day. Many violations are relatively minor and are fixed at the time of inspection. Our goal is to provide a trustworthy and easy-to-use resource that helps consumers better understand the severity and nature of violations and find the information most relevant to them. To do this, we’ve highlighted the violations most likely to lead to foodborne illness and used generative AI to categorize violations and summarize inspector comments in plain language so users can better contextualize violations. We worked closely with an expert in restaurant inspections to validate this process.
<br><br>
We will continue to update this resource and report on the restaurant inspection process across Pennsylvania. The database will update automatically as new inspection reports are posted, and we will work to add new features based on feedback.


"""

questions-title = "Questions?"
questions-description = "Email us at [operations@spotlightpa.org](mailto:operations@spotlightpa.org)"

tips-title = "Send us a tip"
tips-description = "Fill out a form [here](https://www.spotlightpa.org/tips)."

credits = """
{{<featured/credit
    eyebrow="Design and Development"
    name="Alexandra Harris"
    role="Newsroom Developer"
    email="aharris@spotlightpa.org"
>}}
{{<featured/credit
    eyebrow="Project Management"
    name="Christina Bruno"
    role="Digital Growth Strategist"
    email="cbruno@spotlightpa.org"
>}}
"""

[map]
controls = ["navigation", "fullscreen"]
bounds = [[-80.5199, 39.7198], [-74.6895, 42.26986]]
padding = 24
minZoom = 3
maxZoom = 18
zoom = 6
styleURL = "https://tiles.openfreemap.org/styles/positron"
+++