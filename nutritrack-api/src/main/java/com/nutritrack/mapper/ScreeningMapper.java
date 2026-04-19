package com.nutritrack.mapper;

import com.nutritrack.dto.ScreeningResponseDto;
import com.nutritrack.model.Screening;
import org.springframework.stereotype.Service;

@Service
public class ScreeningMapper {

    public ScreeningResponseDto toResponseDto(Screening screening) {
        return new ScreeningResponseDto(
                screening.getId(),
                screening.getScreeningCode(),
                screening.getPatient() != null ? screening.getPatient().getId() : null,
                screening.getPatient() != null
                        ? screening.getPatient().getFirstName() + " " + screening.getPatient().getLastName()
                        : null,
                screening.getConductedBy() != null ? screening.getConductedBy().getFullName() : null,
                screening.getFacility() != null ? screening.getFacility().getName() : null,
                screening.getScreeningDate(),
                screening.getWeightKg(),
                screening.getHeightCm(),
                screening.getMuacCm(),
                screening.isEdema(),
                screening.getClassification(),
                screening.getZScore(),
                screening.getAppetite(),
                screening.getObservationNotes(),
                screening.getRecommendation(),
                screening.getCreatedAt()
        );
    }
}
