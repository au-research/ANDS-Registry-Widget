module.exports = function( config ) {

    config.set( {
        files: [
            "node_modules/jquery/dist/jquery.js",
            "bower_components/mustache.js/mustache.min.js",
            "test/setup.js",
            "dist/jquery.ands.registry-widget.min.js",
            "test/spec/*"
        ],
        frameworks: [ "qunit" ],
        autoWatch: true
    } );
};
