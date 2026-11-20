package com.equipoise.backend.repository;

import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.StatusBand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String>, JpaSpecificationExecutor<Employee> {
    List<Employee> findByStatus(StatusBand status);
    List<Employee> findByRiskScoreGreaterThanEqual(Integer riskScore);
    List<Employee> findByProjectContainingIgnoreCase(String project);
    Optional<Employee> findByEmailIgnoreCase(String email);
    Optional<Employee> findByNameIgnoreCase(String name);
}

