package com.nutritrack.mapper;

import com.nutritrack.dto.ClinicalAssessmentResponseDto;
import com.nutritrack.model.ClinicalAssessment;
import org.springframework.stereotype.Service;

@Service
public class ClinicalAssessmentMapper {

    public ClinicalAssessmentResponseDto toResponseDto(ClinicalAssessment ca) {
        return new ClinicalAssessmentResponseDto(
                ca.getId(),
                ca.getPatient() != null ? ca.getPatient().getId() : null,
                ca.getPatient() != null
                        ? ca.getPatient().getFirstName() + " " + ca.getPatient().getLastName() : null,
                ca.getDiagnosis(),
                ca.getSeverity(),
                ca.getComplications(),
                ca.getClinicalNotes(),
                ca.getAssessedBy() != null ? ca.getAssessedBy().getFullName() : null,
                ca.getAssessedAt(),
                ca.getCreatedAt()
        );
    }
}
