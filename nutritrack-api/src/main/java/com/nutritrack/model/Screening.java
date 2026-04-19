package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Derived from: NewScreening (measurements + WHO classification),
//               PatientHistory (screenings tab), PatientClinicalSummary
@Entity
@Data
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screening_id")
    private Long id;

    @Column(name = "screening_code", unique = true)
    private String screeningCode;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "muac_cm")
    private BigDecimal muacCm;

    private boolean edema;

    // Server-calculated per WHO standards (NORMAL | MAM | SAM)
    private String classification;

    @Column(name = "z_score")
    private BigDecimal zScore;

    private String appetite; // GOOD | FAIR | POOR

    @Column(name = "observation_notes")
    private String observationNotes;

    private String recommendation;

    @Column(name = "screening_date")
    private LocalDate screeningDate;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonBackReference("patient-screenings")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "conducted_by")
    private Users conductedBy;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private HealthFacility facility;
}
