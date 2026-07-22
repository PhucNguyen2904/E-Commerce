package com.ecommerce.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiResponse {
    private List<Candidate> candidates;

    public List<Candidate> getCandidates() { return candidates; }
    public void setCandidates(List<Candidate> candidates) { this.candidates = candidates; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        private GeminiRequest.Content content;

        public GeminiRequest.Content getContent() { return content; }
        public void setContent(GeminiRequest.Content content) { this.content = content; }
    }
}
