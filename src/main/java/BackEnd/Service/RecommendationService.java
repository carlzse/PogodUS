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

    public double calculateTargetClo(double tempApparent, boolean isRaining, double windSpeed) {
        double targetClo = (22.0 - tempApparent) / 7.0;
        if (targetClo < 0.2) targetClo = 0.2;
        if (isRaining) targetClo += 0.2;
        if (windSpeed > 20.0) targetClo += 0.1;
        return targetClo;
    }

    public List<WardrobeItem> getPersonalizedRecommendation(Long userId, double tempApparent,
                                                            boolean isRaining, double windSpeed) {
        double targetClo = calculateTargetClo(tempApparent, isRaining, windSpeed);

        List<WardrobeItem> allItems = wardrobeRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());

        if (allItems.isEmpty()) return Collections.emptyList();

        return findOptimalSet(allItems, targetClo, isRaining, windSpeed > 20.0, tempApparent);
    }

    private List<WardrobeItem> findOptimalSet(List<WardrobeItem> allItems, double targetClo,
                                              boolean isRaining, boolean isWindy, double tempApparent) {
        double maxAllowedClo;
        if (tempApparent > 15) maxAllowedClo = 0.45;
        else if (tempApparent > 10) maxAllowedClo = 0.65;
        else if (tempApparent > 5) maxAllowedClo = 0.85;
        else maxAllowedClo = 1.2;

        List<WardrobeItem> baseOptions = filterByCategories(allItems, BASE_TOP);
        List<WardrobeItem> midOptions = filterByCategories(allItems, MID_LAYER).stream()
                .filter(i -> i.getEstimatedClo() <= maxAllowedClo)
                .collect(Collectors.toList());
        List<WardrobeItem> outerOptions = filterByCategories(allItems, OUTER).stream()
                .filter(i -> i.getEstimatedClo() <= maxAllowedClo)
                .collect(Collectors.toList());
        List<WardrobeItem> bottomOptions = filterByCategories(allItems, BOTTOM);

        if (baseOptions.isEmpty() || bottomOptions.isEmpty()) {
            return Collections.emptyList();
        }

        List<WardrobeItem> bestSet = null;
        double bestDiff = Double.MAX_VALUE;
        int bestLayers = 0;
        double bestMaxItemClo = Double.MAX_VALUE;

        for (WardrobeItem base : baseOptions) {
            for (WardrobeItem bottom : bottomOptions) {
                for (WardrobeItem mid : withNull(midOptions)) {
                    for (WardrobeItem outer : withNull(outerOptions)) {
                        if (isRaining && outer != null && !outer.isWaterproof()) continue;
                        if (isWindy && outer != null && !outer.isWindproof()) continue;

                        double totalClo = base.getEstimatedClo() + bottom.getEstimatedClo();
                        if (mid != null) totalClo += mid.getEstimatedClo();
                        if (outer != null) totalClo += outer.getEstimatedClo();

                        int layers = 2 + (mid != null ? 1 : 0) + (outer != null ? 1 : 0);
                        double diff = Math.abs(totalClo - targetClo);

                        double maxItemClo = Math.max(base.getEstimatedClo(), bottom.getEstimatedClo());
                        if (mid != null) maxItemClo = Math.max(maxItemClo, mid.getEstimatedClo());
                        if (outer != null) maxItemClo = Math.max(maxItemClo, outer.getEstimatedClo());

                        boolean better = false;
                        if (diff < bestDiff - 0.01) {
                            better = true;
                        } else if (Math.abs(diff - bestDiff) < 0.01) {
                            if (layers < bestLayers) {
                                better = true;
                            } else if (layers == bestLayers && maxItemClo < bestMaxItemClo) {
                                better = true;
                            }
                        }

                        if (better) {
                            bestDiff = diff;
                            bestLayers = layers;
                            bestMaxItemClo = maxItemClo;
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