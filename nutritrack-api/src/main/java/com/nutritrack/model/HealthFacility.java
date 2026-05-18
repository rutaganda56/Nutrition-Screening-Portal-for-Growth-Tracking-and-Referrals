package com.nutritrack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

// Derived from: FacilityDirectory, PatientRegistration (health center field)
@Entity
@Data
public class HealthFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "facility_id")
    private Long id;

    private String name;

    private String type; // HOSPITAL | CLINIC | HEALTH_CENTER | DISPENSARY

    private String status; // ACTIVE | INACTIVE

    private String location;

    private String phone;

    private String email;

    private int staff;

    private int capacity;

    private String services; // comma-separated

    @OneToMany(mappedBy = "facility", cascade = CascadeType.ALL)
    @JsonManagedReference("facility-users")
    private List<Users> users;

    @OneToMany(mappedBy = "facility", cascade = CascadeType.ALL)
    @JsonManagedReference("facility-patients")
    private List<Patient> patients;

}
