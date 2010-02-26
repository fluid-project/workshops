package org.jasig.portlet.fliquor.mvc.portlet;

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

	@RequestMapping
	public String getMainView() {
		return "fliquor";
	}
	
}
