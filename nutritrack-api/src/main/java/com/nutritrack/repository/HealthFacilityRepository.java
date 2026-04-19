package com.nutritrack.repository;

import com.nutritrack.model.HealthFacility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthFacilityRepository extends JpaRepository<HealthFacility, Long> {
    List<HealthFacility> findByStatus(String status);
}
