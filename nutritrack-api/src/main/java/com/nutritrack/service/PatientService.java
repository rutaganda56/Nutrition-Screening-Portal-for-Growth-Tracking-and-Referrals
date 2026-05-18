package com.nutritrack.service;

import com.nutritrack.dto.PatientDto;
import com.nutritrack.dto.PatientResponseDto;
import com.nutritrack.mapper.PatientMapper;
import com.nutritrack.model.Patient;
import com.nutritrack.model.Users;
import com.nutritrack.repository.HealthFacilityRepository;
import com.nutritrack.repository.PatientRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private HealthFacilityRepository facilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientMapper patientMapper;

    public PatientResponseDto registerPatient(PatientDto dto, Long registeredByUserId) {

        Users registeredBy = userRepository.findById(registeredByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = new Patient();
        patient.setFirstName(dto.firstName());
        patient.setLastName(dto.lastName());
        if (dto.birthDate() != null && !dto.birthDate().isBlank()) {
            patient.setBirthDate(LocalDate.parse(dto.birthDate()));
        }
        patient.setGender(dto.gender().toUpperCase());
        patient.setGuardianFirstName(dto.guardianFirstName());
        patient.setGuardianLastName(dto.guardianLastName());
        patient.setGuardianRelationship(dto.guardianRelationship());
        patient.setGuardianPhone(dto.guardianPhone());
        patient.setNotes(dto.notes());
        patient.setRegisteredBy(registeredBy);
        patient.setCurrentStatus("UNKNOWN");
        patient.setTotalScreenings(0);
        // facility is null at registration — assigned later via service request

        Patient saved = patientRepository.save(patient);
        saved.setPatientCode("P-" + saved.getId());
        saved = patientRepository.save(saved);

        return patientMapper.toResponseDto(saved);
    }

    public List<PatientResponseDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public PatientResponseDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return patientMapper.toResponseDto(patient);
    }

    public List<PatientResponseDto> getPatientsByStatus(String status) {
        return patientRepository.findByCurrentStatus(status.toUpperCase()).stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
