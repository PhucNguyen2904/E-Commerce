package com.ecommerce.chatbotservice.service;

import com.ecommerce.chatbotservice.client.OrderClient;
import com.ecommerce.chatbotservice.client.SearchClient;
import com.ecommerce.chatbotservice.domain.entity.ChatMessage;
import com.ecommerce.chatbotservice.dto.ChatRequest;
import com.ecommerce.chatbotservice.dto.ChatResponse;
import com.ecommerce.chatbotservice.dto.GeminiRequest;
import com.ecommerce.chatbotservice.dto.GeminiResponse;
import com.ecommerce.chatbotservice.repository.ChatMessageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final SearchClient searchClient;
    private final OrderClient orderClient;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model}")
    private String geminiModel;

    @Value("${gemini.api.url}")
    private String geminiApiUrlPattern;

    private static final String SYSTEM_INSTRUCTION = "Bạn là trợ lý tư vấn bán hàng của LuxeRetail. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện. CHỈ dùng thông tin trả về từ công cụ (tool) được cung cấp — không tự bịa giá, tồn kho, hay trạng thái đơn hàng. Nếu không tìm thấy thông tin phù hợp, nói rõ là chưa tìm thấy thay vì đoán.";

    public ChatService(ChatMessageRepository chatMessageRepository, SearchClient searchClient, OrderClient orderClient, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.chatMessageRepository = chatMessageRepository;
        this.searchClient = searchClient;
        this.orderClient = orderClient;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @RateLimiter(name = "geminiRateLimiter", fallbackMethod = "chatFallback")
    public ChatResponse chat(ChatRequest request, String userId) {
        UUID conversationId = request.getConversationId();
        if (conversationId == null) {
            conversationId = UUID.randomUUID();
        }

        UUID parsedUserId = userId != null && !userId.isEmpty() ? UUID.fromString(userId) : null;

        // Lưu tin nhắn người dùng
        saveMessage(conversationId, parsedUserId, "user", request.getMessage());

        // Lấy lịch sử (giới hạn 20 tin nhắn gần nhất)
        List<ChatMessage> history = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        if (history.size() > 20) {
            history = history.subList(history.size() - 20, history.size());
        }

        // Xây dựng request gửi Gemini
        GeminiRequest geminiRequest = new GeminiRequest();
        geminiRequest.setSystemInstruction(createSystemInstruction());
        geminiRequest.setTools(createTools(parsedUserId != null));
        
        List<GeminiRequest.Content> contents = new ArrayList<>();
        for (ChatMessage msg : history) {
            try {
                GeminiRequest.Content content = objectMapper.readValue(msg.getContent(), GeminiRequest.Content.class);
                contents.add(content);
            } catch (JsonProcessingException e) {
                // Ignore parsing errors for simple texts, try wrapping
                GeminiRequest.Content content = new GeminiRequest.Content();
                content.setRole(msg.getRole().equals("user") ? "user" : "model");
                GeminiRequest.Part part = new GeminiRequest.Part();
                part.setText(msg.getContent());
                content.setParts(List.of(part));
                contents.add(content);
            }
        }
        geminiRequest.setContents(contents);

        return processGeminiInteraction(geminiRequest, conversationId, parsedUserId, userId);
    }

    private ChatResponse processGeminiInteraction(GeminiRequest geminiRequest, UUID conversationId, UUID parsedUserId, String stringUserId) {
        String url = String.format(geminiApiUrlPattern, geminiModel, geminiApiKey);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(geminiRequest, headers);

        try {
            ResponseEntity<GeminiResponse> responseEntity = restTemplate.postForEntity(url, entity, GeminiResponse.class);
            GeminiResponse response = responseEntity.getBody();

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                GeminiRequest.Content responseContent = response.getCandidates().get(0).getContent();
                GeminiRequest.Part firstPart = responseContent.getParts().get(0);

                if (firstPart.getFunctionCall() != null) {
                    // Xử lý function call
                    GeminiRequest.FunctionCall functionCall = firstPart.getFunctionCall();
                    saveRawContent(conversationId, parsedUserId, "model", responseContent);
                    geminiRequest.getContents().add(responseContent);

                    // Thực thi tool
                    Map<String, Object> toolResult = executeTool(functionCall, stringUserId);

                    // Xây dựng FunctionResponse
                    GeminiRequest.Content functionContent = new GeminiRequest.Content();
                    functionContent.setRole("function"); // For function response, role is sometimes just mapped via part, but standard allows function or model
                    GeminiRequest.Part funcPart = new GeminiRequest.Part();
                    GeminiRequest.FunctionResponse funcRes = new GeminiRequest.FunctionResponse();
                    funcRes.setName(functionCall.getName());
                    funcRes.setResponse(toolResult);
                    funcPart.setFunctionResponse(funcRes);
                    functionContent.setParts(List.of(funcPart));
                    
                    saveRawContent(conversationId, parsedUserId, "function", functionContent);
                    geminiRequest.getContents().add(functionContent);

                    // Gọi lại Gemini
                    return processGeminiInteraction(geminiRequest, conversationId, parsedUserId, stringUserId);
                } else if (firstPart.getText() != null) {
                    // Câu trả lời tự nhiên
                    saveRawContent(conversationId, parsedUserId, "model", responseContent);
                    return new ChatResponse(conversationId, firstPart.getText());
                }
            }
        } catch (Exception e) {
            log.error("Gemini API Error", e);
        }
        
        return new ChatResponse(conversationId, "Xin lỗi, hệ thống tư vấn đang gặp sự cố. Bạn vui lòng thử lại sau nhé!");
    }

    private Map<String, Object> executeTool(GeminiRequest.FunctionCall call, String userId) {
        try {
            if ("search_products".equals(call.getName())) {
                String query = call.getArgs().get("query") != null ? call.getArgs().get("query").toString() : null;
                String categoryId = null; // We might need to map categoryName to ID, for now let's pass null or try to adapt
                Double maxPrice = call.getArgs().get("maxPrice") != null ? Double.valueOf(call.getArgs().get("maxPrice").toString()) : null;
                
                Object result = searchClient.searchProducts(query, categoryId, maxPrice, 5);
                return Map.of("result", result != null ? result : "No products found");
            } else if ("get_my_order_status".equals(call.getName())) {
                if (userId == null) {
                    return Map.of("error", "Unauthorized. Vui lòng đăng nhập để xem đơn hàng.");
                }
                String orderId = call.getArgs().get("orderId") != null ? call.getArgs().get("orderId").toString() : null;
                if (orderId != null && !orderId.trim().isEmpty()) {
                    try {
                        Object result = orderClient.getOrderById(orderId, userId);
                        return Map.of("result", result != null ? result : "Không tìm thấy đơn hàng.");
                    } catch (Exception e) {
                        return Map.of("error", "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.");
                    }
                } else {
                    Object result = orderClient.getMyOrders(userId);
                    return Map.of("result", result != null ? result : "Bạn chưa có đơn hàng nào.");
                }
            }
        } catch (Exception e) {
            log.error("Error executing tool: " + call.getName(), e);
        }
        return Map.of("error", "Tool execution failed");
    }

    private GeminiRequest.Content createSystemInstruction() {
        GeminiRequest.Content content = new GeminiRequest.Content();
        GeminiRequest.Part part = new GeminiRequest.Part();
        part.setText(SYSTEM_INSTRUCTION);
        content.setParts(List.of(part));
        return content;
    }

    private List<GeminiRequest.Tool> createTools(boolean isAuthenticated) {
        List<GeminiRequest.FunctionDeclaration> functions = new ArrayList<>();

        // Tool: search_products
        GeminiRequest.FunctionDeclaration searchFunc = new GeminiRequest.FunctionDeclaration();
        searchFunc.setName("search_products");
        searchFunc.setDescription("Tìm kiếm sản phẩm theo tên, danh mục hoặc giá. Luôn sử dụng khi khách hỏi về sản phẩm hoặc giá cả.");
        GeminiRequest.Schema searchSchema = new GeminiRequest.Schema();
        searchSchema.setType("OBJECT");
        Map<String, GeminiRequest.Schema> searchProps = new HashMap<>();
        
        GeminiRequest.Schema querySchema = new GeminiRequest.Schema();
        querySchema.setType("STRING");
        querySchema.setDescription("Từ khóa tìm kiếm (ví dụ: áo khoác, blazer)");
        searchProps.put("query", querySchema);
        
        GeminiRequest.Schema maxPriceSchema = new GeminiRequest.Schema();
        maxPriceSchema.setType("NUMBER");
        maxPriceSchema.setDescription("Giá tối đa khách muốn tìm (ví dụ: 500000)");
        searchProps.put("maxPrice", maxPriceSchema);
        
        searchSchema.setProperties(searchProps);
        searchFunc.setParameters(searchSchema);
        functions.add(searchFunc);

        // Tool: get_my_order_status
        if (isAuthenticated) {
            GeminiRequest.FunctionDeclaration orderFunc = new GeminiRequest.FunctionDeclaration();
            orderFunc.setName("get_my_order_status");
            orderFunc.setDescription("Tra cứu trạng thái đơn hàng của người dùng. Dùng khi khách hỏi về đơn hàng của họ.");
            GeminiRequest.Schema orderSchema = new GeminiRequest.Schema();
            orderSchema.setType("OBJECT");
            Map<String, GeminiRequest.Schema> orderProps = new HashMap<>();
            
            GeminiRequest.Schema orderIdSchema = new GeminiRequest.Schema();
            orderIdSchema.setType("STRING");
            orderIdSchema.setDescription("Mã đơn hàng (nếu khách cung cấp)");
            orderProps.put("orderId", orderIdSchema);
            
            orderSchema.setProperties(orderProps);
            orderFunc.setParameters(orderSchema);
            functions.add(orderFunc);
        }

        GeminiRequest.Tool tool = new GeminiRequest.Tool();
        tool.setFunctionDeclarations(functions);
        return List.of(tool);
    }

    private void saveMessage(UUID conversationId, UUID userId, String role, String text) {
        GeminiRequest.Content content = new GeminiRequest.Content();
        content.setRole(role);
        GeminiRequest.Part part = new GeminiRequest.Part();
        part.setText(text);
        content.setParts(List.of(part));
        saveRawContent(conversationId, userId, role, content);
    }

    private void saveRawContent(UUID conversationId, UUID userId, String role, GeminiRequest.Content content) {
        try {
            String jsonContent = objectMapper.writeValueAsString(content);
            ChatMessage msg = new ChatMessage(UUID.randomUUID(), conversationId, userId, role, jsonContent, LocalDateTime.now());
            chatMessageRepository.save(msg);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize message content", e);
        }
    }

    public ChatResponse chatFallback(ChatRequest request, String userId, Throwable t) {
        log.error("Rate limit or fallback triggered for chatbot", t);
        return new ChatResponse(request.getConversationId(), "Xin lỗi, hiện tại hệ thống tư vấn đang bận. Vui lòng thử lại sau ít phút nhé!");
    }
}
