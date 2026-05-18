package com.nutritrack.repository;

import com.nutritrack.model.Screening;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {
    List<Screening> findByPatient_IdOrderByScreeningDateDesc(Long patientId);
    List<Screening> findByFacilityId(Long facilityId);
    List<Screening> findByClassification(String classification);
}
