package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Derived from: NewScreening (nutrition order section),
//               PatientClinicalSummary (create nutrition order form)
@Entity
@Data
public class NutritionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Column(name = "order_code", unique = true)
    private String orderCode;

    // THERAPEUTIC | SUPPLEMENTARY | PREVENTIVE | COUNSELING | RUTF | MICRONUTRIENT
    @Column(name = "order_type")
    private String orderType;

    private String supplement; // RUTF | RUSF | CSB+ | etc.

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private String status; // ACTIVE | COMPLETED | DISCONTINUED

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonBackReference("patient-nutritionOrders")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "screening_id")
    private Screening screening;

    @ManyToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;

    @ManyToOne
    @JoinColumn(name = "prescribed_by")
    private Users prescribedBy;
}
