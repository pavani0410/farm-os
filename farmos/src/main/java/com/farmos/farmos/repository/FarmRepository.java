package com.farmos.farmos.repository;

import com.farmos.farmos.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository  // tells Spring "this talks to the database"
public interface FarmRepository extends JpaRepository<Farm, Long> {
    // nothing needed here!
    // JpaRepository gives you these for free:
    // save(), findAll(), findById(), deleteById()
}