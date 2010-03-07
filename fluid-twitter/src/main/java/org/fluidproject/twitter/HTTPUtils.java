package org.fluidproject.twitter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HTTPUtils {

	public static String prepareBasicAuth(String username, String password) {
		String auth = username + ":" + password;
		return (new sun.misc.BASE64Encoder()).encode(auth.getBytes());
	}
	
	public static String prepareQueryString(HttpServletRequest request) {
		String queryString = "";
		Enumeration<?> params = request.getParameterNames();
		while (params.hasMoreElements()) {
			String name = (String) params.nextElement();
			String value = request.getParameter(name);
			
			if (!"u".equals(name) && !"p".equals(name)) {
				queryString = queryString + name + "=" + value;
				
				if (params.hasMoreElements()) {
					queryString = queryString + "&";
				}
			}
		}
		
		return queryString;
	}
	
    public static void forwardError(HttpURLConnection connection,
    						 HttpServletResponse response) throws IOException {
    	response.sendError(connection.getResponseCode(), connection.getResponseMessage());
    }

    public static void forwardResponse(HttpURLConnection connection, 
    							 	  HttpServletResponse response) throws IOException {
    	// If we didn't get an OK status back, something bad happened. Pass it on the user.
		if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
			forwardError(connection, response);
			return;
		}
		
	      // Pass on basic headers.
        response.setContentType(connection.getContentType());
        response.setContentLength(connection.getContentLength());
		
		// Read from the Web connection and write it to the response.
		BufferedReader fromTwitter = null;
		try {
			fromTwitter = new BufferedReader(new InputStreamReader(connection.getInputStream()));
			PrintWriter responseOut = null;
			try {
				responseOut = response.getWriter();
				String inputLine = fromTwitter.readLine();
				while (inputLine != null) {
					responseOut.println(inputLine);
					inputLine = fromTwitter.readLine();
				}
			} finally {
				responseOut.close();
			}
		} finally {
			fromTwitter.close();
		}
    }
    
    public static void forwardRequest(HttpURLConnection connection,
    								  HttpServletRequest request) throws IOException {
    	// Write the request parameters to the body of a POST request.
    	OutputStreamWriter out = null;
    	try {
    		out = new OutputStreamWriter(connection.getOutputStream());
    		out.write(prepareQueryString(request));
    	} finally {
    		out.close();
    	}
    }
    
	public static HttpURLConnection connect(String url) throws IOException {
		URL toConnect = new URL(url);
		HttpURLConnection connection = (HttpURLConnection) toConnect.openConnection();
		
		return connection;
	}
	
	public static HttpURLConnection getURL(String url, String auth, String query) throws IOException {
		HttpURLConnection connection = HTTPUtils.connect(url + "?" + query);
		connection.setRequestMethod("GET");
		connection.setRequestProperty("Authorization", "Basic " + auth);
		connection.connect();

		return connection;
	}
	
	public static HttpURLConnection postURL(String url, String auth) throws IOException {
		HttpURLConnection connection = HTTPUtils.connect(url);
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Authorization", "Basic " + auth);		
		connection.connect();
		
		return connection;
	}
    
    public static void forwardGet(String url, 
    						 	  HttpServletRequest request, 
    						 	  HttpServletResponse response) throws IOException{
		String auth = HTTPUtils.prepareBasicAuth(request.getParameter("u"),
					     						 request.getParameter("p"));
		String query = HTTPUtils.prepareQueryString(request);
		
		HttpURLConnection connection = null;
		try {
			connection = HTTPUtils.getURL(url, auth, query);
			HTTPUtils.forwardResponse(connection, response);
		} finally {
			connection.disconnect();
		}
    }
    
    public static void forwardPost(String url, 
    							   HttpServletRequest request, 
    							   HttpServletResponse response) throws IOException {
		String auth = HTTPUtils.prepareBasicAuth(request.getParameter("u"),
						 						 request.getParameter("p"));
		HttpURLConnection connection = HTTPUtils.postURL(url, auth);
		connection.connect();
		
		try {
			HTTPUtils.forwardRequest(connection, request);
			HTTPUtils.forwardResponse(connection, response);
		} finally {
			connection.disconnect();
		}
    }
}
