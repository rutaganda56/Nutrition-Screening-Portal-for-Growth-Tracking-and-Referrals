package com.nutritrack.controller;

import com.nutritrack.dto.ClinicalAssessmentDto;
import com.nutritrack.dto.ClinicalAssessmentResponseDto;
import com.nutritrack.service.ClinicalAssessmentService;
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
public class ClinicalAssessmentController {

    @Autowired
    private ClinicalAssessmentService clinicalAssessmentService;

    @PostMapping("api/clinical-assessments")
    @ResponseStatus(HttpStatus.CREATED)
    public ClinicalAssessmentResponseDto createAssessment(@Valid @RequestBody ClinicalAssessmentDto dto,
                                                          @RequestParam Long assessedBy) {
        return clinicalAssessmentService.createAssessment(dto, assessedBy);
    }

    @GetMapping("api/clinical-assessments/{id}")
    public ClinicalAssessmentResponseDto getAssessmentById(@PathVariable Long id) {
        return clinicalAssessmentService.getAssessmentById(id);
    }

    @GetMapping("api/clinical-assessments/patient/{patientId}")
    public List<ClinicalAssessmentResponseDto> getAssessmentsByPatient(@PathVariable Long patientId) {
        return clinicalAssessmentService.getAssessmentsByPatient(patientId);
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
