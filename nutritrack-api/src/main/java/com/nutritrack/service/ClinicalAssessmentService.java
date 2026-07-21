package com.nutritrack.service;

import com.nutritrack.dto.ClinicalAssessmentDto;
import com.nutritrack.dto.ClinicalAssessmentResponseDto;
import com.nutritrack.mapper.ClinicalAssessmentMapper;
import com.nutritrack.model.*;
import com.nutritrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClinicalAssessmentService {

    @Autowired
    private ClinicalAssessmentRepository assessmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.nutritrack.repository.AlertRepository alertRepository;

    @Autowired
    private ClinicalAssessmentMapper assessmentMapper;

    public ClinicalAssessmentResponseDto createAssessment(ClinicalAssessmentDto dto, Long assessedByUserId) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        ServiceRequest sr = serviceRequestRepository.findById(dto.serviceRequestId())
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        Users assessedBy = userRepository.findById(assessedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClinicalAssessment assessment = new ClinicalAssessment();
        assessment.setPatient(patient);
        assessment.setServiceRequest(sr);
        assessment.setAssessedBy(assessedBy);
        assessment.setDiagnosis(dto.diagnosis());
        assessment.setSeverity(dto.severity().toUpperCase());
        assessment.setAssessedAt(LocalDate.now());

        // Mark service request as in-review
        sr.setStatus("IN_REVIEW");
        serviceRequestRepository.save(sr);

        ClinicalAssessment savedAssessment = assessmentRepository.save(assessment);

        // Generate alert for the originating CHW
        if (sr.getSubmittedBy() != null) {
            com.nutritrack.model.Alert alert = new com.nutritrack.model.Alert();
            alert.setPatient(patient);
            alert.setAssignedTo(sr.getSubmittedBy());
            alert.setAlertType("INFO");
            
            String patientName = patient != null ? 
                patient.getFirstName() + " " + patient.getLastName() : "Unknown Patient";
                
            alert.setMessage(String.format("Clinical Assessment completed for %s. Diagnosis: %s, Severity: %s", 
                patientName, savedAssessment.getDiagnosis(), savedAssessment.getSeverity()));
            alert.setStatus("UNREAD");
            
            com.nutritrack.model.Alert savedAlert = alertRepository.save(alert);
            savedAlert.setAlertCode("A-" + savedAlert.getId());
            alertRepository.save(savedAlert);
        }

        return assessmentMapper.toResponseDto(savedAssessment);
    }

    public List<ClinicalAssessmentResponseDto> getAssessmentsByPatient(Long patientId) {
        return assessmentRepository.findByPatientId(patientId).stream()
                .map(assessmentMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public ClinicalAssessmentResponseDto getAssessmentById(Long id) {
        ClinicalAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical assessment not found"));
        return assessmentMapper.toResponseDto(assessment);
    }
}
