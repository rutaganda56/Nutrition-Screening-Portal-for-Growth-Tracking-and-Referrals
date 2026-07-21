package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Derived from: PatientClinicalSummary (confirm clinical diagnosis form)
@Entity
@Data
public class ClinicalAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long id;

    private String diagnosis;

    private String severity; // CRITICAL | SEVERE | MODERATE | MILD

    @Column(name = "assessed_at")
    private LocalDate assessedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "assessed_by")
    private Users assessedBy;
}
