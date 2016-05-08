( function( $ ) {

    "use strict";

    // create an element to run tests inside
    var $testCanvas = $( "<div id='testCanvas'></div>" );

    // define the API key and service end point for automated test
    var $serviceUrl = 'http://devl.ands.org.au/minh/api/';
    var $apiKey = "ANDS-Registry-Widget-QUnit-Test";

    // define test parameters
    var $testPurl = 'http://purl.org/au-research/grants/arc/DP140100435';

    $( "body" ).prepend( $testCanvas );

    // include Mustache template engine
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.js";
    $("head").append(s);


}( jQuery ) );