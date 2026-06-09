package com.farmos.farmos.service;

import com.farmos.farmos.model.Farm;
import com.farmos.farmos.repository.FarmRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FarmService {

    private final FarmRepository farmRepository;

    public FarmService(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }

    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    public Farm createFarm(Farm farm) {
        return farmRepository.save(farm);
    }
}