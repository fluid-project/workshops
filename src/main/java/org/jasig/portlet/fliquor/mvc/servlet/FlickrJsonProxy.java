package org.jasig.portlet.fliquor.mvc.servlet;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.jasig.web.view.mvc.ProxyView;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

/**
 * FlickrJsonProxy provides a simple proxy of Flickr's JSON search service.
 * This proxy was originally intended to provide a workaround for the browser's
 * single origin policy.
 * 
 * This implementation currently is not particularly configurable; future
 * improvements might include the ability to specify the API key and response
 * format.
 * 
 * @author Jen Bourey, jennifer.bourey@gmail.com
 * @version $Revision$
 */
@Controller
@RequestMapping("/ajax/flickrSearch")
public class FlickrJsonProxy {

	private String flickrBaseUrl = "http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&content_type=1";

	private String apiKey = "e65a1289edd23313ed5469f096e5196c";
	
	/**
	 * Set the API key to be used when contacting the Flickr service.
	 * 
	 * @param apiKey
	 */
	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}
	
	private int numberResults = 25;
	
	/**
	 * Set the maximum number of results to be returned.
	 * 
	 * @param numberResults
	 */
	public void setNumberResults(int numberResults) {
		this.numberResults = numberResults;
	}
	
	/**
	 * Return a proxied view of the JSON search results for the user's 
	 * search term.
	 * 
	 * @param request
	 * @param searchTerm
	 * @return
	 */
	@RequestMapping(method = RequestMethod.GET)
	public ModelAndView getFlickrSearchResults(HttpServletRequest request,
			@RequestParam(value="searchTerm") String searchTerm) {

		/*
		 * Generate the search URL for the user-specified search term and add
		 * it to our model.
		 */

		StringBuffer url = new StringBuffer();
		url.append(flickrBaseUrl);
		url.append("&per_page=").append(this.numberResults);
		url.append("&api_key=").append(this.apiKey);
		url.append("&text=").append(searchTerm);
		
		Map<String, String> map = new HashMap<String, String>();
		map.put(ProxyView.URL, url.toString());
		
		// return a proxy view of the URL
		return new ModelAndView("proxyView", map);
		
	}

}
