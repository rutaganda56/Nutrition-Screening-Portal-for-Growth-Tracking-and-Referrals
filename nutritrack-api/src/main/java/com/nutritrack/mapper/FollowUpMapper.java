package com.nutritrack.mapper;

import com.nutritrack.dto.FollowUpResponseDto;
import com.nutritrack.model.FollowUp;
import org.springframework.stereotype.Service;

@Service
public class FollowUpMapper {

    public FollowUpResponseDto toResponseDto(FollowUp followUp) {
        return new FollowUpResponseDto(
                followUp.getId(),
                followUp.getFollowupCode(),
                followUp.getFollowupType(),
                followUp.getPatient() != null ? followUp.getPatient().getId() : null,
                followUp.getPatient() != null
                        ? followUp.getPatient().getFirstName() + " " + followUp.getPatient().getLastName() : null,
                followUp.getMessage(),
                followUp.getDueDate(),
                followUp.getStatus(),
                followUp.getAssignedTo() != null ? followUp.getAssignedTo().getFullName() : null,
                followUp.getCreatedAt()
        );
    }
}
