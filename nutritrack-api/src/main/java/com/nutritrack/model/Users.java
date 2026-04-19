package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

// Derived from: RegisterPage, LoginPage, UserManagement, Profile
@Entity
@Data
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    private String email;

    private String password;

    private String phone;

    private String role; // DOCTOR | COMMUNITY_HEALTH_WORKER | ADMINISTRATOR

    private String department;

    private String address;

    private String status; // ACTIVE | INACTIVE

    @Column(name = "totp_secret")
    private String totpSecret;

    @Column(name = "totp_enabled")
    private boolean totpEnabled = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    @com.fasterxml.jackson.annotation.JsonBackReference("facility-users")
    private HealthFacility facility;

    @OneToMany(mappedBy = "registeredBy", cascade = CascadeType.ALL)
    @JsonManagedReference("user-patients")
    private List<Patient> patients;
}
