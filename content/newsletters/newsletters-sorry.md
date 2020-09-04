+++
title = "We're sorry, your subscription could not be processed at this time."
title-tag = "Something Went Wrong • Spotlight PA"
layout = "warning-page"
url = "/newsletters/sorry/"
no-index = true
modal-exclude = true
+++

Something went wrong when subscribing you to our newsletter. Please check the information you entered and try again. If this error persists, please contact **<webmaster@spotlightpa.org>**.

<p
    class="mt-4"
    x-data="{ params: new URLSearchParams(window.location.search) }"
    x-cloak
    x-show="params.get('msg')"
>
    <b>
        Error details
        (<span x-text="params.get('code')"></span>):
    </b>
    <span x-text="params.get('msg')"></span>
</p>
