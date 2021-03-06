( function( $, QUnit ) {

    "use strict";

    var $testCanvas = $( "#testCanvas" );
    var $fixture = null;

    QUnit.module( "ANDS Registry Widget - Widget Generation", {
        beforeEach: function() {

            // fixture is the element where your jQuery plugin will act
            $fixture = $( "<div/>" );
            $testCanvas.append( $fixture );
        },
        afterEach: function() {

            // we remove the element to reset our plugin job :)
            $fixture.remove();
        }
    } );

    /**
     * Most basic test
     */
    QUnit.test( "is inside jQuery library", function( assert ) {
        assert.equal( typeof $.fn.registryWidget, "function", "has function inside jquery.fn" );
        assert.equal( typeof $fixture.registryWidget, "function", "another way to test it" );
    } );

    QUnit.test( "returns jQuery functions after called (chaining)", function( assert ) {
        assert.equal(
            typeof $fixture.registryWidget().on,
            "function",
            "'on' function must exist after plugin call" );
    } );

    QUnit.test( "enable custom config", function( assert ) {
        $fixture.registryWidget( {
            apiKey: "testAPI"
        } );
        var pluginData = $fixture.data( "plugin_registryWidget" );
        assert.equal( pluginData.settings.apiKey, "testAPI", "option API Key" );
    } );

}( jQuery, QUnit ) );
