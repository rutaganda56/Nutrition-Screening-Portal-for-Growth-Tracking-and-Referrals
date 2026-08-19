package com.nutritrack.controller;

import com.nutritrack.dto.ServiceRequestDto;
import com.nutritrack.dto.ServiceRequestResponseDto;
import com.nutritrack.service.ServiceRequestService;
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
@RequestMapping("/api/service-requests")
@CrossOrigin
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceRequestResponseDto createServiceRequest(@Valid @RequestBody ServiceRequestDto dto,
                                                          @RequestParam Long submittedBy) {
        return serviceRequestService.createServiceRequest(dto, submittedBy);
    }

    @GetMapping
    public List<ServiceRequestResponseDto> getAllServiceRequests() {
        return serviceRequestService.getAllServiceRequests();
    }

    @GetMapping("/{id}")
    public ServiceRequestResponseDto getServiceRequestById(@PathVariable Long id) {
        return serviceRequestService.getServiceRequestById(id);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<ServiceRequestResponseDto> getServiceRequestsByDoctor(@PathVariable Long doctorId) {
        return serviceRequestService.getServiceRequestsByDoctor(doctorId);
    }

    @GetMapping("/status/{status}")
    public List<ServiceRequestResponseDto> getServiceRequestsByStatus(@PathVariable String status) {
        return serviceRequestService.getServiceRequestsByStatus(status);
    }

    @PatchMapping("/{id}/status")
    public ServiceRequestResponseDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return serviceRequestService.updateStatus(id, status);
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

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        var error = new HashMap<String, String>();
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
