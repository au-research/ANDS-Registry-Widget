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
                searchContainer.toggle();
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
                if (me.hasCallback('post-select-result-item')) {
                    me.callback('post-select-result-item', $(this), $(element));
                }
            });

            //bind facetSelect
            $(searchResult).on('change', '.facet-select', function() {
                var param = $(this).data('param');
                me.params[param] = $(this).val();
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
                $(me.element).trigger("ands.registry-widget.search-complete", data);
                if (me.hasCallback('display')) {
                    me.callback('display', element, data);
                } else {
                    me.render(element, data, template);
                }
            });
        },

        hasCallback: function (event) {
            return !!(this.settings.hasOwnProperty('evt')
            && this.settings.evt.hasOwnProperty(event)
            && typeof this.settings.evt[event] == 'function');
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

                template = me.getTemplate(template);
                // todo : refactor to pre-render process -> return content
                if (content['numFound'] && content['totalFound']) {
                    content['more'] = content['numFound'] < content['totalFound'];
                }

                if (content['facets']) {
                    $.each(content['facets'], function(idx, data) {
                        content[idx + '_facet'] = data;
                        content['hasfacet_'+idx] = true;
                    });
                }

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
            $(me.element).trigger("ands.registry-widget.render-complete", [element,content,template]);
        },

        getTemplate: function(tpl) {
            var template = "No template found!";
            var userDefinedTemplate = $('#'+tpl);

            if (userDefinedTemplate.length > 0) {
                template = userDefinedTemplate.html();
            } else if (defaultTemplates[tpl]) {
                template = defaultTemplates[tpl];
            }

            return template;
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

    var defaultTemplates = {
        'display-grant-tpl': '<div class="well"> {{ #recordData }} <h4>{{title}}</h4> <dl> {{ #purl }} <dt>PURL</dt> <dd>{{ purl }}</dd> {{ /purl }} {{ #institutions }} <dt>Institutions</dt> <dd>{{ institutions }}</dd> {{ /institutions }} {{ #funder }} <dt>Funder</dt> <dd>{{ funder }}</dd> {{ /funder }} {{ #fundingScheme }} <dt>Funding Scheme</dt> <dd>{{ fundingScheme }}</dd> {{ /fundingScheme }} {{ #researchers }} <dt>Researcher</dt> <dd>{{ researchers }}</dd> {{ /researchers }} </dl> {{ description }} {{ /recordData }} {{ ^recordData }} <p>No result found!</p> {{ /recordData}} </div>',
        'search-tpl' : '<div class="well"> <div class="form-group"><label for="lookup-grant">Search Query</label> <div class="input-group"> <input type="text" class="form-control search-query" placeholder="Search Query" value="{{ searchQuery }}"/> <span class="input-group-btn"> <a href="javascript:;" class="btn btn-default search-button">Search</a> </span> </div> </div> <div class="search-result"></div> </div>',
        'search-result-tpl': '{{ #hasfacet_administering_institution }} <div class="form-group"><label for="">Institutions</label> <select class="form-control facet-select" data-param="institution"> <option value=""></option> {{ #administering_institution_facet }} <option value="{{ key }}">{{ key }}</option> {{ /administering_institution_facet }} </select> </div> {{ /hasfacet_administering_institution }} {{ #hasfacet_funders }} <div class="form-group"> <label for="">Funders</label> <select class="form-control facet-select" data-param="funder"> <option value=""></option> {{ #funders_facet }} <option value="{{ key }}">{{ key }}</option> {{ /funders_facet }} </select> </div> {{ /hasfacet_funders }} {{ #hasfacet_type }} <div class="form-group"> <label for="">Type</label> <select class="form-control facet-select" data-param="type"> <option value=""></option> {{ #type_facet }} <option value="{{ key }}">{{ key }}</option> {{ /type_facet }} </select> </div> {{ /hasfacet_type }} {{ #hasfacet_funding_scheme }} <div class="form-group"><label for="">Funding Scheme</label><select class="form-control facet-select" data-param="fundingScheme"><option value=""></option> {{ #funding_scheme_facet }} <option value="{{ key }}">{{ key }}</option> {{ /funding_scheme_facet }} </select> </div> {{ /hasfacet_funding_scheme }} <ul> {{ #recordData }} <li><a href="javascript:;" class="search-result-item" data-purl="{{ purl }}"> {{ title }} </a> </li> {{ /recordData }} </ul> <p>Displaying ({{ numFound }}/{{ totalFound }}) results</p> {{ #more }} <a href="javascript:;" class="show-more">Show More</a> {{ /more }}{{ ^recordData }}<p>No result found!</p>{{ /recordData }}'
    }


} )( jQuery, window, document );