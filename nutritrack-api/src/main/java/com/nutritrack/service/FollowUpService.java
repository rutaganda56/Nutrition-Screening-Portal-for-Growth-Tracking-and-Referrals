package com.nutritrack.service;

import com.nutritrack.dto.FollowUpDto;
import com.nutritrack.dto.FollowUpResponseDto;
import com.nutritrack.mapper.FollowUpMapper;
import com.nutritrack.model.FollowUp;
import com.nutritrack.model.Patient;
import com.nutritrack.model.Users;
import com.nutritrack.repository.FollowUpRepository;
import com.nutritrack.repository.PatientRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowUpService {

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowUpMapper followUpMapper;

    public FollowUpResponseDto createFollowUp(FollowUpDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Users assignedTo = userRepository.findById(dto.assignedToId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        FollowUp followUp = new FollowUp();
        followUp.setPatient(patient);
        followUp.setAssignedTo(assignedTo);
        followUp.setFollowupType(dto.followupType().toUpperCase());
        followUp.setMessage(dto.message());
        followUp.setDueDate(dto.dueDate());
        followUp.setStatus("PENDING");

        FollowUp saved = followUpRepository.save(followUp);
        saved.setFollowupCode("F-" + saved.getId());
        saved = followUpRepository.save(saved);

        return followUpMapper.toResponseDto(saved);
    }

    public List<FollowUpResponseDto> getFollowUpsByDoctor(Long doctorId) {
        return followUpRepository.findByAssignedToId(doctorId).stream()
                .map(followUpMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public FollowUpResponseDto updateStatus(Long id, String status) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Follow-up not found"));
        followUp.setStatus(status.toUpperCase());
        return followUpMapper.toResponseDto(followUpRepository.save(followUp));
    }

    public List<FollowUpResponseDto> getAllFollowUps() {
        return followUpRepository.findAll().stream()
                .map(followUpMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
