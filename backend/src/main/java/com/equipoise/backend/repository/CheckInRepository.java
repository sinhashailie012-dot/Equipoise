package com.equipoise.backend.repository;

import com.equipoise.backend.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckInRepository extends JpaRepository<CheckIn, String> {}
