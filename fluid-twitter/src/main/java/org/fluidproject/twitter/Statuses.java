package org.fluidproject.twitter;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Statuses
 */
public class Statuses extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	private Twitter twitter;
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Statuses() {
        twitter = new Twitter(Twitter.JSON);
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, 
						 HttpServletResponse response) throws IOException {
		HTTPUtils.forwardGet(twitter.getStatusesUrl(), request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HTTPUtils.forwardPost(twitter.getStatusUpdateUrl(), request, response);
	}
}
