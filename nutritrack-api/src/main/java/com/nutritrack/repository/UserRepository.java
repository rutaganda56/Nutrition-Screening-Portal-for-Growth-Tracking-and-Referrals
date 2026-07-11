package com.nutritrack.repository;

import com.nutritrack.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users, Long> {
    Users findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
