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
public class NutritionOrderController {

    @Autowired
    private NutritionOrderService nutritionOrderService;

    @PostMapping("api/nutrition-orders")
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionOrderResponseDto createOrder(@Valid @RequestBody NutritionOrderDto dto,
                                                 @RequestParam Long prescribedBy) {
        return nutritionOrderService.createOrder(dto, prescribedBy);
    }

    @GetMapping("api/nutrition-orders")
    public List<NutritionOrderResponseDto> getAllOrders() {
        return nutritionOrderService.getAllOrders();
    }

    @GetMapping("api/nutrition-orders/{id}")
    public NutritionOrderResponseDto getOrderById(@PathVariable Long id) {
        return nutritionOrderService.getOrderById(id);
    }

    @GetMapping("api/nutrition-orders/patient/{patientId}")
    public List<NutritionOrderResponseDto> getOrdersByPatient(@PathVariable Long patientId) {
        return nutritionOrderService.getOrdersByPatient(patientId);
    }

    @PatchMapping("api/nutrition-orders/{id}/status")
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
