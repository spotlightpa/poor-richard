+++
title = "We're sorry, your subscription could not be processed at this time."
title-tag = "Something Went Wrong • Spotlight PA"
layout = "warning-page"
url = "/newsletters/sorry/"
no-index = true
modal-exclude = true
+++

Something went wrong when subscribing you to our newsletter. Please check the information you entered and try again. If you were previously a subscriber and unsubscribed, you may need to [**resubscribe here**](https://spotlightpa.us15.list-manage.com/subscribe?u=77370ff1d001f9bb991fed9e7&id=6c1fbeb603) to confirm that you are not a robot. We are sorry for the inconvenience. If this error persists, please contact **<webmaster@spotlightpa.org>**.

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
