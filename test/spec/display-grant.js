( function( $, QUnit ) {

    "use strict";

    var $testCanvas = $( "#testCanvas" );
    var $fixture = null;

    QUnit.module( "ANDS Registry Widget - Display Grant", {
        beforeEach: function() {

            // fixture is the element where your jQuery plugin will act
            $fixture = $( "<div/>" );
            $testCanvas.append( $fixture );
        },
        afterEach: function() {

            // we remove the element to reset our plugin job :)
            $fixture.remove();
        }
    } );

    /**
     * todo test lookup using id field
     * todo test lookup callback
     */
    QUnit.test( "lookup a sample purl returns the right result", function( assert ) {
        var dom = "<div " +
            "data-purl='http://purl.org/au-research/grants/arc/DP140100435'>" +
            "</div>";
        $fixture = $( dom );
        var testPurl = "http://purl.org/au-research/grants/arc/DP140100435";

        $fixture.registryWidget( {
            apiKey: "testAPI",
            purl: testPurl,
            mode: "display-grant"
        } );

        var done = assert.async();
        setTimeout( function() {
            var pluginData = $fixture.data( "plugin_registryWidget" );
            pluginData.service.lookup( pluginData.params )
                .then( function( data ){
                assert.equal( true,
                    data.recordData.length > 0,
                    "has some record data returned in the lookup" );
                assert.equal( 1, data.totalFound, "found 1 result for " + testPurl );
                assert.equal( testPurl, data.recordData[ 0 ].purl, "has the same PURL" );
                done();
            } );
        }, 0 );
    } );

    QUnit.test( "lookup and display default Template generation correctly", function( assert ) {
        var dom = "<div data-purl='http://purl.org/au-research/grants/arc/DP140100435'></div>";
        $fixture = $( dom );
        var testPurl = "http://purl.org/au-research/grants/arc/DP140100435";

        $fixture.registryWidget( {
            apiKey: "testAPI",
            purl: testPurl,
            mode: "display-grant"
        } );

        var done = assert.async();
        setTimeout( function() {
            var pluginData = $fixture.data( "plugin_registryWidget" );
            pluginData.service.lookup( pluginData.params ).then( function( data ) {
                assert.equal( 1, data.totalFound, "found 1 result for " + testPurl );
                var displayTarget = $fixture;
                assert.equal( true, displayTarget.length > 0, "display target generated" );
                assert.equal( true, displayTarget.html() !== "", "display target has content" );
                assert.equal( true,
                    displayTarget.text().indexOf( testPurl ) > -1,
                    "display target has " + testPurl );
                done();
            } );
        }, 0 );
    } );

    QUnit.test( "lookup and display call back", function( assert ) {
        $fixture = $( "<div data-purl='http://purl.org/au-research/grants/arc/DP140100435'></div>" );
        var testPurl = "http://purl.org/au-research/grants/arc/DP140100435";

        $fixture.registryWidget( {
            apiKey: "testAPI",
            purl: testPurl,
            mode: "display-grant"
        } );

        assert.equal(true, true, "test did run");

    } );

}( jQuery, QUnit ) );
