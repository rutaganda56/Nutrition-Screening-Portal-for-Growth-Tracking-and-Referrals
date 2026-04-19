package com.nutritrack.repository;

import com.nutritrack.model.NutritionOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface NutritionOrderRepository extends JpaRepository<NutritionOrder, Long> {
    List<NutritionOrder> findByPatientId(Long patientId);
    List<NutritionOrder> findByPatientIdAndStatus(Long patientId, String status);
    // Used to check for overlapping active orders (business rule)
    List<NutritionOrder> findByPatientIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long patientId, String status, LocalDate endDate, LocalDate startDate);
}
