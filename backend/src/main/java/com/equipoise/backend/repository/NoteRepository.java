package com.equipoise.backend.repository;

import com.equipoise.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
}
