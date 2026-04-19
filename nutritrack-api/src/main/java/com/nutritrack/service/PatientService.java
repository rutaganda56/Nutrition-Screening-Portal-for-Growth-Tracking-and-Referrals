package com.nutritrack.service;

import com.nutritrack.dto.PatientDto;
import com.nutritrack.dto.PatientResponseDto;
import com.nutritrack.mapper.PatientMapper;
import com.nutritrack.model.HealthFacility;
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
        // Validate age under 5
        int ageYears = Period.between(dto.birthDate(), LocalDate.now()).getYears();
        if (ageYears > 5) throw new RuntimeException("Patient must be under 5 years old for nutrition screening");
        if (dto.birthDate().isAfter(LocalDate.now())) throw new RuntimeException("Birth date cannot be in the future");

        HealthFacility facility = facilityRepository.findById(dto.facilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        Users registeredBy = userRepository.findById(registeredByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = new Patient();
        patient.setFirstName(dto.firstName());
        patient.setLastName(dto.lastName());
        patient.setBirthDate(dto.birthDate());
        patient.setGender(dto.gender().toUpperCase());
        patient.setBirthWeightKg(dto.birthWeightKg());
        patient.setBirthLengthCm(dto.birthLengthCm());
        patient.setGuardianFirstName(dto.guardianFirstName());
        patient.setGuardianLastName(dto.guardianLastName());
        patient.setGuardianRelationship(dto.guardianRelationship());
        patient.setGuardianPhone(dto.guardianPhone());
        patient.setGuardianAltPhone(dto.guardianAltPhone());
        patient.setVillage(dto.village());
        patient.setZone(dto.zone());
        patient.setHouseholdId(dto.householdId());
        patient.setAddress(dto.address());
        patient.setNotes(dto.notes());
        patient.setFacility(facility);
        patient.setRegisteredBy(registeredBy);
        patient.setCurrentStatus("UNKNOWN");
        patient.setTotalScreenings(0);

        Patient saved = patientRepository.save(patient);
        // Generate patient code from ID
        saved.setPatientCode("P-" + saved.getId());
        saved = patientRepository.save(saved);

        return patientMapper.toResponseDto(saved);
    }

    public List<PatientResponseDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<PatientResponseDto> getPatientsByFacility(Long facilityId) {
        return patientRepository.findByFacilityId(facilityId).stream()
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
