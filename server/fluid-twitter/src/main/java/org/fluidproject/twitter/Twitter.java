package org.fluidproject.twitter;

public class Twitter {
	
	public static final String JSON = ".json";
	public static final String XML = ".xml";
	private static final String USER_URL = "https://twitter.com/users/show"
	private static final String FRIENDS_URL = "https://twitter.com/statuses/friends";
	private static final String STATUSES_URL = "https://twitter.com/statuses/user_timeline";
	private static final String STATUS_UPDATE_URL = "https://twitter.com/statuses/update";
	
	private String currentFormat;
	
	public Twitter(String format) {
		currentFormat = format;
	}
	
	public String getFriendsUrl() {
		return FRIENDS_URL + currentFormat;
	}
	
	public String getStatusesUrl() {
		return STATUSES_URL + currentFormat;
	}
	
	public String getStatusUpdateUrl() {
		return STATUS_UPDATE_URL + currentFormat;
	}
}
