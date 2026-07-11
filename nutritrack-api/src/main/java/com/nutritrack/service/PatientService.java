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
import java.time.Period;
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
            LocalDate dob = LocalDate.parse(dto.birthDate());
            if (Period.between(dob, LocalDate.now()).getYears() >= 5) {
                throw new RuntimeException("Patient must be under 5 years old");
            }
            patient.setBirthDate(dob);
        } else {
            throw new RuntimeException("Date of birth is required");
        }
        
        patient.setGender(dto.gender().toUpperCase());
        patient.setGuardianFirstName(dto.guardianFirstName());
        patient.setGuardianLastName(dto.guardianLastName());
        patient.setGuardianRelationship(dto.guardianRelationship());
        patient.setGuardianPhone(dto.guardianPhone());
        patient.setNotes(dto.notes());
        patient.setRegisteredBy(registeredBy);
        patient.setFacility(registeredBy.getFacility());
        patient.setCurrentStatus("UNKNOWN");
        patient.setTotalScreenings(0);

        Patient saved = patientRepository.save(patient);
        saved.setPatientCode("P-" + saved.getId());
        saved = patientRepository.save(saved);

        return patientMapper.toResponseDto(saved);
    }

    public List<PatientResponseDto> getAllPatients(Long facilityId) {
        List<Patient> patients = (facilityId != null) 
            ? patientRepository.findByFacilityId(facilityId) 
            : patientRepository.findAll();
            
        return patients.stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public PatientResponseDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return patientMapper.toResponseDto(patient);
    }

    public List<PatientResponseDto> getPatientsByStatus(String status, Long facilityId) {
        List<Patient> patients = (facilityId != null) 
            ? patientRepository.findByCurrentStatusAndFacilityId(status.toUpperCase(), facilityId)
            : patientRepository.findByCurrentStatus(status.toUpperCase());

        return patients.stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public PatientResponseDto updatePatient(Long id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (dto.firstName() != null) patient.setFirstName(dto.firstName());
        if (dto.lastName() != null) patient.setLastName(dto.lastName());
        
        if (dto.birthDate() != null && !dto.birthDate().isBlank()) {
            LocalDate dob = LocalDate.parse(dto.birthDate());
            if (Period.between(dob, LocalDate.now()).getYears() >= 5) {
                throw new RuntimeException("Patient must be under 5 years old");
            }
            patient.setBirthDate(dob);
        }
        
        if (dto.gender() != null) patient.setGender(dto.gender().toUpperCase());
        if (dto.guardianFirstName() != null) patient.setGuardianFirstName(dto.guardianFirstName());
        if (dto.guardianLastName() != null) patient.setGuardianLastName(dto.guardianLastName());
        if (dto.guardianRelationship() != null) patient.setGuardianRelationship(dto.guardianRelationship());
        if (dto.guardianPhone() != null) patient.setGuardianPhone(dto.guardianPhone());
        if (dto.notes() != null) patient.setNotes(dto.notes());

        return patientMapper.toResponseDto(patientRepository.save(patient));
    }
}
