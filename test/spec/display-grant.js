( function ($, QUnit) {

    "use strict";

    var $testCanvas = $("#testCanvas");
    var $fixture = null;

    QUnit.module("ANDS Registry Widget - Display Grant", {
        beforeEach: function () {
            // fixture is the element where your jQuery plugin will act
            $fixture = $("<div/>");
            $testCanvas.append($fixture);
        },
        afterEach: function () {
            // we remove the element to reset our plugin job :)
            $fixture.remove();
        }
    });

    /**
     * Most basic test
     */
    QUnit.test("is inside jQuery library", function (assert) {
        assert.equal(typeof $.fn.registryWidget, "function", "has function inside jquery.fn");
        assert.equal(typeof $fixture.registryWidget, "function", "another way to test it");
    });

    QUnit.test( "returns jQuery functions after called (chaining)", function( assert ) {
        assert.equal(
            typeof $fixture.registryWidget().on,
            "function",
            "'on' function must exist after plugin call" );
    } );

    QUnit.test("enable custom config", function (assert) {
        $fixture.registryWidget({
            api_key: "testAPI",
            evt: {
                display: function(element, data) {

                },
                search: 'something'
            }
        });
        var pluginData = $fixture.data("plugin_registryWidget");
        assert.equal(pluginData.settings.api_key, "testAPI", "option API Key");
        assert.equal(true, pluginData.hasCallback('display'));
        assert.equal(false, pluginData.hasCallback('search'));
    });

    /**
     * todo test lookup using id field
     * todo test lookup callback
     */
    QUnit.test("lookup a sample purl returns the right result", function (assert) {

        $fixture = $("<div data-purl='http://purl.org/au-research/grants/arc/DP140100435'></div>");

        var testPurl = "http://purl.org/au-research/grants/arc/DP140100435";
        $fixture.registryWidget({
            api_key: "testAPI",
            purl: testPurl,
            mode: 'display-grant'
        });

        var done = assert.async();
        setTimeout(function() {
            var pluginData = $fixture.data("plugin_registryWidget");
            pluginData.service.lookup(pluginData.params).then(function(data) {
                assert.equal(true, data['recordData'].length > 0, "has some record data returned in the lookup");
                assert.equal(1, data['totalFound'], 'found 1 result');
                assert.equal(testPurl, data['recordData'][0]['purl'], "has the same PURL")
                done();
            });
        },0);

    });


}(jQuery, QUnit) );