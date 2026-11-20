package com.equipoise.backend.config;

import com.equipoise.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("DataInitializer does not seed when database already contains users")
    void doesNotSeedWhenUsersExist() throws Exception {
        when(userRepository.count()).thenReturn(5L);

        DataInitializer initializer = new DataInitializer();
        CommandLineRunner runner = initializer.seedDemoData(
                userRepository, null, null, null, null,
                null, null, null, null, null, null, passwordEncoder
        );

        runner.run();

        // Verify that no save was ever called on userRepository since count > 0
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }
}
