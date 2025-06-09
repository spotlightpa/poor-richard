+++
title = "Landing Page Sample"
modal-exclude = true
no-index = true
url = "/design/pages/landing-page"
layout = "page-landing"
donate = """
{{<donate-slim
    title="Slim donation shortcode"
    cta="Customizable CTA"
>}}
"""
supporters = """
{{<supporters
  category="Supporters Data"
  dataSrc="majorDonors"
>}}
"""
testimonials-group = """
{{<testimonials-group
  title="Testimonials Group"
  featuredQuote="Featured Quote."
  featuredCite="Quote Credit">}}
{{<testimonial-item author="Merrill and Nancy Brenner, Macungie, PA, Leaders in Action">}}
Pennsylvanians deserve better than having to rely on shrinking, vanishing, and increasingly biased media and unverified social media postings.  Spotlight PA fills this critical need for trusted investigations and reporting.  We are proud to support this essential organization that stays focused on its mission with unquestionable integrity, is run efficiently and effectively, and achieves results that bring positive changes for Pennsylvanians.{{</testimonial-item>}}

{{<testimonial-item author="Sharon Hyde, State College, PA, Leader in Action">}}
I support Spotlight PA because I believe it is important to have independent investigative journalists covering state and local government. Spotlight needs public support so that it can remain independent.{{</testimonial-item>}}

{{<testimonial-item author="Roger and Karen Klotz, Latrobe, PA, Leaders in Action">}}
We support Spotlight because we believe being informed citizens is essential for a democracy. Spotlight provides essential in-depth articles that my local papers no longer can supply independently.{{</testimonial-item>}}

{{<testimonial-item author="David Martens, York Dispatch, Leader in Action">}}
All Pennsylvanians interested in state government issues are very well served by Spotlight PA reporting teams. Their in-depth and timely reporting informs readers truthfully about statewide issues affecting daily life. Spotlight PA is a trustworthy news source in this era of misinformation and disinformation.{{</testimonial-item>}}
{{<testimonial-item author="Betsey Useem, Merion Station, PA, Leader in Action">}}
In an era where fraud and dishonesty among public officials (and their supporters) have become more frequent and blatant, it is critical to have a crusading press focused on exposing wrongdoing. This is especially true in Pennsylvania where regulations are lax or poorly enforced. The expertise and resources of Spotlight PA are essential to good government in this state.{{</testimonial-item>}}
{{</testimonials-group>}}
"""

form ="""
{{<form-contact-large
  hed="Contact Form"
  dek="Contact form allows you to specify recipient to bypass the Subject select menu and set 'show-anon' to true and display an anonymity checkbox"
>}}
"""
newsletter = """
{{<newsletter/pennstatealert-full-form>}}
"""
[[blocks]]
layout = "signup"
hed = "Heading"
cta = "Action"
hiddenField = "newsletter/pennstatealert-hidden.html"
gaCategory = "newsletters:pennstatealert"
gaForm = "newsletters:pennstatealert-full"

[[blocks]]
title = "Text Block Two"
layout = "text-2"
copy="""
  {{<featured/large>}}Spotlight PA is a nonpartisan, independent newsroom paid for by grants from foundations and donations from individuals committed to robust investigative reporting. Spotlight PA editors and reporters operate independently of our funders and maintain editorial control over all of the content they produce. Funders do not have input into the selection of which stories Spotlight PA pursues or the reporting process for those stories. Funders do not review any content before publication or have any special access to reporters or newsroom leadership. In short, we answer to you, the public.{{</featured/large>}}

  {{<featured/large>}}Funds for Spotlight PA are donated to the nonprofit <a href="https://www.lenfestinstitute.org/" class="text-yellow">Lenfest Institute for Journalism</a>, which then directs them to our work. As part of our gift acceptance policy, and consistent with our promise to be fully transparent, we do not accept anonymous donations.{{</featured/large>}}

"""
[[blocks.actions]]
url = "/design/"
copy = "Action in block two"

[[blocks]]
title = "Promo Block"
layout = "promo"

[[blocks.entries]]
image = "2022/12/01hs-hn2r-zez7-rm35.png"
hed = """
Option One
"""
body = "Interested in becoming a champion of Spotlight PA at a higher level?"
actionUrl = "https://checkout.fundjournalism.org/memberform?org_id=spotlightpa&theme=leaders"
actionText = "Become a leader →"
url = "/support/leaders-in-action"

[[blocks.entries]]
image = "2022/06/01hb-4958-4rxz-4t0q.png"
hed = "Option Two"
body = "Want to support our investigative journalism about Penn State and our State College regional bureau?"
actionUrl = "https://checkout.fundjournalism.org/memberform?org_id=spotlightpa&theme=centrecounty&campaign=7015G0000013pZTQAY"
actionText = "Support the Bureau →"
url = "/support/"

[[blocks]]
layout = "text-3"
title = "Text Block Three"
show_partners = 4
copy = """

  Spotlight PA’s unique model of public-service journalism relies on the generous support of individuals and institutions who understand the vital importance of Spotlight PA’s work to the future of Pennsylvania. The newsroom is supported by a dedicated group of local and national foundations, media partners, individual major donors (“Leaders in Action”), and thousands of readers from across Pennsylvania (“members”). Consistent with our mission, we disclose the source of every dollar we receive, and we do not accept anonymous gifts.

  ## Learn more about who supports our work

  [Institutional funders and members since launch →](/support/funders-and-members#major-donors-and-funders)

  [Leaders in Action →](/support/leaders-in-action/#our-current-leaders)
"""

[[blocks.entries]]
link = "/donate/"
name = "How to Give to Spotlight PA"

[[blocks.entries]]
link = "/about/partners/"
name = "Partners"

[[blocks.entries]]
link = "/about/faq/"
name = "FAQ"

[[blocks.entries]]
link = "/about/statecollege/"
name = "State College Regional Bureau"

[[blocks]]
layout = "series"
title = "Series"
series = ["Standard Series", "The PSERS Scandal"]
[blocks.cta]
url = "/investigations/"
copy = "See More About Our Impact"
+++

# Heading One (h1)

Lorem ipsum dolor sit amet, *consectetur* adipisicing elit, sed do eiusmod
tempor incididunt ut **labore et dolore magna aliqua**. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. ***Duis aute irure dolor*** in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. ~~Excepteur sint occaecat~~ cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Heading Two (h2)

Lorem ipsum dolor sit amet, *consectetur* adipisicing elit, sed do eiusmod
tempor incididunt ut **labore et dolore magna aliqua**. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat.

---

***Duis aute irure dolor*** in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. ~~Excepteur sint occaecat~~ cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Third Level Heading (h3)

unordered list:

* item-1
  * sub-item-1
  * sub-item-2
- item-2
  - sub-item-3
  - sub-item-4
+ item-3
  + sub-item-5
  + sub-item-6


ordered list:

1. item-1
   1. sub-item-1
   2. sub-item-2
2. item-2
   1. sub-item-3
   2. sub-item-4
3. item-3

#### Heading Four (h4)

##### Fifth Level Heading (h5)

###### Heading Level Six (h6)

Let us do some links - this for example: https://github.com/MinhasKamal/github-markdown-syntax is **NOT** a link but this: is [GitHub](https://github.com/MinhasKamal/github-markdown-syntax)
