+++
title = "Landing Page Sample"
modal-exclude = true
no-index = true
url = "/design/pages/landing-page"
layout = "page-landing"
type = "root"

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
supplemental = """
{{<supplemental>}}
## You can help us cover Penn State

Unlike most public universities, Penn State is largely exempt from open records laws despite receiving taxpayer money.

Beyond disclosing some basic financial information, the university mostly operates outside of the public eye. For example, Penn State does not have to make public the contracts it signs or how money is spent.

Our success covering Penn State — and the public’s ability to understand what is going on inside a nearly $9 billion institution with tremendous influence in the state — relies on you.

Many of the best investigative stories are possible because of people inside an institution who know what is happening and want to solve a problem or put an end to waste, fraud, or abuse.

Often, primary source records — documents such as memos, emails, reports, and more — are vital to a successful investigation. Which is why **[we’ve established a few secure ways](https://www.spotlightpa.org/tips)** for you to share documents with us.

You can do so by signing up for a free account and using **[Protonmail](https://account.proton.me/signup)** (write to us at **[spotlightpa@protonmail.com](mailto:spotlightpa@protonmail.com)**) or by sending snail mail to Spotlight PA State College, 210 W. Hamilton Ave., #331, State College PA, 16801.

You can also connect with me on **[Twitter](https://twitter.com/News4Mass)**, over **[email](mailto:wmassey@spotlightpa.org)**, or on Signal, an encrypted phone messaging app, at 445-236-0562.

It’s important you know that we promise confidentiality if you share documents with us. It can be your only interaction with us, or it can be the first of many. You can provide follow-up contact information, or choose not to. 

The best way to start is with a simple conversation, even if it’s off the record (meaning it’s not for publication). I look forward to hearing from you.

*— **Wyatt Massey**, Penn State investigative reporter*
{{</supplemental>}}"""

credit = """
{{<featured/credit-long
hed="Meet Spotlight PA’s Penn State Investigative Reporter"
name="Wyatt Massey"
role="Capitol Reporter"
email="wmassey@spotlightpa.org"
bio="Wyatt Massey investigates how Penn State University operates, including its influence in the region and state. He previously covered faith and religion for the Chattanooga Times Free Press in Southeast Tennessee."
shortcode="{{<supplemental>}}"
>}}"""

form ="""
{{<featured/promo-tips-form
  hed="Send A Tip"
  dek="Help support the Penn State Transparency Tracker by submitting tips or questions to reporter Wyatt Massey — via the submission form, email at [wmassey@spotlightpa.org](mailto:wmassey@spotlightpa.org), or one of the methods described below."
>}}
"""
newsletter = """
{{<newsletter/pennstatealert-full-form>}}
"""
[[blocks]]
title = "More Ways To Give"
layout = "promo"

[[blocks.entries]]
image = "2022/12/01hs-hn2r-zez7-rm35.png"
hed = """
Become a 
Leader in Action
"""
body = "Interested in becoming a champion of Spotlight PA at a higher level?"
actionUrl = "https://checkout.fundjournalism.org/memberform?org_id=spotlightpa&theme=leaders"
actionText = "Become a leader →"
url = "/support/leaders-in-action"

[[blocks.entries]]
image = "2022/06/01hb-4958-4rxz-4t0q.png"
hed = "Support Our State College Bureau"
body = "Want to support our investigative journalism about Penn State and our State College regional bureau?"
actionUrl = "https://checkout.fundjournalism.org/memberform?org_id=spotlightpa&theme=centrecounty&campaign=7015G0000013pZTQAY"
actionText = "Support the Bureau →"
url = "/support/state-college"

[[blocks]]
layout = "text-3"
title = "Who Supports Us?"
show_partners = 4
copy = """

  <p class="md:leading-relaxed">Spotlight PA’s unique model of public-service journalism relies on the generous support of individuals and institutions who understand the vital importance of Spotlight PA’s work to the future of Pennsylvania. The newsroom is supported by a dedicated group of local and national foundations, media partners, individual major donors (“Leaders in Action”), and thousands of readers from across Pennsylvania (“members”). Consistent with our mission, we disclose the source of every dollar we receive, and we do not accept anonymous gifts.</p>
  
  ## Learn more about who supports our work

  [Institutional funders and members since launch →](/support/funders-and-members#major-donors-and-funders)

  [Leaders in Action →](/support/leaders-in-action/#our-current-leaders)

  [State College regional bureau supporters →](/support/state-college/#state-college-bureau-donors)
"""

[[blocks]]
title = "Transparency"
layout = "text-2"
copy="""
  {{<featured/large>}}Spotlight PA is a nonpartisan, independent newsroom paid for by grants from foundations and donations from individuals committed to robust investigative reporting. Spotlight PA editors and reporters operate independently of our funders and maintain editorial control over all of the content they produce. Funders do not have input into the selection of which stories Spotlight PA pursues or the reporting process for those stories. Funders do not review any content before publication or have any special access to reporters or newsroom leadership. In short, we answer to you, the public.{{</featured/large>}}

  {{<featured/large>}}Funds for Spotlight PA are donated to the nonprofit <a href="https://www.lenfestinstitute.org/" class="text-yellow">Lenfest Institute for Journalism</a>, which then directs them to our work. As part of our gift acceptance policy, and consistent with our promise to be fully transparent, we do not accept anonymous donations.{{</featured/large>}}
"""

[[blocks]]
layout = "links"
title = "About"
copy = "Spotlight PA was founded to address a crisis in journalism in Pennsylvania: the ongoing and rapid decline of corporate-owned legacy news outlets, which is greatly diminishing access to trusted, contextual, and factual reporting across the state. With support from foundations, individual members, and more, Spotlight PA is uncovering stories that would otherwise go untold and cutting through partisanship and misinformation to deliver trusted, reliable journalism at no cost to all in Pennsylvania. Since its inception in 2019, Spotlight PA has become a leading national model for independent, collaborative journalism that empowers residents and gets results. Its work has won numerous state and national awards and driven meaningful change and policy reforms in the state capital and beyond."


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

[[blocks]]
title = "Text Block 2"
layout = "text-2"
copy="We’ve assembled some of the most talented reporters from across Pennsylvania and the United States to focus on issues and stories that would otherwise go untold. In short, they work for you, the public. Meet our staff, and learn how you can contact them:"
[blocks.cta]
url = "/about/staff/"
copy = "See More About Our Staff"

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

You may also want some images right in here like ![GitHub Logo](https://cloud.githubusercontent.com/assets/5456665/13322882/e74f6626-dc00-11e5-921d-f6d024a01eaa.png "GitHub") - you can do that but I would recommend you to use the component "image" and simply split your text.

###### Heading Level Six (h6)

Let us do some links - this for example: https://github.com/MinhasKamal/github-markdown-syntax is **NOT** a link but this: is [GitHub](https://github.com/MinhasKamal/github-markdown-syntax)

