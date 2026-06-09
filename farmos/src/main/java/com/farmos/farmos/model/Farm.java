package com.farmos.farmos.model;

import jakarta.persistence.*;
import lombok.Data;

@Data                  // auto generates getters, setters (Lombok does this)
@Entity                // tells Spring "this is a database table"
@Table(name = "farms") // the table will be called "farms" in PostgreSQL
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment ID
    private Long id;

    private String name;      // farm name
    private Double acres;     // total acres
    private String location;  // where the farm is
}