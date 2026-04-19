package com.nutritrack.repository;

import com.nutritrack.model.ClinicalAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicalAssessmentRepository extends JpaRepository<ClinicalAssessment, Long> {
    List<ClinicalAssessment> findByPatientId(Long patientId);
    List<ClinicalAssessment> findByServiceRequestId(Long serviceRequestId);
}
