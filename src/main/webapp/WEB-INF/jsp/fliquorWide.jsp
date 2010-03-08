<%@ page contentType="text/html" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet" %>
<%@ taglib prefix="rs" uri="http://www.jasig.org/resource-server" %>

<c:set var="namespace"><portlet:namespace/></c:set>

<link type="text/css" rel="stylesheet" href="<c:url value="/css/fliquor.css"/>" />

<script src="<rs:resourceURL value="/rs/jquery/1.3.2/jquery-1.3.2.min.js"/>" type="text/javascript"></script>
<script src="<rs:resourceURL value="/rs/jqueryui/1.7.2/jquery-ui-1.7.2-v2.min.js"/>" type="text/javascript"></script>
<script src="<rs:resourceURL value="/rs/fluid/1.1.2/js/fluid-all-1.1.2.min.js"/>" type="text/javascript"></script>
<script type="text/javascript" src="<c:url value="/scripts/fliquor.js"/>"></script>


<div id="${ namespace }fliquorContainer">
    <div class="fl-centered fl-navbar fl-table search-bar">
        <div class="fl-table-cell">
            <input name="a" type="text" class="flc-fliquor-search search" />
            <a href="#" class="flc-fliquor-searchButton fl-button-right">
                <span class="fl-button-inner">Search!</span>
            </a>
        </div>
    </div>

    <div class="fl-container-800 fl-centered">
        <div class="flc-fliquor-welcomeMessage fl-fliquor-start">
            Welcome to Fliquor
        </div>
        <div class="flc-fliquor-searchingMessage fl-fliquor-searching">
            Searching...
        </div>
        <div class="fl-centered results">
            <ol class="flc-fliquor-images fl-list-menu fl-list-thumbnails fl-thumbnails-expanded">                
                <li class="flc-fliquor-template">
                     <a href="#">
                         <span class="wrapper">
                             <span class="flc-fliquor-item-title fl-fliquor-item-title">Title</span>
                             <img title="Title" alt="Alt" src="#" class="fl-icon" />
                         </span>                         
                     </a>
                 </li>
             </ol>
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
	        var fliq = fliquor.imageViewer("#${ namespace }fliquorContainer", 
	    	        { url: '<c:url value="/ajax/flickrSearch"/>' });
	    });
	});
</script>
    