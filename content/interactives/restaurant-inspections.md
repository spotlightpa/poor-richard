+++
layout = "restaurant-inspections"
url = "/restaurant-inspections/"
suppress-footer-newsletter = true

title = "Pennsylvania Restaurant Safety Tracker"
deck = "Free, real-time updates about health inspections at restaurants near you."

sign-up-button = "Sign up for alerts"
search-instructions = "Search by restaurant name, city, or zip across 61 counties"
search-placeholder = "Search for restaurants"
search-desktop-placeholder = "Search"
search-location = true

[data]
source = "https://s3.us-east-2.amazonaws.com/interactives.data.spotlightpa.org/2025/restaurant-inspections/inspections.csv.gz"
popup = false

[params]
about-title = "About This Tool"
about-description = """
Additional context on how and why we developed violation categories, data source, etc.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce venenatis, lectus eget tincidunt malesuada, risus nunc dapibus justo, nec cursus turpis felis at libero
"""

questions-title = "Questions?"
questions-description = "Email us at xyz@spotlightpa.org"

tips-title = "Send us a tip."
tips-description = "Fill out a form here."

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
+++

[map]
controls = ["navigation", "fullscreen"]
bounds = [[-80.5199, 39.7198], [-74.6895, 42.26986]]
padding = 24
minZoom = 3
maxZoom = 18
zoom = 6
styleURL = "https://tiles.openfreemap.org/styles/positron"