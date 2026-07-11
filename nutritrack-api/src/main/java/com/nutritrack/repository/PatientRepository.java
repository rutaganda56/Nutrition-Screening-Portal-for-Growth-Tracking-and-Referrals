package com.nutritrack.repository;

import com.nutritrack.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    List<Patient> findByCurrentStatus(String status);
    boolean existsByPatientCode(String patientCode);
    List<Patient> findByFacilityId(Long facilityId);
    List<Patient> findByCurrentStatusAndFacilityId(String status, Long facilityId);
}
