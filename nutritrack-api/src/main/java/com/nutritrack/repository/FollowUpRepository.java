package com.nutritrack.repository;

import com.nutritrack.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByAssignedToId(Long userId);
    List<FollowUp> findByAssignedToIdAndStatus(Long userId, String status);
}
