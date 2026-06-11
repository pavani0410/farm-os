package com.farmos.farmos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class FarmosApplication {

	public static void main(String[] args) {
		SpringApplication.run(FarmosApplication.class, args);
	}

	// register RestTemplate as a Spring bean
	// so it can be injected anywhere with @Autowired
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}
}
