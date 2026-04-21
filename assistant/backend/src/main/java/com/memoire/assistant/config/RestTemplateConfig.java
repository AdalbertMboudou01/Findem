package com.memoire.assistant.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Configuration des timeouts
        restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory());
        
        // Configuration des convertisseurs JSON
        List<org.springframework.http.converter.HttpMessageConverter<?>> converters = new ArrayList<>();
        converters.add(new MappingJackson2HttpMessageConverter());
        restTemplate.setMessageConverters(converters);
        
        // Configuration des headers par défaut
        HttpHeaders defaultHeaders = new HttpHeaders();
        defaultHeaders.setContentType(MediaType.APPLICATION_JSON);
        
        return restTemplate;
    }
}
