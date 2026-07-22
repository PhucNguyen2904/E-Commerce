package com.ecommerce.chatbotservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiRequest {
    private Content systemInstruction;
    private List<Content> contents;
    private List<Tool> tools;

    public Content getSystemInstruction() { return systemInstruction; }
    public void setSystemInstruction(Content systemInstruction) { this.systemInstruction = systemInstruction; }

    public List<Content> getContents() { return contents; }
    public void setContents(List<Content> contents) { this.contents = contents; }

    public List<Tool> getTools() { return tools; }
    public void setTools(List<Tool> tools) { this.tools = tools; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Content {
        private String role;
        private List<Part> parts;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public List<Part> getParts() { return parts; }
        public void setParts(List<Part> parts) { this.parts = parts; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Part {
        private String text;
        private FunctionCall functionCall;
        private FunctionResponse functionResponse;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public FunctionCall getFunctionCall() { return functionCall; }
        public void setFunctionCall(FunctionCall functionCall) { this.functionCall = functionCall; }

        public FunctionResponse getFunctionResponse() { return functionResponse; }
        public void setFunctionResponse(FunctionResponse functionResponse) { this.functionResponse = functionResponse; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FunctionCall {
        private String name;
        private Map<String, Object> args;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Map<String, Object> getArgs() { return args; }
        public void setArgs(Map<String, Object> args) { this.args = args; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FunctionResponse {
        private String name;
        private Map<String, Object> response;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Map<String, Object> getResponse() { return response; }
        public void setResponse(Map<String, Object> response) { this.response = response; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Tool {
        private List<FunctionDeclaration> functionDeclarations;

        public List<FunctionDeclaration> getFunctionDeclarations() { return functionDeclarations; }
        public void setFunctionDeclarations(List<FunctionDeclaration> functionDeclarations) { this.functionDeclarations = functionDeclarations; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FunctionDeclaration {
        private String name;
        private String description;
        private Schema parameters;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Schema getParameters() { return parameters; }
        public void setParameters(Schema parameters) { this.parameters = parameters; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Schema {
        private String type; // STRING, NUMBER, INTEGER, BOOLEAN, ARRAY, OBJECT
        private String description;
        private Map<String, Schema> properties;
        private List<String> required;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Map<String, Schema> getProperties() { return properties; }
        public void setProperties(Map<String, Schema> properties) { this.properties = properties; }

        public List<String> getRequired() { return required; }
        public void setRequired(List<String> required) { this.required = required; }
    }
}
