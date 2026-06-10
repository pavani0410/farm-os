package com.farmos.farmos.repository;

import com.farmos.farmos.model.Plot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlotRepository extends JpaRepository<Plot, Long> {
    List<Plot> findByFarmId(Long farmId);
}