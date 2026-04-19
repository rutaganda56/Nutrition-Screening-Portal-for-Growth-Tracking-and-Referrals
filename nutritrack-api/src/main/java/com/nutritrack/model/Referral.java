package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Derived from: Referrals page, PatientClinicalSummary (create referral form)
@Entity
@Data
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "referral_id")
    private Long id;

    @Column(name = "referral_code", unique = true)
    private String referralCode;

    @Column(name = "referred_to")
    private String referredTo;

    private String priority; // HIGH | MEDIUM | LOW

    private String urgency; // URGENT | SEMI_URGENT | ROUTINE

    private String diagnosis;

    @Column(name = "referral_reason")
    private String referralReason;

    @Column(name = "transport_arranged")
    private boolean transportArranged;

    private String status; // PENDING | ACCEPTED | COMPLETED | REJECTED

    @Column(name = "referred_date")
    private LocalDate referredDate;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonBackReference("patient-referrals")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "referred_by")
    private Users referredBy;

    @ManyToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;
}
