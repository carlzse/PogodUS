package BackEnd;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "wardrobe")
@Data // Jeśli nie masz Lomboka, wygeneruj ręcznie Gettery i Settery
public class WardrobeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;    // Tu trafi ID Kacpra (1) lub Kasi (2)
    private String name;    // np. "Kurtka zimowa"
    private String type;    // np. "Outerwear"
    private Double clo;     // np. 1.0
    private boolean waterproof;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getClo() {
        return clo;
    }

    public void setClo(Double clo) {
        this.clo = clo;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isWaterproof() {
        return waterproof;
    }

    public void setWaterproof(boolean waterproof) {
        this.waterproof = waterproof;
    }
}