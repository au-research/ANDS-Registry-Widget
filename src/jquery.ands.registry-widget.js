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
            mode: "display-activity",
            apiUrl: "",
            serviceUrl: "https://test.ands.org.au/api/",
            renderEngine: "default",
            eventPrefix: "ands.registry-widget.",
            searchOptions: {
                returnType: "purl",
                autoLookup: true,
                searchQueryOptions: [
                    { value: "q", display: "All" },
                    { value: "title", display: "Title" },
                    { value: "description", display: "Description" },
                    { value: "researcher", display: "Researcher" },
                    { value: "principalInvestigator", display: "Principal Investigator" },
                    { value: "id", display: "Identifier" },
                    { value: "subject", display: "Subject" }
                ]
            }
        },
        defaultParams = {
            apiKey: "public"
        };

    // The actual plugin constructor
    function ANDSRegistryWidget ( element, options ) {
        this.element = element;
        this.settings = $.extend( true, {}, defaults, options );
        this._defaults = defaults;
        this.params = defaultParams;
        this._name = widgetName;
        this.init();
    }

    // Avoid ANDSRegistryWidget.prototype conflicts
    //noinspection JSUnresolvedVariable
    $.extend( ANDSRegistryWidget.prototype, {
        init: function() {

            // instead of self, use me
            var me = this;

            //set Parameters
            this.setParams();

            // bind the service for use internally as a new instance
            this.service = new APIService.create( this.settings );

            //bind the jQuery element for manipulating
            var element = $( this.element );

            //set rendering engine to the preferred one
            if ( typeof Mustache === "object" ) {
                this.settings.renderEngine = "mustache";
            }

            //bind all internal events
            me.bindInternalEvents();

            // mode
            switch ( this.settings.mode ) {
                case "display-activity":
                    me.lookupAndDisplay( element, "display-grant-tpl" );
                    break;
                case "lookup-activity":
                    this.bindLookup( element );
                    break;
                case "search-activity":
                    this.bindSearch( element );
                    this.bindLookup( element );
                    break;
                default:
                    this.event( "error",
                        this.settings.mode + " is not supported yet" );
                    break;
            }
        },

        /**
         * internal events are subscribed to here
         *
         */
        bindInternalEvents: function( ) {
            var element = $( this.element );
            var me = this;

            // selecting a search result
            element.on( me.settings.prefix + "result-select", function() {
                if ( me.getSearchOption( "openIn" ) === "bootstrap-modal" ) {
                    $( "#search-modal" ).modal( "hide" );
                } else {
                    $( ".search-container" ).hide();
                }
            } );

            element.on( me.settings.prefix + "error", function( event, data ) {
                console.error( data );
            } );
        },

        /**
         * bind the Lookup functionality to the input element
         * on lookup will render the result to display-target
         * @param element
         */
        bindLookup: function( element ) {

            var me = this;
            var target;

            // bind or create display-target
            if ( $( element ).next( ".display-target" ).length > 0 ) {
                target = $( element ).next( ".display-target" )[ 0 ];
            } else {
                target = $( "<div class='display-target'/>" )
                    .insertAfter( element );
            }

            // initial lookup
            me.lookup( element, target );

            // blur event on element
            $( element ).on( "blur", function() {
                if ( me.settings.searchOptions.autoLookup ) {
                    me.lookup( element, target );
                }
            } );

            // keyup event on element, with debounce for 1000ms
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

        /**
         * binding the search functionality to the input element
         * @param element
         */
        bindSearch: function( element ) {
            var me = this;
            var dom ;

            // create or bind the search toggler
            var searchToggle;
            if ( $( element ).next( ".search-toggle" ).length > 0 ) {
                searchToggle = $( element ).next( ".search-toggle" )[ 0 ];
            } else {
                dom = "<a href='javascript:;' class='search-toggle'>" +
                            "Open Search" +
                        "</a>";
                searchToggle = $( dom ).insertAfter( element );
            }

            // create or bind the search container
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
            var searchQueryOptions = me.settings.searchOptions.searchQueryOptions;

            displayOptions.searchQueryOptions = searchQueryOptions;
            displayOptions.activeQueryOptionDisplay = "All";
            displayOptions.activeQueryOptionValue = "q";

            // render the search container
            this.render( searchContainer, displayOptions, "search-tpl" );

            // click event on the search toggle to open the search container
            searchToggle.on( "click", function() {
                var searchOpenIn = me.getSearchOption( "openIn" );
                if ( searchOpenIn ) {
                    if ( searchOpenIn === "bootstrap-modal" ) {
                        var searchModal = $( "#search-modal" );
                        if ( searchModal.length < 1 ) {
                            $( "body" ).append( me.getTemplate( "search-modal" ) );
                        }
                        searchModal = $( "#search-modal" );
                        searchContainer
                            .appendTo( $( ".modal-body", searchModal ) )
                            .show();
                        searchModal.modal( "show" );
                    } else {
                        me.event( "error",
                            searchOpenIn + "mode is not supported yet" );
                    }
                } else {
                    searchContainer.toggle();
                }

            } );

            // declare DOM for binding
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

                //correct the query
                var type = $( ".active-query-option", searchContainer )
                    .attr( "data-value" );
                me.params[ type ] = searchQuery.val();

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
                me.event( "result-select", $( this ) );

                //set parameter and do the lookup
                var returnType = me.settings.searchOptions.returnType;
                var result = $( this ).data( returnType );
                if ( result ) {
                    $( element ).val( $( this ).data( returnType ) );
                    $( element ).blur();
                } else {
                    me.event( "error", "No return value " );
                }

            } );

            //bind facetSelect
            $( searchResult ).on( "change", ".facet-select", function() {
                var param = $( this ).data( "param" );
                if ( $( this ).val() !== "" ) {
                    me.params[ param ] = "\"" + $( this ).val() + "\"";
                } else {
                    delete me.params[ param ];
                }
                me.search( searchResult );
            } );

            //bind showMore
            $( searchResult ).on( "click", ".show-more", function() {
                var pp;
                pp = me.params.pp ? me.params.pp : 30;
                me.params.limit = me.params.limit ? me.params.limit + pp : 30 + pp;
                me.search( searchResult );
            } );

        },

        /**
         * lookup functionality
         * search for PURL that is in a given element
         * display result in a given target
         * initiate a lookupAndDisplay
         * @param element
         * @param target
         */
        lookup: function( element, target ) {
            var me = this;
            var returnType = me.settings.searchOptions.returnType;
            if ( $( element ).val() !== "" &&
                me.params[ returnType ] !== $( element ).val() )
            {
                me.params[ returnType ] = $( element ).val();
                me.lookupAndDisplay( target, "display-grant-tpl" );
            }
        },

        /**
         * Initiate a search
         * Return the rendered search result in a given container
         * @param searchResultContainer
         */
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
            me.event( "pre-search", [ me.settings, me.params ] );
            me.lookupAndDisplay( searchResultContainer, "search-result-tpl" );
        },

        /**
         * Returns the search option defined in the configuration
         * false if not set
         * @param option
         * @returns {*}
         */
        getSearchOption: function( option ) {
            if ( this.settings.searchOptions &&
                this.settings.searchOptions[ option ] )
            {
                return this.settings.searchOptions[ option ];
            } else {
                return false;
            }
        },

        /**
         * Intitiate a lookup in the service with the current params
         * Return the rendered search result in a given element with a template
         * @param element
         * @param template
         */
        lookupAndDisplay: function( element, template ) {
            var me = this;

            // todo custom loading
            if ( $( element ).text() === "" ) {
                $( element ).text( "Loading..." );
            }

            // todo pre-search event
            if ( me.getSearchOption( "facets" ) !== false ) {
                me.params.facets = me.getSearchOption( "facets" ).join();
            }

            me.service.lookup( me.params ).done( function( data ) {
                me.event( "search-complete", data );
                me.render( element, data, template );
            } );
        },

        /**
         * Init the parameters of the widget
         * Define the end points and every configuration before hand
         */
        setParams: function() {

            // merge all data attribute of the element to this.params
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

                content = me.preProcessContent( content );
                me.event( "pre-render", [ element, content, template ] );

                $( element ).html( Mustache.render( template, content ) );

                me.postProcessContent( element );
                me.event( "post-render", [ element, content, template ] );

            } else {
                me.event( "error", "No rendering engine found" );
            }
            me.event( "render-complete", [ element, content, template ] );
        },

        /**
         * pre process the content for rendering
         * @param content
         * @returns {*}
         */
        preProcessContent: function( content ) {
            if ( content.numFound ) {
                content.more = content.limit < content.numFound;
            }

            if ( content.facets ) {
                $.each( content.facets, function( idx, data ) {
                    content[ idx + "_facet" ] = data;
                    content[ "hasfacet_" + idx ] = true;
                } );
            }

            return content;
        },

        /**
         * post process the DOM after rendering
         */
        postProcessContent: function( element ) {
            var me = this;

            // bind selects on element (for search only)
            $.each( $( "select", element ), function() {
                var param = $( this ).data( "param" );
                if ( me.params[ param ] ) {
                    $( this ).val( me.params[ param ].replace( /["]+/g, "" ) );
                }
            } );
        },

        /**
         * Trigger a jQuery event
         * with widget specific namespace and data
         *
         * @param event
         * @param data
         */
        event: function( event, data ) {
            var prefix = this.settings.eventPrefix;
            $( this.element ).trigger( prefix + event, data );
        },

        /**
         * Return the template string for Mustache renderer
         *
         * @param tpl
         * @returns {string}
         */
        getTemplate: function( tpl ) {
            var template = "";
            var userDefinedTemplate = $( "#" + tpl );

            if ( userDefinedTemplate.length > 0 ) {
                template = userDefinedTemplate.html();
            } else if ( defaultTemplates[ tpl ] ) {
                template = defaultTemplates[ tpl ];
            }

            if ( template === "" ) {
                this.event( "error", "No template found: " + tpl );
                template = "No template found";
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
