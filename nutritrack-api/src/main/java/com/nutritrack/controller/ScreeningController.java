package com.nutritrack.controller;

import com.nutritrack.dto.ScreeningDto;
import com.nutritrack.dto.ScreeningResponseDto;
import com.nutritrack.service.ScreeningService;
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
public class ScreeningController {

    @Autowired
    private ScreeningService screeningService;

    @PostMapping("api/screenings")
    @ResponseStatus(HttpStatus.CREATED)
    public ScreeningResponseDto createScreening(@Valid @RequestBody ScreeningDto dto,
                                                @RequestParam Long conductedBy) {
        return screeningService.createScreening(dto, conductedBy);
    }

    @GetMapping("api/screenings")
    public List<ScreeningResponseDto> getAllScreenings() {
        return screeningService.getAllScreenings();
    }

    @GetMapping("api/screenings/{id}")
    public ScreeningResponseDto getScreeningById(@PathVariable Long id) {
        return screeningService.getScreeningById(id);
    }

    @GetMapping("api/screenings/patient/{patientId}")
    public List<ScreeningResponseDto> getScreeningsByPatient(@PathVariable Long patientId) {
        return screeningService.getScreeningsByPatient(patientId);
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
