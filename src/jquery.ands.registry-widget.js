/**
 * ANDS Registry Widget
 * jQuery plugin
 * Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
;( function( $, window, document, undefined ) {

    "use strict";

    // Create the defaults once
    var widgetName = "registryWidget",
        defaults = {
            mode: "display-grant",
            apiUrl: "",
            serviceUrl: "http://devl.ands.org.au/minh/api/",
            renderEngine: "default"
        },
        defaultParams = {
            apiKey: "public"
        };

    // The actual plugin constructor
    function ANDSRegistryWidget ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.params = defaultParams;
        this._name = widgetName;
        this.init();
    }

    // Avoid ANDSRegistryWidget.prototype conflicts
    //noinspection JSUnresolvedVariable
    $.extend( ANDSRegistryWidget.prototype, {
        init: function() {

            //set Parameters
            this.setParams();

            // bind the service element
            //var APIService = Object.create(APIService);

            this.service = new APIService.create( this.settings );

            //bind the jQuery element for manipulating
            var element = $( this.element );

            var me = this;

            //set rendering engine to the preferred one
            if ( typeof Mustache === "object" ) {
                this.settings.renderEngine = "mustache";
            }

            // mode
            switch ( this.settings.mode ) {
                case "display-grant":
                    me.lookupAndDisplay( element, "display-grant-tpl" );
                    break;
                case "lookup-grant":
                    this.bindLookup( element );
                    break;
                case "search-grant":
                    this.bindSearch( element );
                    this.bindLookup( element );
                    break;
                default:

                    // console.log(this.settings.mode);
                    break;
            }
        },

        bindLookup: function( element ) {
            var me = this;

            var target;
            if ( $( element ).next( ".display-target" ).length > 0 ) {
                target = $( element ).next( ".display-target" )[ 0 ];
            } else {
                target = $( "<div class='display-target'/>" )
                    .insertAfter( element );
            }

            me.lookup( element, target );
            $( element ).on( "blur", function() {
                me.lookup( element, target );
            } );

            $( element ).on( "keyup", function() {
                delay( function() {
                    me.lookup( element, target );
                }, 1000 );
            } );

            var delay = ( function() {
                var timer = 0;
                return function( callback, ms ) {
                    clearTimeout( timer );
                    timer = setTimeout( callback, ms );
                };
            } )();

        },

        bindSearch: function( element ) {
            var me = this;
            var dom ;

            var searchToggle;
            if ( $( element ).next( ".search-toggle" ).length > 0 ) {
                searchToggle = $( element ).next( ".search-toggle" )[ 0 ];
            } else {
                dom = "<a href='javascript:;' class='search-toggle'>" +
                                "Open Search" +
                            "</a>";
                searchToggle = $( dom ).insertAfter( element );
            }

            var searchContainer;
            if ( $( searchToggle ).next( ".search-container" ).length > 0 ) {
                searchContainer = $( searchToggle ).next( ".search-container" )[ 0 ];
            } else {
                dom = "<div class='search-container'></div>";
                searchContainer = $( dom ).insertAfter( searchToggle );
            }
            searchContainer.hide();

            var displayOptions = {};
            if ( this.settings.searchOptions ) {
                if ( this.settings.searchOptions.facets ) {
                    displayOptions.facets = this.settings.searchOptions.facets;
                }
            }

            // TODO make default
            var searchQueryOptions = [
                { value: "q", display: "All" },
                { value: "title", display: "Title" },
                { value: "description", display: "Description" },
                { value: "person", display: "Person" },
                { value: "id", display: "Identifier" }
            ];

            displayOptions.searchQueryOptions = searchQueryOptions;
            displayOptions.activeQueryOptionDisplay = "All";
            displayOptions.activeQueryOptionValue = "q";

            this.render( searchContainer, displayOptions, "search-tpl" );

            // click event on the search toggle to open the search container
            searchToggle.on( "click", function() {
                searchContainer.toggle();
            } );

            var searchQuery = $( ".search-query", searchContainer );
            var searchButton = $( ".search-button", searchContainer );
            var searchResult = $( ".search-result", searchContainer );

            // auto search
            if ( this.settings.searchOptions &&
                this.settings.searchOptions.autoSearch ) {
                me.search( searchResult );
                searchContainer.show();
            }

            // enter key for search Query
            searchQuery.on( "keyup", function( event ) {
                if ( event.which === 13 ) {
                    me.search( searchResult );
                }
            } );

            // click event on the search button
            searchButton.on( "click", function() {
                me.search( searchResult );
            } );

            // setting query option
            $( ".select-query-option", searchContainer ).on( "click", function() {
                var elem = searchQuery;
                var type = $( this ).data( "value" );
                var value = elem.val();

                //clear all params and get current display of type
                var display = "";
                $.each( searchQueryOptions, function() {
                    delete me.params[ this.value ];
                    if ( this.value === type ) {
                        display = this.display;
                    }
                } );

                me.params[ type ] = value;

                $( ".active-query-option", searchContainer )
                    .attr( "data-value", type )
                    .html( display );
            } );

            // click event on one of the search result item
            $( searchResult ).on( "click", ".search-result-item", function() {
                $( element ).val( $( this ).data( "purl" ) );
                $( searchContainer ).hide();
                $( element ).blur();
            } );

            //bind facetSelect
            $( searchResult ).on( "change", ".facet-select", function() {
                var param = $( this ).data( "param" );
                me.params[ param ] = $( this ).val();
                me.search( searchResult );
            } );

            //bind showMore
            $( searchResult ).on( "click", ".show-more", function() {
                var pp;
                pp = me.params.pp ? me.params.pp : 30;
                me.params.rows = me.params.rows ? me.params.rows + pp : 30 + pp;
                me.search( searchResult );
            } );

        },

        lookup: function( element, target ) {
            var me = this;
            if ( $( element ).val() !== "" &&
                me.params.purl !== $( element ).val() )
            {
                me.params.purl = $( element ).val();
                me.lookupAndDisplay( target, "display-grant-tpl" );
            }
        },

        search: function( searchResultContainer ) {
            var me = this;
            delete me.params.purl;

            // correct the search query params
            var searchContainer = $( me.element ).nextAll( ".search-container" );
            var searchQuery = $( ".search-query", searchContainer );
            var queryType = $( ".active-query-option", searchContainer )
                .attr( "data-value" );
            if ( queryType === "" || queryType === undefined ) {
                queryType = "q";
            }
            me.params[ queryType ] = searchQuery.val();

            me.lookupAndDisplay( searchResultContainer, "search-result-tpl" );
        },

        getSearchOption: function( option ) {
            if ( this.settings.searchOptions &&
                this.settings.searchOptions[ option ] )
            {
                return this.settings.searchOptions[ option ];
            } else {
                return false;
            }
        },

        lookupAndDisplay: function( element, template ) {
            var me = this;

            if ( $( element ).text() === "" ) {
                $( element ).text( "Loading..." );
            }

            if ( me.getSearchOption( "facets" ) !== false ) {
                me.params.facets = me.getSearchOption( "facets" ).join();
            }

            me.service.lookup( me.params ).done( function( data ) {
                me.event( "search-complete", data );
                me.render( element, data, template );
            } );
        },

        setParams: function() {

            //decide on the API URL
            if ( this.settings.mode.indexOf( "grant" ) > -1 ) {
                this.settings.apiUrl = this.settings.serviceUrl +
                    "v2.0/registry.jsonp/grants";
            }

            //append apiKey as a param
            if ( this.settings.apiKey ) {
                this.params.apiKey = this.settings.apiKey;
            }

            this.params = $.extend( {}, this.params, $( this.element ).data() );
            if ( this.getSearchOption( "params" ) ) {
                this.params = $.extend(
                    {},
                    this.params,
                    this.getSearchOption( "params" )
                );
            }

        },

        /**
         * Render a specific content onto a specific element
         * Template type is provided
         *
         * @param element
         * @param content
         * @param template
         */
        render: function( element, content, template ) {
            var me = this;
            if ( this.settings.renderEngine === "default" ) {
                $( element ).text( JSON.stringify( content ) );
            } else if ( this.settings.renderEngine === "mustache" ) {

                template = me.getTemplate( template );

                // TODO : refactor to pre-render process -> return content
                if ( content.numFound && content.totalFound ) {
                    content.more = content.numFound < content.totalFound;
                }

                if ( content.facets ) {
                    $.each( content.facets, function( idx, data ) {
                        content[ idx + "_facet" ] = data;
                        content[ "hasfacet_" + idx ] = true;
                    } );
                }

                $( element ).html( Mustache.render( template, content ) );

                // TODO : refactor to post-render process -> fix display
                // bind selects on element (for search only)
                $.each( $( "select", element ), function() {
                    var param = $( this ).data( "param" );
                    if ( me.params[ param ] ) {
                        $( this ).val( me.params[ param ] );
                    }
                } );

            } else {
                me.event( "error", "No rendering engine found" );
            }
            me.event( "render-complete", [ element, content, template ] );
        },

        /**
         * Trigger a jQuery event
         * with widget specific namespace and data
         *
         * @param event
         * @param data
         */
        event: function( event, data ) {
            var prefix = "ands.registry-widget.";
            $( this.element ).trigger( prefix + event, data );
        },

        /**
         * Return the template string for Mustache renderer
         *
         * @param tpl
         * @returns {string}
         */
        getTemplate: function( tpl ) {
            var template = "No template found!";
            var userDefinedTemplate = $( "#" + tpl );

            if ( userDefinedTemplate.length > 0 ) {
                template = userDefinedTemplate.html();
            } else if ( defaultTemplates[ tpl ] ) {
                template = defaultTemplates[ tpl ];
            }

            return template;
        }

    } );

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ widgetName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + widgetName ) ) {
                $.data(
                    this,
                    "plugin_" + widgetName,
                    new ANDSRegistryWidget( this, options )
                );
            }
        } );
    };

} )( jQuery, window, document, APIService, defaultTemplates );
