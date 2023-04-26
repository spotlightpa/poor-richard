+++
title = "Contact Forms"
modal-exclude = true
no-index = true
url = "design/forms/contact"
layout = "page-landing"
newsletter = """
"""
featured-newsletter = """
"""
+++

<div
  class="
    border-b border-s-4 mt-10 space-y-4 p-4 font-sans
"
>
  <h3 class="mb-8 font-sans text-3xl italic leading-none">
    Tips Embed
  </h3>

  <script src="https://spotlightpa.org/embed.js" async></script><div data-spl-embed-version="1" data-spl-src="https://spotlightpa.org/embeds/tips/?tip_text=Customizable%20Tips%20Teaser&flag_text=Customizable%20Eyebrow"></div>


</div>
<div
  class="
    border-b border-s-4 mt-10 space-y-4 p-4
"
>
  <h3 class="mb-8 font-sans text-3xl italic leading-none">
    Promo Tips Shortcode
  </h3>

{{<featured/promo-contact-form
  hed="Send A Tip"
  show-anon=true
  recipient="Wyatt Massey"
  dek="Toggle Show Anonymous to true to present checkbox to users."
>}}
</div>
<div
  class="
    border-b border-s-4 mt-10 space-y-4 p-4 font-sans
"
>
  <h3 class="mb-8 font-sans text-3xl italic leading-none">
    Contact Form Shortcode
  </h3>
{{<featured/promo-contact-form
  hed="Contact Form"
  dek="For news tips, please see [our tips page](/tips/). For technical problems, please email [webmaster@spotlightpa.org](mailto:webmaster@spotlightpa.org). For general comments, please use the form below. Other submissions, including press releases or events, will not receive a response."
  submit="Send Inquiry"
>}}
</div>