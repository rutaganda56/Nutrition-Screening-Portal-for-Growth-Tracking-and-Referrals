package com.nutritrack.repository;

import com.nutritrack.model.NutritionOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface NutritionOrderRepository extends JpaRepository<NutritionOrder, Long> {
    List<NutritionOrder> findByPatientId(Long patientId);
    List<NutritionOrder> findByPatientIdAndStatus(Long patientId, String status);

    @Query("SELECT n FROM NutritionOrder n WHERE n.patient.id = :patientId AND n.status = :status " +
           "AND (:startDate <= n.endDate OR n.endDate IS NULL) " +
           "AND (:endDate >= n.startDate OR :endDate IS NULL)")
    List<NutritionOrder> findOverlappingOrders(
            @Param("patientId") Long patientId,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
