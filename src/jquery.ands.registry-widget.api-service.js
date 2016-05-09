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
