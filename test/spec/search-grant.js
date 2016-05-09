( function( $, QUnit ) {

    "use strict";

    var $testCanvas = $( "#testCanvas" );
    var $fixture = null;

    QUnit.module( "ANDS Registry Widget - Search Grant", {
        beforeEach: function() {

            // fixture is the element where your jQuery plugin will act
            $fixture = $( "<input type='text' />" );
            $testCanvas.append( $fixture );
        },
        afterEach: function() {

            // we remove the element to reset our plugin job :)
            $fixture.remove();
        }
    } );

    /**
     * Test if the grant widget generates the HTML containers
     * and elements when needed
     */
    QUnit.test( "search for a grant HTML generation", function( assert ) {

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-grant"
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );
        var searchToggle = $fixture.nextAll( ".search-toggle" );

        assert.equal( true,
            searchToggle.length > 0,
            "search toggle is generated" );

        assert.equal( true,
            searchContainer.length > 0,
            "search container is generated" );

        assert.equal( true,
            searchContainer.html().length > 0,
            "search container has some content" );

        assert.equal( true,
            $( ".search-query", searchContainer ).length > 0,
            "search container has a search input query" );

        assert.equal( true,
            $( ".search-button", searchContainer ).length > 0,
            "search container has a search button" );

        assert.equal( true,
            $( ".search-result", searchContainer ).length > 0,
            "search container has a search result" );

    } );

    /**
     * Test if facets displays
     * in autoSearch mode
     */
    QUnit.test( "advanced search html generation", function( assert ) {

        var done = assert.async();

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-grant",
            searchOptions: {
                autoSearch: true,
                facets: [ "institutions", "funders", "type", "fundingScheme" ]
            }
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );

        $fixture.on( "ands.registry-widget.render-complete", function( ) {

            assert.equal( true,
                $( "select[data-param=institution]", searchContainer ).length > 0,
                "institutions facet select is available" );

            assert.equal( true,
                $( "select[data-param=funder]", searchContainer ).length > 0,
                "funders facet select is available" );

            assert.equal( true,
                $( "select[data-param=type]", searchContainer ).length > 0,
                "type facet select is available" );

            assert.equal( true,
                $( "select[data-param=fundingScheme]", searchContainer ).length > 0,
                "fundingScheme facet select is available" );

            done();
        } );
    } );

    /**
     * Can't actually find if an $fixture.is(":visible")
     * because the element is not attached to the DOM somehow
     * so checking for css display property
     * by default configuration, it should work correctly
     */
    QUnit.test( "open search toggler", function( assert ) {

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-grant"
        } );

        var searchToggle = $fixture.nextAll( ".search-toggle" );
        var searchContainer = $fixture.nextAll( ".search-container" );

        //default hidden
        assert.equal( "none",
            searchContainer.css( "display" ),
            "initially hidden" );

        //click
        searchToggle.click();

        //then visible
        assert.equal( "block",
            searchContainer.css( "display" ),
            "after click toggle is visible" );

    } );

    /**
     * Search for results
     * Look into the result set after the event search-complete is triggered
     * And then look into the result set displayed as HTML after render-complete is triggered
     */
    QUnit.test( "search grant returns result", function( assert ) {

        var done = assert.async();

        $fixture = $( "<input type='text' />" );

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-grant"
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );
        $( ".search-query", searchContainer ).val( "fish" );
        $( ".search-button", searchContainer ).click();

        // bind the event async
        $fixture.on( "ands.registry-widget.search-complete", function( event, data ) {
            assert.equal( true,
                data.numFound > 0,
                "has numFound" + data.numFound );

            assert.equal( true,
                data.totalFound > 0,
                "has totalFound " + data.totalFound );

            assert.equal( true,
                data.recordData.length > 0,
                "has search result data" );
        } );

        $fixture.on( "ands.registry-widget.render-complete", function( ) {
            var searchResultList = $( ".search-result ul li", searchContainer );

            assert.equal( true,
                searchResultList.length > 0,
                "has search results rendered correctly in lists" );

            done();
        } );

    } );

}( jQuery, QUnit ) );
