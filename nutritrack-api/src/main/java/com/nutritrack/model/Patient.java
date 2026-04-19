package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Derived from: PatientRegistration, PatientHistory, PatientClinicalSummary, ServiceRequestQueue
@Entity
@Data
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Long id;

    @Column(name = "patient_code", unique = true)
    private String patientCode;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String gender; // MALE | FEMALE

    @Column(name = "birth_weight_kg")
    private BigDecimal birthWeightKg;

    @Column(name = "birth_length_cm")
    private BigDecimal birthLengthCm;

    // Guardian info
    @Column(name = "guardian_first_name")
    private String guardianFirstName;

    @Column(name = "guardian_last_name")
    private String guardianLastName;

    @Column(name = "guardian_relationship")
    private String guardianRelationship;

    @Column(name = "guardian_phone")
    private String guardianPhone;

    @Column(name = "guardian_alt_phone")
    private String guardianAltPhone;

    // Address
    private String village;

    private String zone;

    @Column(name = "household_id")
    private String householdId;

    private String address;

    private String notes;

    // Cached from latest screening (server-calculated)
    @Column(name = "current_status")
    private String currentStatus; // NORMAL | MAM | SAM

    @Column(name = "last_screening_date")
    private LocalDate lastScreeningDate;

    @Column(name = "total_screenings")
    private int totalScreenings = 0;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    @JsonBackReference("facility-patients")
    private HealthFacility facility;

    @ManyToOne
    @JoinColumn(name = "registered_by")
    @JsonBackReference("user-patients")
    private Users registeredBy;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference("patient-screenings")
    private List<Screening> screenings;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference("patient-serviceRequests")
    private List<ServiceRequest> serviceRequests;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference("patient-nutritionOrders")
    private List<NutritionOrder> nutritionOrders;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference("patient-referrals")
    private List<Referral> referrals;
}
