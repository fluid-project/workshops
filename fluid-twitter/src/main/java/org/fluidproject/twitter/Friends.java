package org.fluidproject.twitter;

import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Friends
 */
public class Friends extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private Twitter twitter;
	
    /**
     * Default constructor. 
     */
    public Friends() {
        twitter = new Twitter(Twitter.JSON);
    }
    
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, 
						 HttpServletResponse response) throws IOException {
		HTTPUtils.forwardGet(twitter.getFriendsUrl(), request, response);
	}
}
