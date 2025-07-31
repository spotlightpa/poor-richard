+++
title = "Newsletter Embed"
type = "embed-page"

embed-partial = "newsletter.html"
aliases = ["/embeds/newsletter-covid/"]

[[page-query-params]]
name = "cta"
placeholder = "Sign up for <i>PA Post</i> today!"
hint = "Override text for call to action"

[[page-query-params]]
name = "eyebrow"
placeholder = "Newsletters"
hint = "Override text for eyebrow"

[[page-query-params]]
name = "button"
placeholder = "Sign Up"
hint = "Override text for button"

[[page-query-params]]
name = "preselect"
hint = "Newsletter"
options=[
  {name="Default (PA Post)", value=""},
  {name="PA Post", value="papost"},
  {name="The Investigator", value="investigator"},
  {name="PA Local", value="palocal"},
  {name="Talk of the Town", value="talkofthetown"},
  {name="Good Day, Berks", value="berks"},
  {name="Penn State Alerts", value="pennstatealert"},
]
+++
