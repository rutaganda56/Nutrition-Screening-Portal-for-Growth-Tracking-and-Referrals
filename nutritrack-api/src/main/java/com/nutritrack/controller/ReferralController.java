package com.nutritrack.controller;

import com.nutritrack.dto.ReferralDto;
import com.nutritrack.dto.ReferralResponseDto;
import com.nutritrack.service.ReferralService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
public class ReferralController {

    @Autowired
    private ReferralService referralService;

    @PostMapping("api/referrals")
    @ResponseStatus(HttpStatus.CREATED)
    public ReferralResponseDto createReferral(@Valid @RequestBody ReferralDto dto,
                                              @RequestParam Long referredBy) {
        return referralService.createReferral(dto, referredBy);
    }

    @GetMapping("api/referrals")
    public List<ReferralResponseDto> getAllReferrals() {
        return referralService.getAllReferrals();
    }

    @GetMapping("api/referrals/{id}")
    public ReferralResponseDto getReferralById(@PathVariable Long id) {
        return referralService.getReferralById(id);
    }

    @GetMapping("api/referrals/doctor/{doctorId}")
    public List<ReferralResponseDto> getReferralsByDoctor(@PathVariable Long doctorId) {
        return referralService.getReferralsByDoctor(doctorId);
    }

    @GetMapping("api/referrals/patient/{patientId}")
    public List<ReferralResponseDto> getReferralsByPatient(@PathVariable Long patientId) {
        return referralService.getReferralsByPatient(patientId);
    }

    @PatchMapping("api/referrals/{id}/status")
    public ReferralResponseDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return referralService.updateStatus(id, status);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        var errors = new HashMap<String, String>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            var fieldName = ((FieldError) error).getField();
            var errorMsg = error.getDefaultMessage();
            errors.put(fieldName, errorMsg);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
