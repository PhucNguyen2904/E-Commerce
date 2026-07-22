package com.ecommerce.chatbotservice.controller;

import com.ecommerce.chatbotservice.dto.ChatRequest;
import com.ecommerce.chatbotservice.dto.ChatResponse;
import com.ecommerce.chatbotservice.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request,
                                             @RequestHeader(value = "X-User-Id", required = false) String userId) {
        ChatResponse response = chatService.chat(request, userId);
        return ResponseEntity.ok(response);
    }
}
