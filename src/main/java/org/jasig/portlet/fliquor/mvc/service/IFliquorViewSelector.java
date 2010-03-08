package org.jasig.portlet.fliquor.mvc.service;

import javax.portlet.PortletRequest;

public interface IFliquorViewSelector {

	public String getViewName(PortletRequest request);
	
}
