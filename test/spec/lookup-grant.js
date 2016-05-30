( function( $, QUnit ) {

    "use strict";

    var $testCanvas = $( "#testCanvas" );
    var $fixture = null;

    QUnit.module( "ANDS Registry Widget - Lookup Grant", {
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

        var dom = "<input " +
            "type='text' " +
            "id='lookup-grant' " +
            "value='http://purl.org/au-research/grants/arc/DP140100435'/>";
        var testPurl = "http://purl.org/au-research/grants/arc/DP140100435";
        $fixture = $( dom );

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "lookup-activity"
        } );

        var done = assert.async();

        $fixture.on( "ands.registry-widget.render-complete", function( event, element, content ) {
            var displayTarget = $fixture.next( ".display-target" );

            assert.equal( true,
                displayTarget.length > 0,
                "display target is generated" );

            assert.equal( true,
                displayTarget.html().length > 0,
                "display target has some content" );

            assert.equal( true,
                content.records.length > 0,
                "has some record data returned in the lookup" );

            assert.equal( true, content.numFound === 1, "found 1 result" );

            assert.equal( testPurl,
                content.records[ 0 ].purl,
                "has the same PURL" );

            done();
        } );

    } );

}( jQuery, QUnit ) );
