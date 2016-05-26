[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/au-research/ANDS-Registry-Widget/master/LICENSE)
[![Build Status](https://travis-ci.org/au-research/ANDS-Registry-Widget.svg?branch=master)](https://travis-ci.org/au-research/ANDS-Registry-Widget)

ANDS Registry Widget is a jQuery plugin that provides the ability to lookup, search and display records from the ANDS Registry API

# Getting Started

Include jQuery dependency
```html
<script src="node_modules/jquery/dist/jquery.min.js"></script>
```

Include the provided distribution file
```html
<script src="dist/jquery.ands.registry-widget.min.js"></script>
```
Instantiate the plugin with 
```javascript
$("#registry_widget").registryWidget({
    // options
});
```
ANDS Registry Widget comes with out of the box support for Twitter Bootstrap styling and Mustache templating engine. Include them to get the same functionality as the available demo page
```html
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="bower_components/mustache.js/mustache.min.js"></script>
```

# Configuration
Available parameters
* `apiKey` : The API Key that this widget will use to access the ANDS Registry API
* `mode` : `lookup-activity|search-activity|display-activity` Available modes are currently restricted to these
* `searchOptions`: Search Options, for configuring how the Search functionality display and functions
	* `autoSearch`: `true|false`
	* `autoLookup`: `true|false`
	* `returnType`: `purl|title|id`
	* `facets`: `institutions|funders|type|fundingScheme|status`
	* `openIn`: `bootstrap-modal` : Enable custom search displayer. Default to nothing. (appear undearneath)
	* `params`: Search parameters, overwrite the default ones. For a list of available parameters. Have a look at the Activites API
		* `funder`: Default funder
		* `limit` : Number of rows return
		* `pp` : Per Page
		* `q`: General Search 
		* `subject` 
		* `fundingScheme`
		* `identifier`
		* ...
    * `searchQueryOptions` : Search query options for free text search. For more information, refer to the searchQueryOptions section

    
## searchQueryOptions
Primarily in a list of specified fields to search for. By default it's set to
```javascript
[
    { value: "q", display: "All" },
    { value: "title", display: "Title" },
    { value: "description", display: "Description" },
    { value: "researcher", display: "Researcher" },
    { value: "principalInvestigator", display: "Principal Investigator" },
    { value: "id", display: "Identifier" },
    { value: "subject", display: "Subject" }
]
```

Search Parameters can also be embed into the target via HTML `data` attribute. For example
```javascript
<div id="display-activity" data-purl="http://purl.org/au-research/activitys/arc/DP140100435"></div>
$('#display-activity').registryWidget({
    api_key: "public",
    mode: "display-activity"
});
```

# Development

Install the dependencies
```bash
npm install
bower install
```
Running tests
```bash
grunt karma
```