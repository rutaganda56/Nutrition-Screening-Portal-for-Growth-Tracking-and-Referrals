package com.nutritrack.service;

import com.nutritrack.dto.AlertDto;
import com.nutritrack.dto.AlertResponseDto;
import com.nutritrack.mapper.AlertMapper;
import com.nutritrack.model.Alert;
import com.nutritrack.model.Patient;
import com.nutritrack.model.Users;
import com.nutritrack.repository.AlertRepository;
import com.nutritrack.repository.PatientRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AlertMapper alertMapper;

    public AlertResponseDto createAlert(AlertDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Users assignedTo = userRepository.findById(dto.assignedToId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Alert alert = new Alert();
        alert.setPatient(patient);
        alert.setAssignedTo(assignedTo);
        alert.setAlertType(dto.alertType().toUpperCase());
        alert.setMessage(dto.message());
        alert.setStatus("UNREAD");
        alert.setDueDate(dto.dueDate());

        Alert saved = alertRepository.save(alert);
        saved.setAlertCode("A-" + saved.getId());
        saved = alertRepository.save(saved);

        return alertMapper.toResponseDto(saved);
    }

    public List<AlertResponseDto> getAlertsByDoctor(Long doctorId) {
        return alertRepository.findByAssignedToId(doctorId).stream()
                .map(alertMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public AlertResponseDto updateStatus(Long id, String status) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(status.toUpperCase());
        return alertMapper.toResponseDto(alertRepository.save(alert));
    }

    public List<AlertResponseDto> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(alertMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
