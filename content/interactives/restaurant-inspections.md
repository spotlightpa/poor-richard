+++
layout = "restaurant-inspections"
url = "/restaurant-inspections/"
suppress-footer-newsletter = true

suppress-expanded-header = true

ad-header-desktop-active = false
ad-header-mobile-active = false

title = "Pennsylvania Restaurant Safety Tracker"
deck = "Real-time updates about health inspections at restaurants near you."

sign-up-button = "Sign up for alerts"
search-instructions = "Search by restaurant name, city, or zip across 61 counties"
search-placeholder = "Facility name, city, zip"
search-desktop-placeholder = "Enter facility name, city, zip"
search-location = true

show-alerts-button = true
cuisine-type = false

[data]
source = "https://interactives.data.spotlightpa.org/2025/restaurant-inspections/inspections.csv.gz"
popup = false
cacheVersion = 1
maxCacheAge = 24
delimiter = ","
numericFields = ["Latitude", "Longitude"]

[params]
about-title = "About This Tool"
about-description = """
Spotlight PA's Pennsylvania Restaurant Safety Tracker is an interactive database developed to help Pennsylvanians better understand public inspection data for retail food facilities. The database utilizes information from the <a href="https://www.pa.gov/agencies/pda/food/food-safety/retail-food-inspection-reports">Pennsylvania Department of Agriculture</a>, which produces retail food inspection reports for 61 of Pennsylvania's 67 counties. Allegheny, Bucks, Delaware, Erie, Montgomery, and Philadelphia county health departments conduct their own inspections. We are working on adding the additional six counties to the tool.
<br><br>
As noted by the Department of Agriculture, inspections are a "snapshot" of a particular day. Many violations are relatively minor and are fixed at the time of inspection. Our goal is to provide a trustworthy and easy-to-use resource that helps consumers better understand the severity and nature of violations and find the information most relevant to them. To do this, we've highlighted the violations most likely to lead to foodborne illness and used generative AI to summarize inspector comments in plain language so users can better contextualize violations. We worked closely with an expert in restaurant inspections to validate this process.
<br><br>
We will continue to update this resource and report on the restaurant inspection process across Pennsylvania. The database will update automatically as new inspection reports are posted, and we will work to add new features based on feedback.
"""

questions-title = "FAQ"
questions-description = """
## Why did Spotlight PA create this Pennsylvania restaurant inspections resource?

We created the Restaurant Safety Tracker to help you make informed, real-time decisions about where to eat. Public inspection reports for retail food facilities are full of useful information. But they are not always easy to understand, and they are not always easy to find when you need them most. By making this information more personalized and actionable through an interactive database and real-time alerts, you can better make informed decisions and keep an eye on your favorite establishments or those in your community.

As noted by the Pennsylvania Department of Agriculture, inspections are a “snapshot” of a particular day. Many violations are relatively minor and are fixed at the time of inspection. Our goal is to provide a trustworthy and easy-to-use resource that helps consumers better understand the severity and nature of violations and find the information most relevant to them.

## Where does Pennsylvania restaurant inspection safety data come from?

The database utilizes information from the [Pennsylvania Department of Agriculture](https://www.pa.gov/agencies/pda/food/food-safety/retail-food-inspection-reports), which produces retail food inspection reports for 61 of Pennsylvania’s 67 counties. Allegheny, Bucks, Delaware, Erie, Montgomery, and Philadelphia county health departments conduct their own inspections. We are working on adding the additional six counties to the database.

## How often is Pennsylvania restaurant inspection safety data updated?

Inspections are conducted regularly throughout the state, and results are posted as inspections are conducted. The database updates automatically as new inspection reports are posted.

## What is the difference between high, moderate, and low risk food safety violations?

These categories align directly with priority levels identified in the FDA Food Code: Priority, Priority foundation, and Core.

Priority items contribute directly to the elimination, prevention, or reduction to an acceptable level of hazards associated with foodborne illness or injury, such as handwashing, food handling, and temperature control, or other direct food contamination threats, such as rodents or pests. We noted violations of priority items as high risk in the database.

Priority foundation items support, facilitate, or enable control of risk factors that contribute to foodborne illness or injury, such as personnel training, labeling, and record-keeping. We noted violations of priority foundation items as moderate risk in the database.

Core items usually relate to standard operating procedures, facility structures, equipment design, or general maintenance. We noted violations of core items as low risk in the database.

## How is this different from the restaurant inspection reports found on the Pennsylvania Department of Agriculture website?

We added high-, moderate-, and low-risk indicators to help readers understand the violations most likely to lead to foodborne illness. These indicators align directly with priority levels outlined in the FDA Food Code. We also modified some of the violation categories to make them easier for you to identify. Finally, we used generative AI to summarize inspector comments in plain language so you can better contextualize violations. We worked closely with an expert in restaurant inspections to validate this entire process and ensure we weren’t over-simplifying or misinterpreting Food Code violations.

## How is AI involved in this tool?

Inspector comments can be dense and technical, and it can be hard to determine the severity of a violation. We used generative AI to summarize inspector comments to make them easier for you to understand. We tested prompts over many months to refine results, and had editors and a food safety expert review them for accuracy. While AI can occasionally produce errors, we believe the benefit of making comments easier to understand outweighs the few and minor instances of errors. We also always provide a link to the full inspection report for verification.

## Why aren't all Pennsylvania restaurants in this database?

Currently, the Restaurant Safety Tracker only pulls data from the Pennsylvania Department of Agriculture, but not all restaurants in Pennsylvania conduct inspections through this department. Some counties and municipalities do their own inspections. Allegheny, Bucks, Delaware, Erie, Montgomery, and Philadelphia county health departments conduct their own inspections. We are working on adding the additional six counties to the database.

## I can't find a certain restaurant when searching for it by name. Why is that?

If you have trouble finding a restaurant, try searching for just a few letters or parts of the name. For example, try searching "Alice" rather than "Alice's American Diner."

## Who can I contact with questions or feedback about the Restaurant Safety Tracker?

Please reach out to the Spotlight PA team at [alerts@spotlightpa.org](mailto:alerts@spotlightpa.org).
"""

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
    role="Director of Growth & Product Strategy"
    email="cbruno@spotlightpa.org"
>}}
"""

[map]
controls = ["navigation"]
navigationPosition = "top-left"
bounds = [[-80.5199, 39.7198], [-74.6895, 42.26986]]
padding = 24
minZoom = 3
maxZoom = 18
zoom = 6
styleURL = "https://tiles.openfreemap.org/styles/positron"
+++