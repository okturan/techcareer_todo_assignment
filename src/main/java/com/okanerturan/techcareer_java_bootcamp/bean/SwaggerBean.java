package com.okanerturan.techcareer_java_bootcamp.bean;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerBean {

    @Bean
    public OpenAPI getOpenAPIMethod() {
        return new OpenAPI().info(new Info()
                .title("Todo API Documentation")
                .version("1.0")
                .summary("Todo Application API")
                .description("Validated CRUD operations for the Todo Application")
                .contact(new Contact()
                        .name("Okan Erturan")
                        .url("https://github.com/okturan")
                )
                .license(new License()
                        .name("MIT")
                        .url("https://github.com/okturan/techcareer_todo_assignment/blob/master/LICENSE")
                )
        );
    }
}
