package com.nutritrack.controller;

import com.nutritrack.dto.ChangePasswordDto;
import com.nutritrack.dto.UserDto;
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
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto createUser(@Valid @RequestBody UserDto dto) {
        return userService.createUser(dto);
    }

    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponseDto getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserResponseDto updateUser(@PathVariable Long id, @Valid @RequestBody UserDto dto) {
        return userService.updateUser(id, dto);
    }

    @PatchMapping("/{id}/change-password")
    public UserResponseDto changePassword(@PathVariable Long id,
                                          @Valid @RequestBody ChangePasswordDto dto) {
        return userService.changePassword(id, dto.currentPassword(), dto.newPassword());
    }

    @PatchMapping("/{id}/toggle-status")
    public UserResponseDto toggleStatus(@PathVariable Long id) {
        return userService.toggleStatus(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
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

