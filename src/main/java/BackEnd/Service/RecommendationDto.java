package BackEnd.Service;

import BackEnd.WardrobeItem;
import java.util.List;

public class RecommendationDto {
    private List<WardrobeItem> items;
    private double targetClo;

    public RecommendationDto(List<WardrobeItem> items, double targetClo) {
        this.items = items;
        this.targetClo = targetClo;
    }

    public List<WardrobeItem> getItems() { return items; }
    public double getTargetClo() { return targetClo; }
}