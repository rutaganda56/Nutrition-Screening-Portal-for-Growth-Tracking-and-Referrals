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
@RequestMapping("/api/referrals")
@CrossOrigin
public class ReferralController {

    @Autowired
    private ReferralService referralService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReferralResponseDto createReferral(@Valid @RequestBody ReferralDto dto,
                                              @RequestParam Long referredBy) {
        return referralService.createReferral(dto, referredBy);
    }

    @GetMapping
    public List<ReferralResponseDto> getAllReferrals() {
        return referralService.getAllReferrals();
    }

    @GetMapping("/{id}")
    public ReferralResponseDto getReferralById(@PathVariable Long id) {
        return referralService.getReferralById(id);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<ReferralResponseDto> getReferralsByDoctor(@PathVariable Long doctorId) {
        return referralService.getReferralsByDoctor(doctorId);
    }

    @GetMapping("/patient/{patientId}")
    public List<ReferralResponseDto> getReferralsByPatient(@PathVariable Long patientId) {
        return referralService.getReferralsByPatient(patientId);
    }

    @PatchMapping("/{id}/status")
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
