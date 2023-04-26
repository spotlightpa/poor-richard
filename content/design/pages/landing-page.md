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
supplemental = """
{{<supplemental>}}
## Supplemental Shortcode

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non tellus orci ac auctor augue mauris augue. Eu nisl nunc mi ipsum faucibus. Maecenas pharetra convallis posuere morbi. 

Massa vitae tortor condimentum lacinia quis vel eros. Ipsum nunc aliquet bibendum enim facilisis. Nisl suscipit adipiscing bibendum est ultricies integer quis. Curabitur vitae nunc sed velit dignissim sodales. Pharetra sit amet aliquam id diam maecenas ultricies. Imperdiet dui accumsan sit amet nulla facilisi morbi tempus iaculis. Augue mauris augue neque gravida in fermentum et sollicitudin. Amet luctus venenatis lectus magna fringilla urna. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin. Et malesuada fames ac turpis. Quam id leo in vitae turpis. Pellentesque elit eget gravida cum sociis natoque.

Aenean sed adipiscing diam donec. Tellus in hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Euismod elementum nisi quis eleifend quam adipiscing vitae. Nunc sed velit dignissim sodales. Mauris in aliquam sem fringilla ut morbi tincidunt augue. Duis convallis convallis tellus id interdum velit. 

Magna fermentum iaculis eu non. Faucibus in ornare quam viverra orci sagittis eu volutpat. At erat pellentesque adipiscing commodo elit. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Turpis egestas integer eget aliquet nibh praesent tristique. Semper quis lectus nulla at volutpat diam ut.

Turpis nunc eget lorem dolor sed viverra ipsum. Lobortis feugiat vivamus at augue eget arcu dictum varius duis. Quisque sagittis purus sit amet volutpat consequat mauris. Viverra nibh cras pulvinar mattis nunc sed blandit libero volutpat. Quis enim lobortis scelerisque fermentum dui faucibus in. Fames ac turpis egestas sed tempus urna et pharetra pharetra. Nisl nisi scelerisque eu ultrices vitae. Lectus vestibulum mattis ullamcorper velit sed ullamcorper. Felis bibendum ut tristique et. Ac turpis egestas sed tempus urna et pharetra. Lectus urna duis convallis convallis tellus. A cras semper auctor neque vitae. [Ullamcorper velit](//spotlightpa.org) sed ullamcorper morbi tincidunt ornare. Libero volutpat sed cras ornare arcu dui.


*— Accepts **markdown***
{{</supplemental>}}"""

credit = """
{{<featured/credit-long
hed="Custom Credit-Long Shortcode"
name="Wyatt Massey"
role="Capitol Reporter"
email="wmassey@spotlightpa.org"
bio="Wyatt Massey investigates how Penn State University operates, including its influence in the region and state. He previously covered faith and religion for the Chattanooga Times Free Press in Southeast Tennessee."
shortcode="{{<supplemental>}}"
>}}"""

form ="""
{{<featured/promo-contact-form
  hed="Contact Form"
  dek="Contact form allows you to specify recipient to bypass the Subject select menu and set 'show-anon' to true and display an anonymity checkbox"
>}}
"""
newsletter = """
{{<newsletter/pennstatealert-full-form>}}
"""
[[blocks]]
title = "Text Block Two"
layout = "text-2"
copy="""
  {{<featured/large>}}Spotlight PA is a nonpartisan, independent newsroom paid for by grants from foundations and donations from individuals committed to robust investigative reporting. Spotlight PA editors and reporters operate independently of our funders and maintain editorial control over all of the content they produce. Funders do not have input into the selection of which stories Spotlight PA pursues or the reporting process for those stories. Funders do not review any content before publication or have any special access to reporters or newsroom leadership. In short, we answer to you, the public.{{</featured/large>}}

  {{<featured/large>}}Funds for Spotlight PA are donated to the nonprofit <a href="https://www.lenfestinstitute.org/" class="text-yellow">Lenfest Institute for Journalism</a>, which then directs them to our work. As part of our gift acceptance policy, and consistent with our promise to be fully transparent, we do not accept anonymous donations.{{</featured/large>}}

"""
[blocks.cta]
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
url = "/support/state-college"

[[blocks]]
layout = "text-3"
title = "Text Block Three"
show_partners = 4
copy = """

  Spotlight PA’s unique model of public-service journalism relies on the generous support of individuals and institutions who understand the vital importance of Spotlight PA’s work to the future of Pennsylvania. The newsroom is supported by a dedicated group of local and national foundations, media partners, individual major donors (“Leaders in Action”), and thousands of readers from across Pennsylvania (“members”). Consistent with our mission, we disclose the source of every dollar we receive, and we do not accept anonymous gifts.
  
  ## Learn more about who supports our work

  [Institutional funders and members since launch →](/support/funders-and-members#major-donors-and-funders)

  [Leaders in Action →](/support/leaders-in-action/#our-current-leaders)

  [State College regional bureau supporters →](/support/state-college/#state-college-bureau-donors)
"""

[[blocks]]
layout = "links"
title = "Links Block"
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

