package BackEnd.Service;

import BackEnd.WardrobeItem;
import BackEnd.WardrobeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private WardrobeRepository wardrobeRepository;

    // Definicje slotów (kategorie ubrań)
    private static final List<String> BASE_TOP = Arrays.asList(
            "T-shirt", "Koszula (długi rękaw)", "Bielizna termo"
    );
    private static final List<String> MID_LAYER = Arrays.asList(
            "Bluza / Sweter", "Polar", "Sweter wełniany"
    );
    private static final List<String> OUTER = Arrays.asList(
            "Kurtka lekka", "Kurtka zimowa", "Parka", "Softshell", "Wiatrówka"
    );
    private static final List<String> BOTTOM = Arrays.asList(
            "Spodnie (lekkie)", "Jeansy", "Spodnie wełniane", "Spodnie termo"
    );

    /**
     * Oblicza docelową wartość CLO na podstawie temperatury odczuwalnej,
     * opadów i prędkości wiatru.
     */
    public double calculateTargetClo(double tempApparent, boolean isRaining, double windSpeed) {
        double targetClo = (24.0 - tempApparent) / 7.0;
        if (targetClo < 0.2) targetClo = 0.2;
        if (isRaining) targetClo += 0.2;
        if (windSpeed > 20.0) targetClo += 0.1;
        return targetClo;
    }

    /**
     * Główna metoda rekomendacji – zwraca optymalny zestaw ubrań.
     */
    public List<WardrobeItem> getPersonalizedRecommendation(Long userId, double tempApparent,
                                                            boolean isRaining, double windSpeed) {
        double targetClo = calculateTargetClo(tempApparent, isRaining, windSpeed);

        List<WardrobeItem> allItems = wardrobeRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());

        if (allItems.isEmpty()) return Collections.emptyList();

        return findOptimalSet(allItems, targetClo, isRaining, windSpeed > 20.0);
    }

    /**
     * Przeszukuje wszystkie kombinacje warstw i wybiera tę z sumą CLO najbliższą targetClo,
     * uwzględniając wymagania wodoodporności i wiatroszczelności.
     */
    private List<WardrobeItem> findOptimalSet(List<WardrobeItem> allItems, double targetClo,
                                              boolean isRaining, boolean isWindy) {
        List<WardrobeItem> baseOptions   = filterByCategories(allItems, BASE_TOP);
        List<WardrobeItem> midOptions    = filterByCategories(allItems, MID_LAYER);
        List<WardrobeItem> outerOptions  = filterByCategories(allItems, OUTER);
        List<WardrobeItem> bottomOptions = filterByCategories(allItems, BOTTOM);

        if (baseOptions.isEmpty() || bottomOptions.isEmpty()) {
            return Collections.emptyList();
        }

        List<WardrobeItem> bestSet = null;
        double bestDiff = Double.MAX_VALUE;
        int bestLayers = 0;

        for (WardrobeItem base : baseOptions) {
            for (WardrobeItem bottom : bottomOptions) {
                for (WardrobeItem mid : withNull(midOptions)) {
                    for (WardrobeItem outer : withNull(outerOptions)) {
                        // Walidacja warstwy zewnętrznej względem warunków
                        if (isRaining && outer != null && !outer.isWaterproof()) continue;
                        if (isWindy && outer != null && !outer.isWindproof()) continue;

                        double totalClo = base.getEstimatedClo() + bottom.getEstimatedClo();
                        if (mid != null) totalClo += mid.getEstimatedClo();
                        if (outer != null) totalClo += outer.getEstimatedClo();

                        int layers = 2 + (mid != null ? 1 : 0) + (outer != null ? 1 : 0);
                        double diff = Math.abs(totalClo - targetClo);

                        if (diff < bestDiff - 0.01 ||
                                (Math.abs(diff - bestDiff) < 0.01 && layers < bestLayers)) {
                            bestDiff = diff;
                            bestLayers = layers;
                            bestSet = new ArrayList<>();
                            bestSet.add(base);
                            bestSet.add(bottom);
                            if (mid != null) bestSet.add(mid);
                            if (outer != null) bestSet.add(outer);
                        }
                    }
                }
            }
        }
        return bestSet != null ? bestSet : Collections.emptyList();
    }

    private List<WardrobeItem> filterByCategories(List<WardrobeItem> items, List<String> categories) {
        return items.stream()
                .filter(i -> categories.contains(i.getCategory()))
                .collect(Collectors.toList());
    }

    private List<WardrobeItem> withNull(List<WardrobeItem> list) {
        List<WardrobeItem> result = new ArrayList<>(list);
        result.add(null);
        return result;
    }
}