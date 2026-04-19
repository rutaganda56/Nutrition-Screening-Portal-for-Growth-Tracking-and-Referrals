package com.nutritrack.service;

import com.nutritrack.dto.ScreeningDto;
import com.nutritrack.dto.ScreeningResponseDto;
import com.nutritrack.mapper.ScreeningMapper;
import com.nutritrack.model.Patient;
import com.nutritrack.model.Screening;
import com.nutritrack.model.Users;
import com.nutritrack.repository.PatientRepository;
import com.nutritrack.repository.ScreeningRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScreeningService {

    @Autowired
    private ScreeningRepository screeningRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScreeningMapper screeningMapper;

    public ScreeningResponseDto createScreening(ScreeningDto dto, Long conductedByUserId) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Users conductedBy = userRepository.findById(conductedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Server-side WHO classification
        double muac = dto.muacCm().doubleValue();
        String classification;
        if (dto.edema() || muac < 11.5) {
            classification = "SAM";
        } else if (muac < 12.5) {
            classification = "MAM";
        } else {
            classification = "NORMAL";
        }

        String recommendation = switch (classification) {
            case "SAM"  -> "Urgent referral to Therapeutic Feeding Center required. Submit service request to doctor immediately.";
            case "MAM"  -> "Moderate malnutrition detected. Create nutrition order and consider service request to doctor for follow-up.";
            default     -> "Normal nutritional status. Create preventive nutrition order to support healthy growth.";
        };

        Screening screening = new Screening();
        screening.setPatient(patient);
        screening.setConductedBy(conductedBy);
        screening.setFacility(patient.getFacility());
        screening.setScreeningDate(dto.screeningDate());
        screening.setWeightKg(dto.weightKg());
        screening.setHeightCm(dto.heightCm());
        screening.setMuacCm(dto.muacCm());
        screening.setEdema(dto.edema());
        screening.setClassification(classification);
        screening.setAppetite(dto.appetite());
        screening.setObservationNotes(dto.observationNotes());
        screening.setRecommendation(recommendation);

        Screening saved = screeningRepository.save(screening);
        saved.setScreeningCode("S-" + saved.getId());
        saved = screeningRepository.save(saved);

        // Update patient cached status
        patient.setCurrentStatus(classification);
        patient.setLastScreeningDate(dto.screeningDate());
        patient.setTotalScreenings(patient.getTotalScreenings() + 1);
        patientRepository.save(patient);

        return screeningMapper.toResponseDto(saved);
    }

    public List<ScreeningResponseDto> getScreeningsByPatient(Long patientId) {
        return screeningRepository.findByPatientIdOrderByScreeningDateDesc(patientId).stream()
                .map(screeningMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public ScreeningResponseDto getScreeningById(Long id) {
        Screening screening = screeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Screening not found"));
        return screeningMapper.toResponseDto(screening);
    }

    public List<ScreeningResponseDto> getAllScreenings() {
        return screeningRepository.findAll().stream()
                .map(screeningMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
