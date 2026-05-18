package com.nutritrack.controller;

import com.nutritrack.dto.FacilityDto;
import com.nutritrack.dto.FacilityResponseDto;
import com.nutritrack.service.FacilityService;
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
@RequestMapping("/api/facilities")
@CrossOrigin
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping
    public List<FacilityResponseDto> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    @GetMapping("/{id}")
    public FacilityResponseDto getFacilityById(@PathVariable Long id) {
        return facilityService.getFacilityById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FacilityResponseDto createFacility(@Valid @RequestBody FacilityDto dto) {
        return facilityService.createFacility(dto);
    }

    @PutMapping("/{id}")
    public FacilityResponseDto updateFacility(@PathVariable Long id, @Valid @RequestBody FacilityDto dto) {
        return facilityService.updateFacility(id, dto);
    }

    @PatchMapping("/{id}/toggle-status")
    public FacilityResponseDto toggleStatus(@PathVariable Long id) {
        return facilityService.toggleStatus(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
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

