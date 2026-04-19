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
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping("api/service-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceRequestResponseDto createServiceRequest(@Valid @RequestBody ServiceRequestDto dto,
                                                          @RequestParam Long submittedBy) {
        return serviceRequestService.createServiceRequest(dto, submittedBy);
    }

    @GetMapping("api/service-requests")
    public List<ServiceRequestResponseDto> getAllServiceRequests() {
        return serviceRequestService.getAllServiceRequests();
    }

    @GetMapping("api/service-requests/{id}")
    public ServiceRequestResponseDto getServiceRequestById(@PathVariable Long id) {
        return serviceRequestService.getServiceRequestById(id);
    }

    @GetMapping("api/service-requests/doctor/{doctorId}")
    public List<ServiceRequestResponseDto> getServiceRequestsByDoctor(@PathVariable Long doctorId) {
        return serviceRequestService.getServiceRequestsByDoctor(doctorId);
    }

    @GetMapping("api/service-requests/status/{status}")
    public List<ServiceRequestResponseDto> getServiceRequestsByStatus(@PathVariable String status) {
        return serviceRequestService.getServiceRequestsByStatus(status);
    }

    @PatchMapping("api/service-requests/{id}/status")
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
}
