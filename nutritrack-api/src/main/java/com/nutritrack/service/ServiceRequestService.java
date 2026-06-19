package com.nutritrack.service;

import com.nutritrack.dto.ServiceRequestDto;
import com.nutritrack.dto.ServiceRequestResponseDto;
import com.nutritrack.mapper.ServiceRequestMapper;
import com.nutritrack.model.Patient;
import com.nutritrack.model.Screening;
import com.nutritrack.model.ServiceRequest;
import com.nutritrack.model.Users;
import com.nutritrack.repository.PatientRepository;
import com.nutritrack.repository.ScreeningRepository;
import com.nutritrack.repository.ServiceRequestRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ScreeningRepository screeningRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.nutritrack.repository.AlertRepository alertRepository;

    @Autowired
    private ServiceRequestMapper serviceRequestMapper;

    public ServiceRequestResponseDto createServiceRequest(ServiceRequestDto dto, Long submittedByUserId) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Screening screening = screeningRepository.findById(dto.screeningId())
                .orElseThrow(() -> new RuntimeException("Screening not found"));
        Users submittedBy = userRepository.findById(submittedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceRequest sr = new ServiceRequest();
        sr.setPatient(patient);
        sr.setScreening(screening);
        sr.setSubmittedBy(submittedBy);
        sr.setPriority(dto.priority().toUpperCase());
        sr.setStatus("PENDING");
        sr.setReasonCode(dto.reasonCode());
        sr.setDescription(dto.description());

        if (dto.assignedToId() != null) {
            Users assignedTo = userRepository.findById(dto.assignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned doctor not found"));
            sr.setAssignedTo(assignedTo);
            // Assign the doctor's facility to the patient if not already set
            if (patient.getFacility() == null && assignedTo.getFacility() != null) {
                patient.setFacility(assignedTo.getFacility());
                patientRepository.save(patient);
            }
        }

        ServiceRequest saved = serviceRequestRepository.save(sr);
        saved.setRequestCode("SR-" + saved.getId());
        saved = serviceRequestRepository.save(saved);

        // Generate alert for the assigned doctor
        if (saved.getAssignedTo() != null) {
            com.nutritrack.model.Alert alert = new com.nutritrack.model.Alert();
            alert.setPatient(saved.getPatient());
            alert.setAssignedTo(saved.getAssignedTo());
            
            String priority = saved.getPriority() != null ? saved.getPriority() : "ROUTINE";
            alert.setAlertType("URGENT".equalsIgnoreCase(priority) ? "CRITICAL" : "WARNING");
            
            String chwName = saved.getSubmittedBy() != null ? 
                saved.getSubmittedBy().getFullName() : "Unknown CHW";
            String patientName = saved.getPatient() != null ? 
                saved.getPatient().getFirstName() + " " + saved.getPatient().getLastName() : "Unknown Patient";
                
            alert.setMessage(String.format("New Service Request (Priority: %s): %s submitted by CHW %s", 
                priority, patientName, chwName));
            alert.setStatus("UNREAD");
            
            com.nutritrack.model.Alert savedAlert = alertRepository.save(alert);
            savedAlert.setAlertCode("A-" + savedAlert.getId());
            alertRepository.save(savedAlert);
        }

        return serviceRequestMapper.toResponseDto(saved);
    }

    public List<ServiceRequestResponseDto> getAllServiceRequests() {
        return serviceRequestRepository.findAll().stream()
                .map(serviceRequestMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<ServiceRequestResponseDto> getServiceRequestsByDoctor(Long doctorId) {
        return serviceRequestRepository.findByAssignedToId(doctorId).stream()
                .map(serviceRequestMapper::toResponseDto)
                .collect(Collectors.toList());
    }
 
    public List<ServiceRequestResponseDto> getServiceRequestsByStatus(String status) {
        return serviceRequestRepository.findByStatus(status.toUpperCase()).stream()
                .map(serviceRequestMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public ServiceRequestResponseDto getServiceRequestById(Long id) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        return serviceRequestMapper.toResponseDto(sr);
    }

    public ServiceRequestResponseDto updateStatus(Long id, String status) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        
        String oldStatus = sr.getStatus();
        sr.setStatus(status.toUpperCase());
        ServiceRequest updated = serviceRequestRepository.save(sr);

        // If status changed to COMPLETED, create an alert for the CHW who submitted it
        if ("COMPLETED".equalsIgnoreCase(status) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
            com.nutritrack.model.Alert alert = new com.nutritrack.model.Alert();
            alert.setPatient(sr.getPatient());
            alert.setAssignedTo(sr.getSubmittedBy());
            alert.setAlertType("INFO");
            alert.setMessage("Doctor review completed for patient: " + sr.getPatient().getFirstName() + " " + sr.getPatient().getLastName());
            alert.setStatus("UNREAD");
            
            com.nutritrack.model.Alert savedAlert = alertRepository.save(alert);
            savedAlert.setAlertCode("A-" + savedAlert.getId());
            alertRepository.save(savedAlert);
        }

        return serviceRequestMapper.toResponseDto(updated);
    }
}
