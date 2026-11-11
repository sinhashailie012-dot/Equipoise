package com.equipoise.backend.repository;

import com.equipoise.backend.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, String> {
}

