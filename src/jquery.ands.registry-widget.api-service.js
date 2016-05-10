APIService = ( function( $, window, document, undefined ) {
    "use strict";

    /**
     * API Service for hitting ANDS Registry API
     * @returns {{lookup: lookup, get: get}}
     * @constructor
     */
    function APIService ( settings ) {

        return {
            lookup: function( params ) {

                // TODO move to object instantiation
                //decide on the API URL
                if ( settings.mode.indexOf( "activity" ) > -1 ||
                    settings.mode.indexOf( "grant" ) > -1 ) {
                    settings.apiUrl = settings.serviceUrl +
                        "v2.0/registry.jsonp/activities";
                }

                //append apiKey as a param
                if ( settings.apiKey ) {
                    params.apiKey = settings.apiKey;
                }

                // for API Service, we use api_key instead
                if ( params.apiKey ) {
                    params[ "api_key" ] = params.apiKey;
                    delete params.apiKey;
                }

                return this.get( settings.apiUrl, params )
                    .then( function( data ) {
                        return data;
                    } );
            },
            get: function( url, params ) {
                return $.ajax( {
                    dataType: "jsonp",
                    url: url,
                    data: params
                } ).then( function( data ) {
                    return data;
                } );
            }
        };
    }

    return {
        create: APIService
    };

} )( jQuery, window, document, undefined );
