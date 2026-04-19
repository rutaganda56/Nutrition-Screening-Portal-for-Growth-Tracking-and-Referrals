package com.nutritrack.repository;

import com.nutritrack.model.Referral;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferralRepository extends JpaRepository<Referral, Long> {
    List<Referral> findByReferredById(Long doctorId);
    List<Referral> findByPatientId(Long patientId);
    List<Referral> findByStatus(String status);
}
