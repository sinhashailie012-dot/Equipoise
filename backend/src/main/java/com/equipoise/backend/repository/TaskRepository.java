package com.equipoise.backend.repository;

import com.equipoise.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByAssigneeId(String employeeId);
    List<Task> findByProjectContainingIgnoreCase(String project);
    long countByProjectEntityIsNotNull();
}
