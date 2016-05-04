( function ($, QUnit) {

    "use strict";

    var $testCanvas = $("#testCanvas");
    var $fixture = null;

    QUnit.module("ANDS Registry Widget - Lookup Grant", {
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
     * todo test lookup using id field
     * todo test lookup callback
     */
    QUnit.test("lookup a sample purl returns the right result", function (assert) {

        var testPurl = "http://purl.org/au-research/grants/goyder/E.1.6";
        $fixture = $("<input type='text' id='lookup-grant' value='http://purl.org/au-research/grants/goyder/E.1.6'/>");

        $fixture.registryWidget({
            api_key: "testAPI",
            mode: "lookup-grant"
        });

        var done = assert.async();
        setTimeout(function() {
            var pluginData = $fixture.data("plugin_registryWidget");

            pluginData.service.lookup(pluginData.params).then(function(data) {
                console.log($fixture.next('.display-target'));
                assert.equal(true, data['recordData'].length > 0, "has some record data returned in the lookup");
                assert.equal(1, data['totalFound'], 'found 1 result');
                assert.equal(testPurl, data['recordData'][0]['purl'], "has the same PURL")
                done();
            });
        },0);

    });


}(jQuery, QUnit) );