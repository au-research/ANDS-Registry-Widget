defaultTemplates = ( function( $, window, document, undefined ) {
    "use strict";

    var displayGrantTemplate = "<div class=\"well\">";
    displayGrantTemplate += "        {{ #recordData }}";
    displayGrantTemplate += "        <h4>{{title}}<\/h4>";
    displayGrantTemplate += "        <dl>";
    displayGrantTemplate += "            {{ #purl }}";
    displayGrantTemplate += "            <dt>PURL<\/dt>";
    displayGrantTemplate += "            <dd>{{ purl }}<\/dd>";
    displayGrantTemplate += "            {{ \/purl }}";
    displayGrantTemplate += "            {{ #institutions }}";
    displayGrantTemplate += "            <dt>Institutions<\/dt>";
    displayGrantTemplate += "            <dd>{{ institutions }}<\/dd>";
    displayGrantTemplate += "            {{ \/institutions }}";
    displayGrantTemplate += "            {{ #funder }}";
    displayGrantTemplate += "            <dt>Funder<\/dt>";
    displayGrantTemplate += "            <dd>{{ funder }}<\/dd>";
    displayGrantTemplate += "            {{ \/funder }}";
    displayGrantTemplate += "            {{ #fundingScheme }}";
    displayGrantTemplate += "            <dt>Funding Scheme<\/dt>";
    displayGrantTemplate += "            <dd>{{ fundingScheme }}<\/dd>";
    displayGrantTemplate += "            {{ \/fundingScheme }}";
    displayGrantTemplate += "            {{ #researchers }}";
    displayGrantTemplate += "            <dt>Researchers<\/dt>";
    displayGrantTemplate += "            <dd>{{ researchers }}<\/dd>";
    displayGrantTemplate += "            {{ \/researchers }}";
    displayGrantTemplate += "        <\/dl>";
    displayGrantTemplate += "        {{ description }}";
    displayGrantTemplate += "        {{ \/recordData }}";
    displayGrantTemplate += "        {{ ^recordData }}";
    displayGrantTemplate += "        <p>No result found!<\/p>";
    displayGrantTemplate += "        {{ \/recordData}}";
    displayGrantTemplate += "    <\/div>";

    var searchGrant = "<div class=\"well\">";
    searchGrant += "    <div class=\"form-group\">";
    searchGrant += "        <label for=\"lookup-grant\">Search Query<\/label>";
    searchGrant += "";
    searchGrant += "        <div class=\"input-group\">";
    searchGrant += "            <span class=\"input-group-btn\">";
    searchGrant += "                <div class=\"btn-group\">";
    searchGrant += "                    <button type=\"button\"";
    searchGrant += "class=\"btn btn-default dropdown-toggle btn-select-query-option\"";
    searchGrant += "data-toggle=\"dropdown\" aria-haspopup=\"true\"";
    searchGrant += "                            aria-expanded=\"false\">";
    searchGrant += "                        <span class=\"value active-query-option\"";
    searchGrant += "                              data-value=\"{{ activeQueryOptionValue }}\">";
    searchGrant += "                            {{ activeQueryOptionDisplay }}";
    searchGrant += "                        <\/span>";
    searchGrant += "                        <span class=\"caret\"><\/span>";
    searchGrant += "                    <\/button>";
    searchGrant += "                    <ul class=\"dropdown-menu\">";
    searchGrant += "                        {{ #searchQueryOptions }}";
    searchGrant += "                            <li><a href=\"javascript:;\"";
    searchGrant += "                   class=\"select-query-option\"";
    searchGrant += "                   data-value=\"{{ value }}\">{{ display }}<\/a><\/li>";
    searchGrant += "                        {{ \/searchQueryOptions }}";
    searchGrant += "                    <\/ul>";
    searchGrant += "                <\/div>";
    searchGrant += "            <\/span>";
    searchGrant += "            <input type=\"text\" class=\"form-control search-query\"";
    searchGrant += "                   placeholder=\"Search Query\"";
    searchGrant += "                   value=\"{{ searchQuery }}\"\/>";
    searchGrant += "            <span class=\"input-group-btn\">";
    searchGrant += "                <a href=\"javascript:;\"";
    searchGrant += "                   class=\"btn btn-default search-button\">Search<\/a>";
    searchGrant += "            <\/span>";
    searchGrant += "        <\/div>";
    searchGrant += "    <\/div>";
    searchGrant += "    <div class=\"search-result\"><\/div>";
    searchGrant += "<\/div>";

    var searchResult = "{{ #hasfacet_administering_institution }}";
    searchResult += "<div class=\"form-group\">";
    searchResult += "    <label for=\"\">Institutions<\/label>";
    searchResult += "    <select class=\"form-control facet-select\" data-param=\"institution\">";
    searchResult += "        <option value=\"\"><\/option>";
    searchResult += "        {{ #administering_institution_facet }}";
    searchResult += "        <option value=\"{{ key }}\">{{ key }}<\/option>";
    searchResult += "        {{ \/administering_institution_facet }}";
    searchResult += "    <\/select>";
    searchResult += "<\/div>";
    searchResult += "{{ \/hasfacet_administering_institution }}";
    searchResult += "";
    searchResult += "{{ #hasfacet_funders }}";
    searchResult += "<div class=\"form-group\">";
    searchResult += "    <label for=\"\">Funders<\/label>";
    searchResult += "    <select class=\"form-control facet-select\" data-param=\"funder\">";
    searchResult += "        <option value=\"\"><\/option>";
    searchResult += "        {{ #funders_facet }}";
    searchResult += "        <option value=\"{{ key }}\">{{ key }}<\/option>";
    searchResult += "        {{ \/funders_facet }}";
    searchResult += "    <\/select>";
    searchResult += "<\/div>";
    searchResult += "{{ \/hasfacet_funders }}";
    searchResult += "";
    searchResult += "{{ #hasfacet_type }}";
    searchResult += "<div class=\"form-group\">";
    searchResult += "    <label for=\"\">Type<\/label>";
    searchResult += "    <select class=\"form-control facet-select\" data-param=\"type\">";
    searchResult += "        <option value=\"\"><\/option>";
    searchResult += "        {{ #type_facet }}";
    searchResult += "        <option value=\"{{ key }}\">{{ key }}<\/option>";
    searchResult += "        {{ \/type_facet }}";
    searchResult += "    <\/select>";
    searchResult += "<\/div>";
    searchResult += "{{ \/hasfacet_type }}";
    searchResult += "";
    searchResult += "{{ #hasfacet_funding_scheme }}";
    searchResult += "<div class=\"form-group\">";
    searchResult += "    <label for=\"\">Funding Scheme<\/label>";
    searchResult += "    <select class=\"form-control facet-select\" data-param=\"fundingScheme\">";
    searchResult += "        <option value=\"\"><\/option>";
    searchResult += "        {{ #funding_scheme_facet }}";
    searchResult += "        <option value=\"{{ key }}\">{{ key }}<\/option>";
    searchResult += "        {{ \/funding_scheme_facet }}";
    searchResult += "    <\/select>";
    searchResult += "<\/div>";
    searchResult += "{{ \/hasfacet_funding_scheme }}";
    searchResult += "";
    searchResult += "<ul>";
    searchResult += "    {{ #recordData }}";
    searchResult += "    <li>";
    searchResult += "        <a href=\"javascript:;\"";
    searchResult += "           class=\"search-result-item\"";
    searchResult += "           data-purl=\"{{ purl }}\"";
    searchResult += "        >";
    searchResult += "            {{ title }}";
    searchResult += "        <\/a>";
    searchResult += "    <\/li>";
    searchResult += "    {{ \/recordData }}";
    searchResult += "<\/ul>";
    searchResult += "";
    searchResult += "<p>Displaying ({{ numFound }}\/{{ totalFound }}) results<\/p>";
    searchResult += "{{ #more }}";
    searchResult += "<a href=\"javascript:;\" class=\"show-more\">Show More<\/a>";
    searchResult += "{{ \/more }}";
    searchResult += "";
    searchResult += "";
    searchResult += "{{ ^recordData }}";
    searchResult += "<p>No result found!<\/p>";
    searchResult += "{{ \/recordData }}";

    var searchModal = "<div class=\"modal fade\" ";
    searchModal += "     tabindex=\"-1\" ";
    searchModal += "     role=\"dialog\" ";
    searchModal += "     aria-labelledby=\"searchModal\" ";
    searchModal += "     id=\"search-modal\">";
    searchModal += "    <div class=\"modal-dialog\" role=\"document\">";
    searchModal += "        <div class=\"modal-content\">";
    searchModal += "            <div class=\"modal-header\">";
    searchModal += "                <button type=\"button\" ";
    searchModal += "                        class=\"close\" ";
    searchModal += "                        data-dismiss=\"modal\" ";
    searchModal += "                        aria-label=\"Close\">";
    searchModal += "                    <span aria-hidden=\"true\">&times;<\/span>";
    searchModal += "                <\/button>";
    searchModal += "                <h4 class=\"modal-title\" ";
    searchModal += "                    id=\"gridSystemModalLabel\">Search<\/h4>";
    searchModal += "            <\/div>";
    searchModal += "            <div class=\"modal-body\"><\/div>";
    searchModal += "        <\/div>";
    searchModal += "    <\/div>";
    searchModal += "<\/div>";

    return {
        "display-grant-tpl": displayGrantTemplate,
        "search-tpl": searchGrant,
        "search-result-tpl": searchResult,
        "search-modal": searchModal
    };

} )( jQuery, window, document, undefined );
