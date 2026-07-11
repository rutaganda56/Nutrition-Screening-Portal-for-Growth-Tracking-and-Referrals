package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// Derived from: NewScreening (service request section), ServiceRequestQueue,
//               PatientClinicalSummary
@Entity
@Data
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long id;

    @Column(name = "request_code", unique = true)
    private String requestCode;

    private String priority; // URGENT | ROUTINE | ASAP

    private String status; // PENDING | IN_REVIEW | COMPLETED | DECLINED

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonBackReference("patient-serviceRequests")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "screening_id")
    private Screening screening;

    @ManyToOne
    @JoinColumn(name = "submitted_by")
    private Users submittedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private Users assignedTo;
}
