package com.nutritrack.mapper;

import com.nutritrack.dto.AlertResponseDto;
import com.nutritrack.model.Alert;
import org.springframework.stereotype.Service;

@Service
public class AlertMapper {

    public AlertResponseDto toResponseDto(Alert alert) {
        return new AlertResponseDto(
                alert.getId(),
                alert.getAlertCode(),
                alert.getAlertType(),
                alert.getPatient() != null ? alert.getPatient().getId() : null,
                alert.getPatient() != null
                        ? alert.getPatient().getFirstName() + " " + alert.getPatient().getLastName() : null,
                alert.getMessage(),
                alert.getStatus(),
                alert.getDueDate(),
                alert.getAssignedTo() != null ? alert.getAssignedTo().getFullName() : null,
                alert.getCreatedAt()
        );
    }
}
