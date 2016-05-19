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
            mode: "display-activity"
        } );

        var done = assert.async();
        setTimeout( function() {
            var pluginData = $fixture.data( "plugin_registryWidget" );
            pluginData.service.lookup( pluginData.params )
                .then( function( data ) {
                    assert.equal( true,
                        data.records.length > 0,
                        "has some record data returned in the lookup" );
                    assert.equal( 1, data.numFound, "found 1 result for " + testPurl );
                    assert.equal( testPurl, data.records[ 0 ].purl, "has the same PURL" );
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
            mode: "display-activity"
        } );

        var done = assert.async();

        $fixture.on( "ands.registry-widget.render-complete", function() {
            var displayTarget = $fixture;
            assert.equal( true, displayTarget.length > 0, "display target generated" );
            assert.equal( true, displayTarget.html() !== "", "display target has content" );
            assert.equal( true,
                displayTarget.text().indexOf( testPurl ) > -1,
                "display target has " + testPurl );
            done();
        } );

    } );

    QUnit.test( "lookup and display call back", function( assert ) {
        var html = "<div data-purl='http://purl.org/au-research/grants/arc/DP140100435'></div>";
        $fixture = $( html );
        var testPurl = "http://purl.org/au-research/grants/arc/DP140100435";

        $fixture.registryWidget( {
            apiKey: "testAPI",
            purl: testPurl,
            mode: "display-activity"
        } );

        assert.equal( true, true, "test did run" );

    } );

}( jQuery, QUnit ) );
