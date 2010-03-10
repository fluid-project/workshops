<%@ page contentType="text/html" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet" %>
<%@ taglib prefix="rs" uri="http://www.jasig.org/resource-server" %>

<c:set var="namespace"><portlet:namespace/></c:set>

<link type="text/css" rel="stylesheet" href="<c:url value="/css/fliquor.css"/>" />

<script src="<rs:resourceURL value="/rs/jquery/1.3.2/jquery-1.3.2.min.js"/>" type="text/javascript"></script>
<script src="<rs:resourceURL value="/rs/jqueryui/1.7.2/jquery-ui-1.7.2-v2.min.js"/>" type="text/javascript"></script>
<script src="<rs:resourceURL value="/rs/fluid/1.1.2/js/fluid-all-1.1.2.min.js"/>" type="text/javascript"></script>
<script type="text/javascript" src="<c:url value="/scripts/engageRenderUtils.js"/>"></script>
<script type="text/javascript" src="<c:url value="/scripts/Cabinet.js"/>"></script>
<script type="text/javascript" src="<c:url value="/scripts/cabinetDemo.js"/>"></script>

<div class="cabinet">
    <div class="fl-table demo-image-content">
        <div class="fl-table-cell demo-image-cell">
            <img class="dc-image demo-image" src="" alt=""/>
        </div>
    </div>
    
    <div class="flc-cabinet-drawer">
        <div class="flc-cabinet-handle">
            <h2 class="flc-cabinet-header">Info</h2>
        </div>
        <div class="flc-cabinet-contents fl-col-mixed">
            <ol class="fl-list">
                <li>
                    <span class="demo-list-key">Title:</span><span class="dc-title-text demo-info-text">Title of Image</span>
                </li>
                <li>
                    <span class="demo-list-key">Description:</span><span class="dc-desc-text demo-info-text">Some Description Text</span>
                </li>
                <li>
                    <span class="demo-list-key">Date:</span><span class="dc-date-text demo-info-text">Today</span>
                </li>
            </ol>
        </div>
    </div>
    <div class="flc-cabinet-drawer">
        <div class="flc-cabinet-handle">
            <h2 class="flc-cabinet-header">Tags</h2>
        </div>
        <div class="flc-cabinet-contents">
            <div class="demo-tags">
                <span class="dc-link-container">
                    <a class="dc-link demo-link" href="http://www.flickr.com/photos/tags/jasig/">tag</a>
                </span>
                
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    var ${namespace} = ${namespace} || {};
    ${namespace}.jQuery = jQuery.noConflict(true);
    ${namespace}.fluid = fluid;
    delete fluid;

    ${namespace}.jQuery(function(){
        var $ = ${namespace}.jQuery;
        
        $(document).ready(function () {
            demo.initCabinetView(".cabinet", { model: {
                photoID: '${ photoId }',
                dataFeedURL: '<c:url value="/ajax/flickrImageInfo"/>' }
            });
        });
    });
</script>
    