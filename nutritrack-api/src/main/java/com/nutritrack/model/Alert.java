package com.nutritrack.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Derived from: AlertsFollowUps page (alerts tab)
@Entity
@Data
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long id;

    @Column(name = "alert_code", unique = true)
    private String alertCode;

    @Column(name = "alert_type")
    private String alertType; // CRITICAL | WARNING | INFO

    private String message;

    private String status; // UNREAD | READ | RESOLVED

    @Column(name = "due_date")
    private LocalDate dueDate;

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
