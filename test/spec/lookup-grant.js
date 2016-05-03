( function ($, QUnit) {

    "use strict";

    var $testCanvas = $("#testCanvas");
    var $fixture = null;

    QUnit.module("ANDS Registry Widget Lookup for Grant", {
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

    QUnit.test("is inside jQuery library", function (assert) {
        assert.equal(typeof $.fn.registryWidget, "function", "has function inside jquery.fn");
        assert.equal(typeof $fixture.registryWidget, "function", "another way to test it");
    });

    QUnit.test("enable custom config", function (assert) {
        $fixture.registryWidget({
            api_key: "testAPI",
            evt: {
                lookup: function(element, data) {

                },
                search: 'something'
            }
        });
        var pluginData = $fixture.data("plugin_registryWidget");
        assert.equal(pluginData.settings.api_key, "testAPI", "option API Key");
        assert.equal(true, pluginData.hasCallback('lookup'));
        assert.equal(false, pluginData.hasCallback('search'));
    });


    QUnit.test("can lookup", function (assert) {

        $fixture = $("<div data-purl='http://purl.org/au-research/grants/goyder/E.1.7'></div>");

        var testPurl = "http://purl.org/au-research/grants/goyder/E.1.7";
        $fixture.registryWidget({
            api_key: "testAPI",
            purl: testPurl
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