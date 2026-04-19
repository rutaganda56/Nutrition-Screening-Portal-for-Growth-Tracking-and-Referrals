package com.nutritrack.repository;

import com.nutritrack.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByAssignedToId(Long userId);
    List<Alert> findByAssignedToIdAndStatus(Long userId, String status);
}
