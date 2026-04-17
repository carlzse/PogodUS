package BackEnd;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "wardrobe")
@Data
public class WardrobeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String category;
    private boolean isWaterproof;
    private boolean isWindproof;
    private String material;
    private Double grammage;
    private Double estimatedClo;

    // Gettery i Settery (jeśli nie używasz Lomboka)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isWaterproof() { return isWaterproof; }
    public void setWaterproof(boolean waterproof) { isWaterproof = waterproof; }
    public boolean isWindproof() { return isWindproof; }
    public void setWindproof(boolean windproof) { isWindproof = windproof; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public Double getGrammage() { return grammage; }
    public void setGrammage(Double grammage) { this.grammage = grammage; }
    public Double getEstimatedClo() { return estimatedClo; }
    public void setEstimatedClo(Double estimatedClo) { this.estimatedClo = estimatedClo; }
}