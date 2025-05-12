+++
internal-id = "ELEXCENTER2025"
image = "2024/04/01k1-fvsv-86f6-4s99.jpeg"
image-description = "Pennsylvania’s capitol building in Harrisburg on the morning of Election Day. November 3, 2020."
image-credit = "Illustration by Leise Hook / For Spotlight PA"
kicker = "Elections"
title = "Pennsylvania Primary Election 2025"
title-tag = "Official Pennsylvania Election Center 2025"
description = "Spotlight PA is here to help you navigate the Pennsylvania election process — from important voting deadlines to the different ways to cast a ballot to explainers on relevant legal rulings and how they affect you."
dek = "2025 is a municipal election year, and ballots will vary with local races depending on where you live."
extended-kicker = "Pa. Election Center 2025"
linktitle = "Everything you need to prepare for Pa.’s 2025 election"
blurb = "Spotlight PA is here to help you navigate the Pennsylvania election process — from important voting deadlines to the different ways to cast a ballot to explainers on relevant legal rulings and how they affect you."
url = "/elections/"
aliases = [
    "/election/",
    "/elections-2023/",
    "/elections-2025/",
    "/elections/contest/",
]
layout = "page-landing"
type = "elections"
guide = "series/voting-guides-2025/_index.md"
takeover = """
{{<featured/main-takeover
  title = "Pennsylvania Primary Election 2025"
  dek = "Democrats and Republicans in Pennsylvania will vote for their parties’ candidates in the municipal primary election on May 20."
  image = "2024/04/01k1-fvsv-86f6-4s99.jpeg"
>}}

{{</featured/main-takeover>}}"""
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
    eyebrow="Illustration"
    name="Leise Hook"
    role="For Spotlight PA"
>}}
{{<featured/credit
    eyebrow="Layout"
    name="Carlana Johnson"
    role="Director of Technology"
    email="cjohnson@spotlightpa.org"
>}}
{{<featured/credit
    name="Alexandra Harris"
    role="Newsroom Developer"
    email="aharris@spotlightpa.org"
>}}
"""
form ="""
{{<form-contact-large
  formName="elections"
  hed="Ask Us Your Questions"
  recipient="Angela Couloumbis, Katie Meyer, Kate Huangpu"
  dek="Spotlight PA is covering Pennsylvania’s 2025 primary elections — and we want you to help shape our stories. Tell us what you want to know about those races, and send us any questions you have about the voting system. Use the form to reach our election team."
  submit="Send Inquiry"
>}}
"""
sidebar = """
<link
  rel="stylesheet"
  href="https://unpkg.com/add-to-calendar-button@1.14.6/assets/css/atcb.min.css"
/>
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
    link = "https://www.pavoterservices.pa.gov/OnlineAbsenteeApplication/#/OnlineMailInBegin"

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
    date="2025-05-05"
    link="https://www.pavoterservices.pa.gov/pages/VoterRegistrationApplication.aspx"
    >}}

    {{<sidebar-link
    title="Last day to apply for mail ballot"
    date="2025-05-13"
    link="https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx"
    >}}

    {{<sidebar-link
    title="Election Day"
    date="2025-05-20"
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
layout = "internal-links"

[[blocks.link]]
title = "Voter Guides"
link = "guides"

[[blocks.link]]
title = "Election Assistant"
link = "election-assistant"

[[blocks.link]]
title = "More Coverage"
link = "coverage"

[[blocks.link]]
title = "Quiz"
link = "mayor-quiz"

[[blocks.link]]
title = "Español"
link = "espanol"

[[blocks.link]]
title = "Ask Us"
link = "contact"

[[blocks.link]]
title = "Credits"
link = "credits"

[[blocks]]
title = "PA Election 2025: Voter Guides"
slug = "guides"
layout = "story-collection"
timeFilter = "2024-12-31"
collection = "series/voting-guides-2025/_index.md"
collectionReadMore = "Read More Voter Guides"

[[blocks]]
layout = "ballyhoo"
id = "election-assistant"
image = "2023/11/01jn-4rb9-2sg8-pwpc.jpeg"
hed = "Ask Spotlight PA’s 2025 election assistant your questions"
dek = "Have questions about the 2025 election in Pennsylvania? Ask our new AI-powered assistant and get a trusted answer based on our reporting."
cta = "Try Our Election Assistant →"
link = "/elections/assistant/"

[[blocks]]
layout = "signup-inline"
hed = "Confidently cast your vote"
dek = "Be the first to read our 2025 voting guides and other election stories by signing up for our free daily newsletter."
cta = "Sign Up"

[[blocks]]
title = "PA Election 2025: More Coverage"
slug = "coverage"
layout = "story-collection"
timeFilter = "2024-12-31"
collection = "topics/elections/_index.md"
collectionReadMore = "Read More PA Election 2025 Stories"

[[blocks]]
layout = "ballyhoo"
id = "mayor-quiz"
image = "2025/04/01m0-g0zk-wp3n-9vnt.jpeg"
hed = "Your Next Mayor"
dek = "Use our interactive tool to see which candidates for Pittsburgh mayor most closely align with what matters to you."
cta = "Take Our Quiz →"
link = "/news/2025/05/pittsburgh-mayor-election-2025-candidates-quiz/"

[[blocks]]
title = "Elecciones Pa. 2025: Traducciones al Español"
id = "espanol"
slug = "espanol"
layout = "story-collection"
timeFilter = "2025-01-01"
collection = "topics/español/_index.md"
collectionReadMore = "Leer Más Historias De La Elección PA 2025"

[[blocks]]
layout = "ballyhoo"
id = "college-quiz"
image = "2025/04/01m0-52z0-0x40-19w0.jpeg"
hed = "Pop Quiz"
dek = "Use our interactive tool to see which candidates for State College Area School District Board of Directors most closely align with what matters to you."
cta = "Take Our Quiz →"
link = "/statecollege/2025/05/pennsylvania-state-college-school-board-scasd-primary-election-2025-anderson-huff-barlow-black-desmarais-mcternan-sogor-quiz/"

[[blocks]]
layout = "contact"
slug = "contact"
hed = "Ask Us Your Questions"
showAnon = false
submit = "Submit"
recipient = "Elections"
dek = "What do you want to know about Pennsylvania elections? Use the form to ask us."
placeholder = "What you want to know about Pennsylvania elections…"
+++


Spotlight PA is here to help you navigate the Pennsylvania election process — from important voting deadlines to the different ways to cast a ballot to explainers on relevant legal rulings and how they affect you. Our goal is that the resources on this page will give you the critical information you need to confidently cast your vote, and answer some questions you didn’t know you had in the process.

This May, Democrats and Republicans across Pennsylvania will cast their ballots in municipal races. Depending on where you live, your ballot could include races for mayor, school board, city council, various judicial offices, district attorney, and more. While we’re not able to cover the thousands of municipal races on the ballot this year, we’ll have voter guides, including one to help you vet candidates, along with some coverage on select local races in Berks County and the State College area. 

We invite suggestions for new features for this page and encourage you to check back regularly for all your 2025 election needs. Read more about [how we’re covering the 2025 Pennsylvania election](https://www.spotlightpa.org/news/2025/04/pennsylvania-2025-primary-election-coverage-municipal/).



