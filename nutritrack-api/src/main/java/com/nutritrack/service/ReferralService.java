package com.nutritrack.service;

import com.nutritrack.dto.ReferralDto;
import com.nutritrack.dto.ReferralResponseDto;
import com.nutritrack.mapper.ReferralMapper;
import com.nutritrack.model.*;
import com.nutritrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReferralService {

    @Autowired
    private ReferralRepository referralRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReferralMapper referralMapper;

    public ReferralResponseDto createReferral(ReferralDto dto, Long referredByUserId) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + dto.patientId()));
        Users referredBy = userRepository.findById(referredByUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + referredByUserId));

        Referral referral = new Referral();
        referral.setPatient(patient);
        referral.setReferredBy(referredBy);
        referral.setReferredTo(dto.referredTo());
        referral.setPriority(dto.priority().toUpperCase());
        referral.setUrgency(dto.urgency().toUpperCase());
        referral.setDiagnosis(dto.diagnosis());
        referral.setReferralReason(dto.referralReason());
        referral.setTransportArranged(dto.transportArranged());
        referral.setStatus("PENDING");
        referral.setReferredDate(LocalDate.now());
        referral.setFollowUpDate(dto.followUpDate());

        if (dto.serviceRequestId() != null) {
            referral.setServiceRequest(serviceRequestRepository.findById(dto.serviceRequestId())
                    .orElseThrow(() -> new RuntimeException("Service request not found with ID: " + dto.serviceRequestId())));
        }

        Referral saved = referralRepository.save(referral);
        saved.setReferralCode("REF-" + saved.getId());
        saved = referralRepository.save(saved);

        return referralMapper.toResponseDto(saved);
    }

    public List<ReferralResponseDto> getAllReferrals() {
        return referralRepository.findAll().stream()
                .map(referralMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<ReferralResponseDto> getReferralsByStatus(String status) {
        return referralRepository.findByStatus(status.toUpperCase()).stream()
                .map(referralMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<ReferralResponseDto> getReferralsByDoctor(Long doctorId) {
        return referralRepository.findByReferredById(doctorId).stream()
                .map(referralMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<ReferralResponseDto> getReferralsByPatient(Long patientId) {
        return referralRepository.findByPatientId(patientId).stream()
                .map(referralMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public ReferralResponseDto getReferralById(Long id) {
        Referral referral = referralRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Referral not found"));
        return referralMapper.toResponseDto(referral);
    }

    public ReferralResponseDto updateStatus(Long id, String status) {
        Referral referral = referralRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Referral not found"));
        referral.setStatus(status.toUpperCase());
        return referralMapper.toResponseDto(referralRepository.save(referral));
    }
}
