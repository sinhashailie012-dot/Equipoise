package com.equipoise.backend.repository;

import com.equipoise.backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, String> {
    List<Leave> findByEmployeeId(String employeeId);
}

