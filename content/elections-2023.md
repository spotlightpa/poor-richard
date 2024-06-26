+++
internal-id = "ELEXCENTER"
image = "external/cwszvjdnvs3e3q3ge64y5wjjx0.jpeg"
image-description = "Pennsylvania’s capitol building in Harrisburg on the morning of Election Day. November 3, 2020."
image-credit = "Amanda Berg / For Spotlight PA"
kicker = "Elections"
title = "Pennsylvania Election 2023"
title-tag = "Official Pennsylvania Election Center 2023"
description = "Full coverage of Pennsylvania's elections, including how to vote, where to vote, polling places, sample ballots, candidate guides, and more."
dek = "Candidates for Pennsylvania Supreme Court, Commonwealth Court, and more will appear on the Nov. 7 ballot."
extended-kicker = "Pa. Election Center 2023"
linktitle = "Everything you need to prepare for Pa.’s 2023 election"
blurb = "Spotlight PA wants to empower voters to make an informed decision on May 16. Our new Election Center features key dates, a campaign finance tracker, in-depth coverage, and more."
url = "/elections-2023/"
layout = "page-landing"
type = "elections"
guide = "series/voting-guides-2023/_index.md"
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
  dek="Spotlight PA is covering Pennsylvania's 2023 judicial and municipal elections — and we want you to help shape our stories. Tell us what you want to know about those races, and send us any questions you have about the voting system. Use the form to reach our election team."
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
    date="2023-10-23"
    link="https://www.pavoterservices.pa.gov/pages/VoterRegistrationApplication.aspx"
    >}}

    {{<sidebar-link
    title="Last day to apply for mail ballot"
    date="2023-10-31"
    link="https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx"
    >}}

    {{<sidebar-link
    title="Election Day"
    date="2023-11-07"
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
title = "Issues"
link = "court-tool"

[[blocks.link]]
title = "Election Event Series"
link = "events"

[[blocks.link]]
title = "Coverage"
link = "coverage"

# [[internal-links]]
# title = "Español"
# link = "#espan"

[[blocks.link]]
title = "Ask Us"
link = "contact"

[[blocks.link]]
title = "Credits"
link = "credits"

[[blocks]]
title = "PA Election 2023: Candidate and Voting Guides"
slug = "guides"
layout = "story-collection"
timeFilter = "2023-08-01"
collection = "series/voting-guides-2023/_index.md"

[[blocks]]
layout = "ballyhoo"
id = "court-tool"
image = "2023/10/01jh-nnsg-6zn1-3c7b.jpeg"
hed = "See how electing judges affects you and the issues you care about most"
dek = "From abortion to civil liberties to education, Pennsylvania judges regularly shape, define, and affect policies on some hot-button topics."
cta = "Use the tool →"
link = "/court-tool/"


[[blocks]]
layout = "events"
id = "events"
title = "Spotlight PA voter event series"
image = "external/f98jyaza883casbzytgtmqpe6c.jpeg"

[[blocks.entries]]
hed="Voter Ready"
dek="Learn about your voting rights and ask your remaining questions ahead of Election Day. Registration coming soon."
date="2023-11-02"
dateVerbose="Nov. 2, 2023 on Zoom"
link="https://www.spotlightpa.org/news/2023/10/pennsylvania-election-2023-voting-rights-event/"

[[blocks.entries]]
hed="Result Review"
dek="And the winners are … Join us to learn about how the judicial election results will influence politics and policy in the years to come. Registration coming soon."
date="2023-11-16"
dateVerbose="Nov. 16, 2023 on Zoom"
link="https://www.spotlightpa.org/news/2023/10/pennsylvania-election-2023-results-event/"

[[blocks]]
layout = "signup-inline"
hed = "Sign Up For Our Free Newsletters "
dek = "Get every Spotlight PA story and the best investigative journalism from across Pa."
cta = "Sign Up"


[[blocks]]
title = "PA Election 2023: More Coverage "
slug = "coverage"
layout = "story-collection"
timeFilter = "2023-08-01"
collection = "topics/elections/_index.md"
collectionReadMore = "Read More PA Election 2023 Stories"

[[blocks]]
title = " Elecciones Pa. 2023: Traducciones al Español "
slug = "espanol"
layout = "story-collection"
timeFilter = "2023-08-01"
collection = "topics/español/_index.md"
collectionReadMore = "Leer Más Historias De La Elección PA 2023"
+++

At Spotlight PA, we’re here to help you navigate the Pennsylvania election process — from important voting deadlines to candidate guides to primers on obscure government processes.

Our goal is that the resources on this page will give you the critical information you need in order to confidently cast your vote, and answer some questions you didn’t know you had in the process.

This November, voters across Pennsylvania will pick a new state Supreme Court justice and new judges to sit on Commonwealth and Superior Courts. They will also decide whether two judges on Superior Court should get another term. These positions hold a lot of power and hand down consequential decisions on everything from school funding to elections to abortion access.

Further down the ballot are local and regional judicial contests as well as municipal races for local officials and school board members. These elected officials have regular, close contact with communities and can use that power to directly affect people’s lives for good (and bad).

We [invite suggestions](mailto:eestrada@spotlightpa.org) for new features for this page and encourage you to check back regularly for all your 2023 election needs. Read more about [how we’re covering the 2023 Pennsylvania election](https://www.spotlightpa.org/news/2023/09/pennsylvania-general-election-2023-supreme-superior-commonwealth-court-coverage-guide/).
