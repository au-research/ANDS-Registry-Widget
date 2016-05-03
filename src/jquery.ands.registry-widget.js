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
            mode: 'lookup-grant',
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
            // console.log(this.params, this.settings);

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
                case "lookup-grant":

                    this.service.lookup(this.params).done(function(data){
                        if (me.hasCallback('lookup')) {
                            me.callback('lookup', element, data);
                        } else {
                            console.log(data);
                            me.render(element, data, '{{ #recordData }} <h1>{{title}}</h1> {{ /recordData }}');
                        }
                    });

                    // console.log($(this.element).data('purl'));
                    break;
                default:
                    // console.log(this.settings.mode);
                    break;
            }
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

        },

        render: function(element, content, template) {
            if (this.settings.render_engine == 'default') {
                $(element).text(JSON.stringify(content));
            } else if(this.settings.render_engine == 'mustache') {
                var output = Mustache.render(template, content);
                $(element).html(output);
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