The partners map consists of three components: partners data (`data/partners.json`), Counties data (`data/counties.json`), and the Counties SVG file (`assets/img/icons/counties.svg`).

**Partners data** is updated in a Google sheet. A partner must have a PA county cell populated to appear on and below the map. If a partner covers multiple counties, it needs to be duplicated in the Google sheet and subsequent JSON file with one county per entry.

**Counties data** will most likely never need updates. The counties data matches counties from the partners list. If a county exists in partner data, this file matches that county with the proper coordinates ("translate" key) for placement on the map.

**Counties SVG** contains shapes for each county and corresponding markers in defs at the top of the file. Marker IDs are listed at the top of the refs section from an ellipsis for partners-1 through a "+15" inside an ellipsis for partners-15. When a new partner is added to a county, you can add its marker to the map in one of two ways.

1) Add a new `<use>` element with an xlink:href to the marker id and adjust the `translate= "transform()"` as needed to place the marker where it best represents the partner's location. See example:

    <use id="Elk-partners" x="279.291" y="172.443" xlink:href="#partners-1"/>

2) If you are adding a new partner to a location already populated with partners, like cities or small counties, you can use xlink:href to connect to one of the partner defs that corresponds with the number of partners in that location. See example:

    <use id="Philadelphia-partners" transform="translate(812.81 444.99)" xlink:href="#partners-13"/>

You should not need to make any changes to the individual county shapes. Each has a capitalized ID for the county name to match the data in the county JSON file.

If you need to add a partner outside of Pennsylvania, you can populate its county cell with "Regional/At-large" in the Google Sheet. You can include the state inside the "City" cell if you would like that to appear on the partner's page (e.g., `"City": "Cleveland, OH"` in the partners JSON file).
