package com.equipoise.backend.repository;

import com.equipoise.backend.entity.Alert;
import com.equipoise.backend.entity.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.equipoise.backend.entity.Severity;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {
    boolean existsByPersonIdAndCategoryAndIsArchivedFalse(String personId, Severity category);
    List<Alert> findByIsArchivedFalse();
    List<Alert> findByIsReadFalseAndIsArchivedFalse();
    List<Alert> findByIsArchivedTrue();
    List<Alert> findByCategoryAndIsArchivedFalse(Severity category);
    long countByIsReadFalseAndIsArchivedFalse();
}
