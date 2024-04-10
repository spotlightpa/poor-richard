+++
internal-id = "ELEXCENTER2024"
image = "external/cwszvjdnvs3e3q3ge64y5wjjx0.jpeg"
image-description = "Pennsylvania’s capitol building in Harrisburg on the morning of Election Day. November 3, 2020."
image-credit = "Amanda Berg / For Spotlight PA"
kicker = "Elections"
title = "Pennsylvania Primary Election 2024"
title-tag = "Official Pennsylvania Election Center 2024"
description = "Full coverage of Pennsylvania's elections, including how to vote, where to vote, polling places, sample ballots, candidate guides, and more."
dek = "Candidates for president, U.S. House and Senate, row offices, and more will appear on the April 23 ballot."
extended-kicker = "Pa. Election Center 2024"
linktitle = "Everything you need to prepare for Pa.’s 2024 election"
blurb = "Spotlight PA wants to empower voters to make an informed decision on May 16. Our new Election Center features key dates, a campaign finance tracker, in-depth coverage, and more."
url = "/elections-2024/"
aliases = [
    "/election/",
    "/elections/"
]
layout = "elections"
type = "elections"
guide = "series/voting-guides-2024/_index.md"
credits = """
{{<featured/credit
    eyebrow="Reporting"
    name="Stephen Caruso"
    role="Capitol Reporter"
    email="scaruso@spotlightpa.org"
>}}
{{<featured/credit
    name="Angela Couloumbis"
    role="Investigative Reporter"
    email="acouloumbis@spotlightpa.org"
>}}
{{<featured/credit
    name="Kate Huangpu"
    role="Government Reporter"
    email="khuangpu@spotlightpa.org"
>}}
{{<featured/credit
    name="Katie Meyer"
    role="Government Editor/Reporter"
    email="kmeyer@spotlightpa.org"
>}}
{{<featured/credit
    eyebrow="Content and Editing"
    name="Elizabeth Estrada"
    role="Democracy Editor"
    email="eestrada@spotlightpa.org"
>}}
{{<featured/credit
    eyebrow="Layout"
    name="Carlana Johnson"
    role="Director of Technology"
    email="cjohnson@spotlightpa.org"
>}}
{{<featured/credit
    name="Jeff Rummel"
    role="News Developer"
    email="jrummel@spotlightpa.org"
>}}
"""
form ="""
{{<featured/promo-contact-form
  formName="elections"
  hed="Ask Us Your Questions"
  recipient="Angela Couloumbis, Katie Meyer, Kate Huangpu"
  dek="Spotlight PA is covering Pennsylvania’s 2024 primary elections — and we want you to help shape our stories. Tell us what you want to know about those races, and send us any questions you have about the voting system. Use the form to reach our election team."
  submit="Send Inquiry"
>}}
"""
sidebar = """
{{<landing-sidebar>}}
  {{<sidebar-links hed="State Election Resources">}}
    {{<sidebar-link
    title = "Register to vote"
    emoji = ":ballot_box_with_ballot:"
    link = "https://www.pavoterservices.pa.gov/pages/VoterRegistrationApplication.aspx"
    >}}

    {{<sidebar-link
    title = "Check your registration status"
    emoji = ":memo:"
    link = "https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx"
    >}}

    {{<sidebar-link
    title = "Find your polling place"
    emoji = ":round_pushpin:"
    link = "https://www.pavoterservices.pa.gov/Pages/PollingPlaceInfo.aspx"

    >}}

    {{<sidebar-link
    title = "Request a mail ballot"
    emoji = ":email:"
    link = "https://www.pavoterservices.pa.gov/OnlineAbsenteeApplication/"

    >}}

    {{<sidebar-link
    title = "Contact your county election office"
    emoji = ":iphone:"
    link = "https://www.vote.pa.gov/resources/pages/contact-your-election-officials.aspx"
    >}}
  {{</sidebar-links>}}
  {{<sidebar-links hed="Key Dates" event="true">}}
    {{<sidebar-link
    title="Last day to register to vote"
    date="2024-04-08"
    link="https://www.pavoterservices.pa.gov/pages/VoterRegistrationApplication.aspx"
    >}}

    {{<sidebar-link
    title="Last day to apply for mail ballot"
    date="2024-04-16"
    link="https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx"
    >}}

    {{<sidebar-link
    title="Election Day"
    date="2024-04-23"
    link="https://www.pavoterservices.pa.gov/Pages/PollingPlaceInfo.aspx"

    >}}
  {{</sidebar-links>}}
{{</landing-sidebar>}}
"""
donate ="""
{{<donate-slim
    title="Help Empower Voters. Support Our Vital Election Coverage."
    cta="Donate"
>}}
"""
[[blocks]]
title = "PA Election 2024: Voter Guides"
slug = "guides"
layout = "story-collection"
timeFilter = "2023-12-01"
collection = "series/voting-guides-2024/_index.md"

[[blocks]]
layout = "ballyhoo"
id = "candidate-quiz"
image = "2024/03/01k0-8hfj-zvrj-6vd3.jpeg"
hed = "Which Pa. attorney general candidate do you align with?"
dek = "To help highlight the limited differences between the candidates, Spotlight PA has created this quick quiz."
cta = "Take the quiz →"
link = "/elections-2024/candidate-quiz/"

[[blocks]]
layout = "events"
id = "events"
title = "Spotlight PA voter event series"
image = "external/f98jyaza883casbzytgtmqpe6c.jpeg"


[[blocks.entries]]
hed="Broken Primaries"
dek="How our electoral system is fueling partisanship"
date="2024-04-19"
dateVerbose="April 19, 2024 on Zoom"
link="https://www.spotlightpa.org/news/2024/04/pennsylvania-primary-2024-closed-independents-unaffiliated-ballot-pennsylvania-troiano/"
registration="https://spotlightpa.fundjournalism.org/events/?campaign=701Ub000006mhonIAA"

[[blocks.entries]]
hed="PA attorney general Candidates"
dek="Attend a free panel on Pa.’s candidates for attorney general, other row offices"
date="2024-04-11"
dateVerbose="April 11, 2024 on Zoom"
link="https://www.spotlightpa.org/news/2024/04/pennsylvania-primary-election-day-2024-auditor-general-attorney-treasurer-event/"
registration="https://zoom.us/webinar/register/WN_85xV9pUUTIyJ2cR5Unf1CQ"

[[blocks]]
title = "Elections 101"
slug = "elections-101"
layout = "story-collection"
timeFilter = "2023-12-01"
collection = "series/elections-101/_index.md"
collectionReadMore = "Read More Elections 101 Stories"

[[blocks]]
layout = "signup-inline"
hed = "Confidently cast your vote"
dek = "Be the first to read our 2024 voting guides and other election stories by signing up for our free daily newsletter."
cta = "Sign Up"

[[blocks]]
title = "PA Election 2024: More Coverage"
slug = "coverage"
layout = "story-collection"
timeFilter = "2023-12-01"
collection = "topics/elections/_index.md"
collectionReadMore = "Read More PA Election 2024 Stories"

[[blocks]]
title = " Elecciones Pa. 2024: Traducciones al Español "
slug = "espanol"
layout = "story-collection"
timeFilter = "2024-01-01"
collection = "topics/español/_index.md"
collectionReadMore = "Leer Más Historias De La Elección PA 2024"


[[internal-links]]
title = "Voter Guides"
link = "guides"

[[internal-links]]
title = "Candidate Quiz"
link = "candidate-quiz"

[[internal-links]]
title = "Events"
link = "events"

[[internal-links]]
title = "Elections 101"
link = "elections-101"

[[internal-links]]
title = "More Coverage"
link = "coverage"

[[internal-links]]
title = "Ask Us"
link = "contact"

[[internal-links]]
title = "Credits"
link = "credits"

+++

At Spotlight PA, we’re here to help you navigate the Pennsylvania election process — from important voting deadlines to candidate guides to [primers on election misinformation](https://www.spotlightpa.org/series/elections-101/). Our goal is that the resources on this page will give you the critical information you need to confidently cast your vote, and answer some questions you didn’t know you had in the process.

This April, Democrats and Republicans across Pennsylvania will determine which candidates will go on to run in the general election. This includes presidential, congressional (U.S. House and Senate), row office (attorney general, auditor general, and treasurer), and legislative elections. All of these positions hold tremendous power and responsibility, but it’s the statewide races that will have the most direct impact on Pennsylvanians and the ones you will find the most information about on this page.

We invite suggestions for new features for this page and encourage you to check back regularly for all your 2024 election needs. Read more about [how we’re covering the 2024 Pennsylvania election](https://www.spotlightpa.org/news/2024/01/pennsylvania-2024-election-coverage-president-senate-row-offices-pan/).
