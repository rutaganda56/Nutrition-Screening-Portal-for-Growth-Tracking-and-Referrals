package com.nutritrack.controller;

import com.nutritrack.dto.FollowUpDto;
import com.nutritrack.dto.FollowUpResponseDto;
import com.nutritrack.service.FollowUpService;
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
@RequestMapping("/api/follow-ups")
@CrossOrigin
public class FollowUpController {

    @Autowired
    private FollowUpService followUpService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FollowUpResponseDto createFollowUp(@Valid @RequestBody FollowUpDto dto) {
        return followUpService.createFollowUp(dto);
    }

    @GetMapping
    public List<FollowUpResponseDto> getAllFollowUps() {
        return followUpService.getAllFollowUps();
    }

    @GetMapping("/doctor/{doctorId}")
    public List<FollowUpResponseDto> getFollowUpsByDoctor(@PathVariable Long doctorId) {
        return followUpService.getFollowUpsByDoctor(doctorId);
    }

    @PatchMapping("/{id}/status")
    public FollowUpResponseDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return followUpService.updateStatus(id, status);
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
