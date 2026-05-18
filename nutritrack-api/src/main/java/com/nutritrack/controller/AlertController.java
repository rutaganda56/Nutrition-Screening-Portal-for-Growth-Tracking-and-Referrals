package com.nutritrack.controller;

import com.nutritrack.dto.AlertDto;
import com.nutritrack.dto.AlertResponseDto;
import com.nutritrack.service.AlertService;
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
@RequestMapping("/api/alerts")
@CrossOrigin
public class AlertController {

    @Autowired
    private AlertService alertService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AlertResponseDto createAlert(@Valid @RequestBody AlertDto dto) {
        return alertService.createAlert(dto);
    }

    @GetMapping
    public List<AlertResponseDto> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/doctor/{doctorId}")
    public List<AlertResponseDto> getAlertsByDoctor(@PathVariable Long doctorId) {
        return alertService.getAlertsByDoctor(doctorId);
    }

    @PatchMapping("/{id}/status")
    public AlertResponseDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return alertService.updateStatus(id, status);
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
