package org.jasig.portlet.fliquor.mvc.portlet;

import javax.portlet.PortletRequest;

import org.jasig.portlet.fliquor.mvc.service.IFliquorViewSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

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
	
}
