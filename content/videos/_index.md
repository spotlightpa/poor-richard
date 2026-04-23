+++
title = "Videos"
description = "Videos from Spotlight PA."
[build]
  list = 'always'
  publishResources = true
  render = 'always'

[cascade]
image-gravity = "ce"
[cascade.build]
  list = 'local'
  publishResources = false
  # Have to make up false RelPermalinks to keep cache from collapsing onto one item
  render = 'link' 
+++
