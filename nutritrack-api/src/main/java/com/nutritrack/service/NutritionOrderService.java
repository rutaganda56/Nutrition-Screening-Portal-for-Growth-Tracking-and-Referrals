package com.nutritrack.service;

import com.nutritrack.dto.NutritionOrderDto;
import com.nutritrack.dto.NutritionOrderResponseDto;
import com.nutritrack.mapper.NutritionOrderMapper;
import com.nutritrack.model.*;
import com.nutritrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NutritionOrderService {

    @Autowired
    private NutritionOrderRepository nutritionOrderRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ScreeningRepository screeningRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NutritionOrderMapper nutritionOrderMapper;

    public NutritionOrderResponseDto createOrder(NutritionOrderDto dto, Long prescribedByUserId) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Users prescribedBy = userRepository.findById(prescribedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate startDate = dto.startDate() != null ? dto.startDate() : LocalDate.now();
        LocalDate endDate = dto.endDate();

        // Business rule: no overlapping active orders for same patient
        if (endDate != null) {
            List<NutritionOrder> overlapping = nutritionOrderRepository
                    .findByPatientIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            dto.patientId(), "ACTIVE", endDate, startDate);
            if (!overlapping.isEmpty()) {
                throw new RuntimeException("Patient already has an active nutrition order overlapping these dates");
            }
        }

        NutritionOrder order = new NutritionOrder();
        order.setPatient(patient);
        order.setOrderType(dto.orderType().toUpperCase());
        order.setSupplement(dto.supplement());
        order.setDosage(dto.dosage());
        order.setFrequency(dto.frequency());
        order.setDuration(dto.duration());
        order.setInstructions(dto.instructions());
        order.setStartDate(startDate);
        order.setEndDate(endDate);
        order.setStatus("ACTIVE");
        order.setPrescribedBy(prescribedBy);

        if (dto.screeningId() != null) {
            order.setScreening(screeningRepository.findById(dto.screeningId()).orElse(null));
        }
        if (dto.serviceRequestId() != null) {
            order.setServiceRequest(serviceRequestRepository.findById(dto.serviceRequestId()).orElse(null));
        }

        NutritionOrder saved = nutritionOrderRepository.save(order);
        saved.setOrderCode("NO-" + saved.getId());
        saved = nutritionOrderRepository.save(saved);

        return nutritionOrderMapper.toResponseDto(saved);
    }

    public List<NutritionOrderResponseDto> getOrdersByPatient(Long patientId) {
        return nutritionOrderRepository.findByPatientId(patientId).stream()
                .map(nutritionOrderMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public NutritionOrderResponseDto getOrderById(Long id) {
        NutritionOrder order = nutritionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nutrition order not found"));
        return nutritionOrderMapper.toResponseDto(order);
    }

    public NutritionOrderResponseDto updateStatus(Long id, String status) {
        NutritionOrder order = nutritionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nutrition order not found"));
        order.setStatus(status.toUpperCase());
        return nutritionOrderMapper.toResponseDto(nutritionOrderRepository.save(order));
    }

    public List<NutritionOrderResponseDto> getAllOrders() {
        return nutritionOrderRepository.findAll().stream()
                .map(nutritionOrderMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
