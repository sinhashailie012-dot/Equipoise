package com.equipoise.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EquipoiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(EquipoiseApplication.class, args);
    }
}

