package com.nutritrack.repository;

import com.nutritrack.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByStatus(String status);
    List<ServiceRequest> findByAssignedToId(Long doctorId);
    List<ServiceRequest> findByPatientId(Long patientId);
    List<ServiceRequest> findByAssignedToIdAndStatus(Long doctorId, String status);
}
