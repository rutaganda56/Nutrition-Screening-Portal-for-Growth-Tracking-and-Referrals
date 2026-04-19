package com.nutritrack.mapper;

import com.nutritrack.dto.ReferralResponseDto;
import com.nutritrack.model.Referral;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;

@Service
public class ReferralMapper {

    public ReferralResponseDto toResponseDto(Referral referral) {
        String patientAge = referral.getPatient() != null ? computeAge(referral.getPatient().getBirthDate()) : null;
        return new ReferralResponseDto(
                referral.getId(),
                referral.getReferralCode(),
                referral.getPatient() != null ? referral.getPatient().getId() : null,
                referral.getPatient() != null
                        ? referral.getPatient().getFirstName() + " " + referral.getPatient().getLastName() : null,
                patientAge,
                referral.getReferredTo(),
                referral.getPriority(),
                referral.getUrgency(),
                referral.getDiagnosis(),
                referral.getReferralReason(),
                referral.isTransportArranged(),
                referral.getStatus(),
                referral.getReferredDate(),
                referral.getFollowUpDate(),
                referral.getReferredBy() != null ? referral.getReferredBy().getFullName() : null,
                referral.getCreatedAt()
        );
    }

    private String computeAge(LocalDate birthDate) {
        if (birthDate == null) return "";
        Period period = Period.between(birthDate, LocalDate.now());
        return period.getYears() + "y " + period.getMonths() + "m";
    }
}
