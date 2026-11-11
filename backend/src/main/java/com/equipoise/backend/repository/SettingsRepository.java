package com.equipoise.backend.repository;

import com.equipoise.backend.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingsRepository extends JpaRepository<Settings, String> {}
