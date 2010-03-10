package org.jasig.portlet.fliquor.mvc.portlet;

import java.util.HashMap;
import java.util.Map;

import javax.portlet.PortletRequest;

import org.jasig.portlet.fliquor.mvc.service.IFliquorViewSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.portlet.ModelAndView;

/**
 * FliquorPortletController is an extremely simple portlet controller that
 * displays a single JSP view representing the Fliquor portlet's user
 * interface.
 * 
 * @author Jen Bourey, jennifer.bourey@gmail.com
 * @version $Revision$
 */
@Controller
@RequestMapping("VIEW")
public class FliquorPortletController {

	private IFliquorViewSelector viewSelector;
	
	@Autowired(required = true)
	public void setViewSelector(IFliquorViewSelector viewSelector) {
		this.viewSelector = viewSelector;
	}
	
	@RequestMapping
	public String getMainView(PortletRequest request) {
		return this.viewSelector.getViewName(request); 
	}
	
	@RequestMapping(params="action=imageInfo")
	public ModelAndView getImageInfoView(PortletRequest request,
			@RequestParam(value="photoID") String photoId) {
		Map<String,String> model = new HashMap<String, String>();
		model.put("photoId", photoId);
		return new ModelAndView("cabinet", model); 
	}
	
}
