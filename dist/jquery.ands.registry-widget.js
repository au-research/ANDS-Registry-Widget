/*
 *  ANDS-Registry-Widget - v0.0.1
 *  A Widget to display and search for ANDS Registry contents
 *  https://developers.ands.org.au/
 *
 *  Made by Minh Duc Nguyen
 *  Under MIT License
 */
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
            mode: 'display-grant',
            api_url: '',
            service_url: 'http://devl.ands.org.au/minh/api/',
            render_engine: 'default'
        },
        default_params = {
            api_key: "public"
        };

    // The actual plugin constructor
    function ANDSRegistryWidget ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.params = default_params;
        this._name = widgetName;
        this.init();
    }

    // Avoid ANDSRegistryWidget.prototype conflicts
    $.extend( ANDSRegistryWidget.prototype, {
        init: function() {

            //set Parameters
            this.setParams();

            // bind the service element
            this.service = new APIService(this.settings);

            //bind the jQuery element for manipulating
            var element = $(this.element);

            var me = this;

            //set rendering engine to the prefered one
            if (typeof Mustache == 'object') {
                this.settings.render_engine = 'mustache';
            }

            // mode
            switch (this.settings.mode) {
                case "display-grant":
                    me.lookupAndDisplay(element, 'display-grant-tpl');
                    break;
                case "lookup-grant":
                    this.bindLookup(element);
                    break;
                case "search-grant":
                    this.bindSearch(element);
                    this.bindLookup(element);
                    break;
                default:
                    // console.log(this.settings.mode);
                    break;
            }
        },

        bindLookup: function (element) {
            var me = this;

            var target;
            if ($(element).next('.display-target').length > 0) {
                target = $(element).next('.display-target')[0];
            } else {
                target = $("<div class='display-target'/>").insertAfter(element);
            }

            me.lookup(element, target);
            $(element).on('blur', function() {
                me.lookup(element, target);
            });

            $(element).on('keyup', function() {
                delay(function(){
                   me.lookup(element, target);
                }, 1000);
            });

            var delay = (function(){
                var timer = 0;
                return function(callback, ms){
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })();

        },

        bindSearch: function (element) {
            var me = this;

            var searchToggle;
            if ($(element).next('.search-toggle').length > 0) {
                searchToggle = $(element).next('.search-toggle')[0];
            } else {
                searchToggle = $("<a href='javascript:;' class='search-toggle'>Open Search</a>").insertAfter(element);
            }

            var searchContainer;
            if ($(searchToggle).next('.search-container').length > 0) {
                searchContainer = $(searchToggle).next('.search-container')[0];
            } else {
                searchContainer = $("<div class='search-container'></div>").insertAfter(searchToggle);
            }
            searchContainer.hide();

            var displayOptions = {};
            if (this.settings['search_options']) {
                if (this.settings['search_options']['facets']) {
                    displayOptions['facets'] = this.settings['search_options']['facets'];
                }
            }
            this.render(searchContainer, displayOptions, "search-tpl");

            // click event on the search toggle to open the search container
            searchToggle.on('click', function() {
                searchContainer.slideToggle();
            });

            var searchQuery = $('.search-query', searchContainer);
            var searchButton = $('.search-button', searchContainer);
            var searchResult = $('.search-result', searchContainer);

            // auto search
            if (this.settings['search_options'] && this.settings['search_options']['auto_search']) {
                me.search($(searchQuery).val(), searchResult);
                searchContainer.show();
            }

            // enter key for search Query
            searchQuery.on('keyup', function(event) {
                if(event.which == 13) {
                    me.search($(searchQuery).val(), searchResult);
                }
            });

            // click event on the search button
            searchButton.on('click', function() {
                me.search($(searchQuery).val(), searchResult);
            });

            // click event on one of the search result item
            $(searchResult).on('click', '.search-result-item', function() {
                $(element).val($(this).data('purl'));
                $(searchContainer).hide();

                $(element).blur();

                //todo configurable?
                $('html, body').animate({
                    scrollTop: $(element).offset().top
                }, 500);

            });

            //bind facetSelect
            $(searchResult).on('change', '.facet-select', function() {
                var param = $(this).data('param');
                var value = $(this).val();
                me.params[param] = value;
                me.search($(searchQuery).val(), searchResult);
            });

            //bind showMore
            $(searchResult).on('click', '.show-more', function() {
                var pp;
                pp = me.params['pp'] ? me.params['pp'] : 30;
                me.params['rows'] = me.params['rows'] ? me.params['rows'] + pp : 30 + pp;
                me.search($(searchQuery).val(), searchResult);
            });

        },

        lookup: function(element, target) {
            var me = this;
            if ($(element).val() != "" && me.params.purl != $(element).val()) {
                me.params.purl = $(element).val();
                me.lookupAndDisplay(target, 'display-grant-tpl');
            }
        },

        search: function(searchQuery, searchResultContainer) {
            var me = this;
            delete me.params.purl;
            me.params.q = searchQuery;
            me.lookupAndDisplay(searchResultContainer, 'search-result-tpl');
        },

        getSearchOption: function(option) {
            if (this.settings['search_options'] && this.settings['search_options'][option]) {
                return this.settings['search_options'][option];
            } else {
                return false;
            }
        },

        lookupAndDisplay: function(element, template) {
            var me = this;

            if ($(element).text()=="") {
                $(element).text('Loading...');
            }

            if (me.getSearchOption('facets') !== false) {
                me.params.facets = me.getSearchOption('facets').join();
            }

            me.service.lookup(me.params).done(function(data){
                if (me.hasCallback('display')) {
                    me.callback('display', element, data);
                } else {
                    me.render(element, data, template);
                }
            });
        },

        hasCallback: function (event) {
            if (this.settings.hasOwnProperty('evt')
                && this.settings.evt.hasOwnProperty(event)
                && typeof this.settings.evt[event] == 'function'
            ) {
                return true;
            } else {
                return false;
            }
        },

        callback: function(event, element, data) {
            this.settings['evt'][event](element, data);
        },

        setParams: function () {

            //decide on the API URL
            if (this.settings.mode.indexOf('grant') > -1) {
                this.settings.api_url = this.settings.service_url + 'v2.0/registry.jsonp/grants';
            }

            //append api_key as a param
            if (this.settings.api_key) {
                this.params['api_key'] = this.settings.api_key;
            }

            this.params = $.extend( {}, this.params, $(this.element).data());
            if (this.getSearchOption('params')) {
                this.params = $.extend( {}, this.params, this.getSearchOption('params'));
            }

        },

        render: function(element, content, template) {
            var me = this;
            if (this.settings.render_engine == 'default') {
                $(element).text(JSON.stringify(content));
            } else if(this.settings.render_engine == 'mustache') {
                template = $('#'+template).html();

                // todo : refactor to pre-render process -> return content
                if (content['numFound'] && content['totalFound']) {
                    if (content['numFound'] >= content['totalFound']) {
                        content['more'] = false;
                    } else {
                        content['more'] = true;
                    }
                }

                if (content['facets']) {
                    $.each(content['facets'], function(idx, data) {
                        content[idx + '_facet'] = data;
                        content['hasfacet_'+idx] = true;
                    });
                }

                console.log(content);

                var output = Mustache.render(template, content);
                $(element).html(output);

                // todo : refactor to post-render process -> fix display
                // bind selects on element (for search only)
                $.each($('select', element), function(){
                    var param = $(this).data('param');
                    if (me.params[param]) {
                        $(this).val(me.params[param]);
                    }
                });

            } else {
                console.error('No rendering engine found');
            }
        }


    } );

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ widgetName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + widgetName ) ) {
                $.data( this, "plugin_" + widgetName, new ANDSRegistryWidget( this, options ) );
            }
        } );
    };

    /**
     * API Service for hitting ANDS Registry API
     * @returns {{lookup: lookup, get: get}}
     * @constructor
     */
    function APIService(settings) {

        return {
            lookup: function(params) {
                return this.get(settings.api_url, params).then(function(data){
                    return data;
                });
            },
            get: function(url, params) {
                return $.ajax({
                    dataType:'jsonp',
                    url: url,
                    data: params
                }).then(function(data){
                   return data;
                });
            }
        }
    }

} )( jQuery, window, document );