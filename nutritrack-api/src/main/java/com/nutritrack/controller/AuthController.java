package com.nutritrack.controller;

import com.nutritrack.dto.LoginDto;
import com.nutritrack.dto.RegisterDto;
import com.nutritrack.dto.UserResponseDto;
import com.nutritrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto register(@Valid @RequestBody RegisterDto dto) {
        return userService.register(dto);
    }

    @PostMapping("api/auth/login")
    public UserResponseDto login(@Valid @RequestBody LoginDto dto) {
        return userService.login(dto);
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
