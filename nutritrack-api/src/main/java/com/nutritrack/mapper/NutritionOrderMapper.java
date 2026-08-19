package com.nutritrack.mapper;

import com.nutritrack.dto.NutritionOrderResponseDto;
import com.nutritrack.model.NutritionOrder;
import org.springframework.stereotype.Service;

@Service
public class NutritionOrderMapper {

    public NutritionOrderResponseDto toResponseDto(NutritionOrder order) {
        return new NutritionOrderResponseDto(
                order.getId(),
                order.getOrderCode(),
                order.getPatient() != null ? order.getPatient().getId() : null,
                order.getPatient() != null
                        ? order.getPatient().getFirstName() + " " + order.getPatient().getLastName() : null,
                order.getSupplement(),
                order.getDosage(),
                order.getFrequency(),
                order.getDuration(),
                order.getInstructions(),
                order.getStartDate(),
                order.getEndDate(),
                order.getStatus(),
                order.getPrescribedBy() != null ? order.getPrescribedBy().getFullName() : null,
                order.getPrescribedBy() != null ? order.getPrescribedBy().getRole() : null,
                order.getCreatedAt()
        );
    }
}
