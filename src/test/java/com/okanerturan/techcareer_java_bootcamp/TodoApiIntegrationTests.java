package com.okanerturan.techcareer_java_bootcamp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.okanerturan.techcareer_java_bootcamp.repository.TodoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TodoApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TodoRepository todoRepository;

    @BeforeEach
    void clearTodos() {
        todoRepository.deleteAll();
    }

    @Test
    void supportsTheFullCrudLifecycle() throws Exception {
        long id = createTodo("Review pull request", "Run the test suite first");

        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].completed").value(false));

        mockMvc.perform(put("/api/todos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Review and merge pull request",
                                  "details": "All required checks passed",
                                  "completed": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Review and merge pull request"))
                .andExpect(jsonPath("$.completed").value(true));

        mockMvc.perform(delete("/api/todos/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/todos/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsDuplicateTodos() throws Exception {
        createTodo("Ship release", "Tag the verified commit");

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Ship release",
                                  "details": "Tag the verified commit"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(content().string("A todo with the same title and details field already exists"));
    }

    @Test
    void returnsValidationDetailsForBlankFields() throws Exception {
        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": " ",
                                  "details": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("title: Title is required")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("details: Details field is required")));
    }

    @Test
    void returnsNotFoundForUnknownResources() throws Exception {
        mockMvc.perform(get("/api/todos/{id}", 999_999))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Todo not found with id: 999999"));

        mockMvc.perform(delete("/api/todos/{id}", 999_999))
                .andExpect(status().isNotFound());
    }

    @Test
    void servesTheBrowserUiAndOpenApiContract() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("index.html"));

        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("<title>Todo App</title>")));

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Todo API Documentation"))
                .andExpect(jsonPath("$.paths['/api/todos']").exists())
                .andExpect(jsonPath("$.paths['/api/todos'].post.responses['201']").exists())
                .andExpect(jsonPath("$.paths['/api/todos'].post.responses['400']").exists())
                .andExpect(jsonPath("$.paths['/api/todos'].post.responses['409']").exists())
                .andExpect(jsonPath("$.paths['/api/todos'].post.responses['200']").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/todos/{id}'].delete.responses['204']").exists())
                .andExpect(jsonPath("$.paths['/api/todos/{id}'].delete.responses['404']").exists())
                .andExpect(jsonPath("$.paths['/api/todos/{id}'].delete.responses['200']").doesNotExist());
    }

    private long createTodo(String title, String details) throws Exception {
        String responseBody = mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTodoPayload(title, details))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value(title))
                .andExpect(jsonPath("$.details").value(details))
                .andExpect(jsonPath("$.completed").value(false))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode responseJson = objectMapper.readTree(responseBody);
        return responseJson.get("id").asLong();
    }

    private record CreateTodoPayload(String title, String details) {
    }
}
