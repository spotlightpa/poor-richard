+++
internal-id = "ELEXCENTER2024"
image = "2024/04/01k1-fvsv-86f6-4s99.jpeg"
image-description = "Pennsylvania’s capitol building in Harrisburg on the morning of Election Day. November 3, 2020."
image-credit = "Illustration by Leise Hook / For Spotlight PA"
kicker = "Elections"
title = "Pennsylvania General Election 2024"
title-tag = "Official Pennsylvania Election Center 2024"
description = "Full coverage of Pennsylvania's elections, including how to vote, where to vote, polling places, sample ballots, candidate guides, and more."
dek = "Candidates for president, U.S. House and Senate, row offices, and more will appear on the Nov. 5 ballot."
extended-kicker = "Pa. Election Center 2024"
linktitle = "Everything you need to prepare for Pa.’s 2024 election"
blurb = "Spotlight PA wants to empower voters to make an informed decision on May 16. Our new Election Center features key dates, a campaign finance tracker, in-depth coverage, and more."
url = "/elections-2024/"
aliases = [
  "/pa-election-2024/",
  "/elections/2024/",
]
layout = "page-landing"
type = "elections"
guide = "series/voting-guides-2024/_index.md"
takeover = """
{{<featured/main-takeover
  title = "Pennsylvania General Election 2024"
  dek = "Candidates for president, U.S. House and Senate, row offices, and more will appear on the November ballot."
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
"""
form ="""
{{<form-contact-large
  formName="elections"
  hed="Ask Us Your Questions"
  recipient="Angela Couloumbis, Katie Meyer, Kate Huangpu"
  dek="Spotlight PA is covering Pennsylvania’s 2024 primary elections — and we want you to help shape our stories. Tell us what you want to know about those races, and send us any questions you have about the voting system. Use the form to reach our election team."
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
    date="2024-10-21"
    link="https://www.pavoterservices.pa.gov/pages/VoterRegistrationApplication.aspx"
    >}}

    {{<sidebar-link
    title="Last day to apply for mail ballot"
    date="2024-10-29"
    link="https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx"
    >}}

    {{<sidebar-link
    title="Election Day"
    date="2024-11-05"
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
title = "Sample Ballot"
link = "sample-ballot"

[[blocks.link]]
title = "Election Assistant"
link = "election-assistant"

[[blocks.link]]
title = "Events"
link = "event-promo"

[[blocks.link]]
title = "Quiz"
link = "quiz"

[[blocks.link]]
title = "Elections 101"
link = "elections-101"

[[blocks.link]]
title = "More Coverage"
link = "coverage"

[[blocks.link]]
title = "Ask Us"
link = "contact"

[[blocks.link]]
title = "Credits"
link = "credits"

[[blocks]]
title = "PA Election 2024: Voter Guides"
slug = "guides"
layout = "story-collection"
timeFilter = "2023-12-01"
collection = "series/voting-guides-2024/_index.md"
collectionReadMore = "Read More Voter Guides"

[[blocks]]
layout = "text-3"
id = "sample-ballot"
title = "Who’s on your PA ballot"
copy = """
Enter your address and get a customized list of races — from president to state House — you’ll consider this fall. The sample ballot does not feature local ballot initiatives. For that information, consult your <a href="https://www.pa.gov/en/agencies/vote/contact-us/contact-your-election-officials.html">county election office</a>.

<script src="https://viz-sample-ballot-2024.data.spotlightpa.org/embed.js" defer></script><div data-spl-interactive="viz-sample-ballot-2024"></div><small><a href="https://viz-sample-ballot-2024.data.spotlightpa.org">Click here if you have trouble loading your sample ballot</a></small>
"""

[[blocks]]
layout = "ballyhoo"
id = "election-assistant"
image = "2023/11/01jn-4rb9-2sg8-pwpc.jpeg"
hed = "Ask Spotlight PA’s 2024 election assistant your questions"
dek = "Have questions about the 2024 election in Pennsylvania? Ask our new AI-powered assistant and get a trusted answer based on our reporting."
cta = "Try Our Election Assistant →"
link = "/elections/assistant/"

[[blocks]]
layout = "events"
id = "event-promo"
title = "Spotlight PA voter event series"
image = "external/f98jyaza883casbzytgtmqpe6c.jpeg"

[[blocks.entries]]
hed = "How accessible are Pennsylvania’s elections?"
dek = "Join us for a live panel discussion on the accessibility of Pennsylvania’s elections and how you can protect your right to vote."
link = "/news/2024/10/pennsylvania-elections-accessibility-voting-rights/"

[[blocks.entries]]
hed="Row Races"
dek="Everything you need to know about the row office candidates’ histories and campaign pledges, and the offices they hope to win."
link="/news/2024/09/pennsylvania-row-office-election-candidates-2024-attorney-general-auditor-treasurer/"

[[blocks]]
layout = "ballyhoo"
id = "quiz"
image = "2024/10/01kg-dw76-v4hn-egrq.jpeg"
hed = "Find Your Candidate Match"
dek = "Use our interactive tool to see which major party candidates for Pennsylvania attorney general, auditor general, and treasurer most closely align with what matters to you."
cta = "Take Our Quizzes →"
link = "/elections-2024/candidate-quiz/"

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
title = "Elecciones Pa. 2024: Traducciones al Español"
slug = "espanol"
layout = "story-collection"
timeFilter = "2024-06-01"
collection = "topics/español/_index.md"
collectionReadMore = "Leer Más Historias De La Elección PA 2024"

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

Spotlight PA is here to help you navigate the Pennsylvania election process — from important voting deadlines to candidate guides to [primers on election misinformation](https://www.spotlightpa.org/series/elections-101/). Our goal is that the resources on this page will give you the critical information you need to confidently cast your vote, and answer some questions you didn’t know you had in the process.

This November, voters across Pennsylvania will cast their ballots in statewide and national races. This includes presidential, congressional (U.S. House and Senate), row office (attorney general, auditor general, and treasurer), and legislative elections. All of these positions hold tremendous power and responsibility, but it’s the statewide races that will have the most direct impact on Pennsylvanians and the ones you will find the most information about on this page.

We invite suggestions for new features for this page and encourage you to check back regularly for all your 2024 election needs. Read more about [how we’re covering the 2024 Pennsylvania election](https://www.spotlightpa.org/news/2024/01/pennsylvania-2024-election-coverage-president-senate-row-offices-pan/).
