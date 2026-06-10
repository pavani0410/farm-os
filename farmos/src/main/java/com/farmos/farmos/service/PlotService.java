package com.farmos.farmos.service;

import com.farmos.farmos.model.Farm;
import com.farmos.farmos.model.Plot;
import com.farmos.farmos.repository.FarmRepository;
import com.farmos.farmos.repository.PlotRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlotService {

    private final PlotRepository plotRepository;
    private final FarmRepository farmRepository;

    public PlotService(PlotRepository plotRepository, FarmRepository farmRepository) {
        this.plotRepository = plotRepository;
        this.farmRepository = farmRepository;
    }

    public List<Plot> getPlotsByFarm(Long farmId) {
        return plotRepository.findByFarmId(farmId);
    }

    public Plot createPlot(Long farmId, Plot plot) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
        plot.setFarm(farm);
        return plotRepository.save(plot);
    }

    public void deletePlot(Long plotId) {
        plotRepository.deleteById(plotId);
    }
}