package com.nutritrack.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Derived from: AlertsFollowUps page (follow-ups tab)
@Entity
@Data
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "followup_id")
    private Long id;

    @Column(name = "followup_code", unique = true)
    private String followupCode;

    @Column(name = "followup_type")
    private String followupType; // CRITICAL | WARNING | INFO

    private String message;

    @Column(name = "due_date")
    private LocalDate dueDate;

    private String status; // PENDING | COMPLETED | OVERDUE

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private Users assignedTo;
}
