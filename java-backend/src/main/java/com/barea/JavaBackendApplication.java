package com.barea; // Defines the namespace for the application. 
// Spring Boot scans this package and all sub-packages underneath it for components like controllers and services.

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//  This is the standard entry point for a Spring Boot application. 
// It uses @SpringBootApplication to set up and configure the framework
@SpringBootApplication
public class JavaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(JavaBackendApplication.class, args);
	}

}
