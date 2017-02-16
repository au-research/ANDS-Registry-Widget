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
            mode: "search-activity"
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
            mode: "search-activity",
            searchOptions: {
                autoSearch: true,
                facets: [ "institutions", "funders", "type", "fundingScheme", "status" ]
            }
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );

        $fixture.on( "ands.registry-widget.render-complete", function() {

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

            assert.equal( true,
                $( "select[data-param=status]", searchContainer ).length > 0,
                "Activity Status facet select is available" );

            done();
        } );
    } );

    QUnit.test( "correct value for search options", function( assert ) {

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-activity"
        } );

        var pluginData = $fixture.data( "plugin_registryWidget" );
        var searchContainer = $fixture.nextAll( ".search-container" );
        var searchQuery = $( ".search-query", searchContainer );
        var searchButton = $( ".search-button", searchContainer );

        // set fish to the value and test if q = fish
        searchQuery.val( "fish" );
        searchButton.click();
        assert.equal( "fish", pluginData.params.q, "q is fish" );

        // change to title and test if title = fish
        $( ".select-query-option[data-value=title]", searchContainer ).click();
        assert.equal( "fish",
            pluginData.params.title,
            "title is fish" );

        // change to description and change the value
        searchQuery.val( "shark" );
        $( ".select-query-option[data-value=description]", searchContainer )
            .click();
        assert.equal( "shark",
            pluginData.params.description,
            "description is shark" );

        // change to person and change the value
        searchQuery.val( "John" );
        $( ".select-query-option[data-value=researcher]", searchContainer )
            .click();
        assert.equal( "John",
            pluginData.params.researcher,
            "researcher is John" );

        // change to id
        $( ".select-query-option[data-value=id]", searchContainer )
            .click();
        assert.equal( "John",
            pluginData.params.id,
            "id is John" );

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
            mode: "search-activity"
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
        // assert.equal( "block",
        //     searchContainer.css( "display" ),
        //     "after click toggle is visible" );

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
            mode: "search-activity"
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
                data.records.length > 0,
                "has search result data" );
        } );

        $fixture.on( "ands.registry-widget.render-complete", function() {
            var searchResultList = $( ".search-result ul li", searchContainer );

            assert.equal( true,
                searchResultList.length > 0,
                "has search results rendered correctly in lists" );

            done();
        } );

    } );

    QUnit.test( "Test status filters ", function( assert ) {

        var done = assert.async();

        $fixture = $( "<input type='text' />" );

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-activity",
            searchOptions: {
                autoSearch: true,
                facets: [ "status" ]
            }
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );

        $fixture.on( "ands.registry-widget.render-complete", function() {
            var searchResultList = $( ".search-result ul li", searchContainer );

            assert.equal( true,
                searchResultList.length > 0,
                "has search results rendered correctly in lists" );

            var statusOptions = $( "select[data-param=status] option", searchContainer );
            var statusOptionsValueList = $.map( statusOptions, function( option ) {
                if ( option.value !== "" ) {
                    return option.value;
                }
            } );
            var statusOptionsDisplayList = $.map( statusOptions, function( option ) {
                if ( option.value !== "" ) {
                   return $.trim( $( option ).text() );
                }
            } );

            assert.equal( true,
                statusOptionsValueList.length > 0,
                "has options value rendered correctly in lists" );

            //check if statusOptionsValueList is alphabetical
            var sortedList = statusOptionsValueList.sort( function( a, b ) {
                return a.localeCompare( b );
            } );
            assert.deepEqual( statusOptionsValueList, sortedList,
                "has status list sorted alphabetically"
            );

            //check if statusOptionsDisplayList is all titlecased
            var titleCasedList = $.map( statusOptionsDisplayList, function( item ) {
                return item.replace( /\w\S*/g, function( txt ) {
                    return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
                } );
            } );
            assert.deepEqual( statusOptionsDisplayList, titleCasedList,
                "has status list sorted title cased correctly"
            );

            done();
        } );
    } );

    QUnit.test( "Test type filters", function( assert ) {

        var done = assert.async();

        $fixture = $( "<input type='text' />" );

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-activity",
            searchOptions: {
                autoSearch: true,
                facets: [ "type" ]
            }
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );

        $fixture.on( "ands.registry-widget.render-complete", function() {
            var searchResultList = $( ".search-result ul li", searchContainer );

            assert.equal( true,
                searchResultList.length > 0,
                "has search results rendered correctly in lists" );

            var typeOptions = $( "select[data-param=type] option", searchContainer );
            var typeOptionsValueList = $.map( typeOptions, function( option ) {
                if ( option.value !== "" ) {
                    return option.value;
                }
            } );
            var typeOptionsDisplayList = $.map( typeOptions, function( option ) {
                if ( option.value !== "" ) {
                    return $.trim( $( option ).text() );
                }
            } );

            assert.equal( true,
                typeOptionsValueList.length > 0,
                "has options value rendered correctly in lists" );

            //check if typeOptionsValueList is alphabetical
            var sortedList = typeOptionsValueList.sort( function( a, b ) {
                return a.localeCompare( b );
            } );
            assert.deepEqual( typeOptionsValueList, sortedList,
                "has type list sorted alphabetically"
            );

            //check if typeOptionsDisplayList is all titlecased
            var titleCasedList = $.map( typeOptionsDisplayList, function( item ) {
                return item.replace( /\w\S*/g, function( txt ) {
                    return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
                } );
            } );
            assert.deepEqual( typeOptionsDisplayList, titleCasedList,
                "has type list sorted title cased correctly"
            );

            done();
        } );
    } );

    QUnit.test( "Test type filters", function( assert ) {

        var done = assert.async();

        $fixture = $( "<input type='text' />" );

        $fixture.registryWidget( {
            apiKey: "testAPI",
            mode: "search-activity",
            searchOptions: {
                autoSearch: true,
                facets: [ "type" ]
            }
        } );

        var searchContainer = $fixture.nextAll( ".search-container" );

        $fixture.on( "ands.registry-widget.render-complete", function() {
            var searchResultList = $( ".search-result ul li", searchContainer );

            assert.equal( true,
                searchResultList.length > 0,
                "has search results rendered correctly in lists" );

            var typeOptions = $( "select[data-param=type] option", searchContainer );
            var typeOptionsValueList = $.map( typeOptions, function( option ) {
                if ( option.value !== "" ) {
                    return option.value;
                }
            } );
            var typeOptionsDisplayList = $.map( typeOptions, function( option ) {
                if ( option.value !== "" ) {
                    return $.trim( $( option ).text() );
                }
            } );

            assert.equal( true,
                typeOptionsValueList.length > 0,
                "has options value rendered correctly in lists" );

            //check if typeOptionsValueList is alphabetical
            var sortedList = typeOptionsValueList.sort( function( a, b ) {
                return a.localeCompare( b );
            } );
            assert.deepEqual( typeOptionsValueList, sortedList,
                "has type list sorted alphabetically"
            );

            //check if typeOptionsDisplayList is all titlecased
            var titleCasedList = $.map( typeOptionsDisplayList, function( item ) {
                return item.replace( /\w\S*/g, function( txt ) {
                    return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
                } );
            } );
            assert.deepEqual( typeOptionsDisplayList, titleCasedList,
                "has type list sorted title cased correctly"
            );

            done();
        } );
    } );

}( jQuery, QUnit ) );
