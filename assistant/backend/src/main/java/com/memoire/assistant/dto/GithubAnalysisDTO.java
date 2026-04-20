package com.memoire.assistant.dto;

public class GithubAnalysisDTO {
    private String username;
    private int publicRepos;
    private int followers;
    private int following;
    private String profileUrl;
    private String avatarUrl;
    private String lastActivity;
    // Getters & Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getPublicRepos() { return publicRepos; }
    public void setPublicRepos(int publicRepos) { this.publicRepos = publicRepos; }
    public int getFollowers() { return followers; }
    public void setFollowers(int followers) { this.followers = followers; }
    public int getFollowing() { return following; }
    public void setFollowing(int following) { this.following = following; }
    public String getProfileUrl() { return profileUrl; }
    public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getLastActivity() { return lastActivity; }
    public void setLastActivity(String lastActivity) { this.lastActivity = lastActivity; }
}