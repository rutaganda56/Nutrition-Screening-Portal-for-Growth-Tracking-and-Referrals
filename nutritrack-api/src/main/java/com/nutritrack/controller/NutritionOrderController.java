package com.nutritrack.controller;

import com.nutritrack.dto.NutritionOrderDto;
import com.nutritrack.dto.NutritionOrderResponseDto;
import com.nutritrack.service.NutritionOrderService;
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
@RequestMapping("/api/nutrition-orders")
@CrossOrigin
public class NutritionOrderController {

    @Autowired
    private NutritionOrderService nutritionOrderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionOrderResponseDto createOrder(@Valid @RequestBody NutritionOrderDto dto,
                                                 @RequestParam Long prescribedBy) {
        return nutritionOrderService.createOrder(dto, prescribedBy);
    }

    @GetMapping
    public List<NutritionOrderResponseDto> getAllOrders() {
        return nutritionOrderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public NutritionOrderResponseDto getOrderById(@PathVariable Long id) {
        return nutritionOrderService.getOrderById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<NutritionOrderResponseDto> getOrdersByPatient(@PathVariable Long patientId) {
        return nutritionOrderService.getOrdersByPatient(patientId);
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public List<NutritionOrderResponseDto> getOrdersByPatientAndStatus(@PathVariable Long patientId, @PathVariable String status) {
        return nutritionOrderService.getOrdersByPatientAndStatus(patientId, status);
    }

    @PatchMapping("/{id}/status")
    public NutritionOrderResponseDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return nutritionOrderService.updateStatus(id, status);
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
