package BackEnd;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private WardrobeRepository wardrobeRepository;

    public List<WardrobeItem> getPersonalizedRecommendation(Long userId, double tempApparent, boolean isRaining) {
        // 1. Oblicz cel CLO
        double targetClo = (31.0 - tempApparent) / 10.0;
        if (targetClo < 0.3) targetClo = 0.3; // Minimum (np. same majtki/koszulka)

        // 2. Pobierz ubrania użytkownika
        List<WardrobeItem> myItems = wardrobeRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());

        // 3. Grupowanie po kategoriach (Twoja zasada: max 1 z kategorii)
        Map<String, List<WardrobeItem>> categorized = myItems.stream()
                .collect(Collectors.groupingBy(WardrobeItem::getType));

        List<WardrobeItem> selectedSet = new ArrayList<>();
        double currentClo = 0.0;

        // 4. Strategia wyboru (Greedy Algorithm):
        // Priorytet 1: Jeśli pada, szukaj wodoodpornego Outerwear
        if (isRaining && categorized.containsKey("Outerwear")) {
            Optional<WardrobeItem> rainJacket = categorized.get("Outerwear").stream()
                    .filter(WardrobeItem::isWaterproof)
                    .findFirst();
            rainJacket.ifPresent(item -> {
                selectedSet.add(item);
                categorized.remove("Outerwear"); // Zużyliśmy tę kategorię
            });
        }

        // Priorytet 2: Dobierz Bottom (zawsze potrzebne)
        addItemClosestToTarget(categorized, "Bottom", selectedSet);

        // Priorytet 3: Dobierz Top
        addItemClosestToTarget(categorized, "Top", selectedSet);

        // Priorytet 4: Jeśli wciąż zimno, dodaj Outerwear (jeśli nie dodano przeciwdeszczowego)
        if (calculateTotalClo(selectedSet) < targetClo) {
            addItemClosestToTarget(categorized, "Outerwear", selectedSet);
        }

        // Priorytet 5: Akcesoria, jeśli nadal brakuje CLO
        if (calculateTotalClo(selectedSet) < targetClo) {
            addItemClosestToTarget(categorized, "Accessory", selectedSet);
        }

        return selectedSet;
    }

    private void addItemClosestToTarget(Map<String, List<WardrobeItem>> categorized, String type, List<WardrobeItem> selected) {
        if (categorized.containsKey(type) && !categorized.get(type).isEmpty()) {
            // Wybieramy to, które ma najwyższe CLO w swojej kategorii dla zimna,
            // lub najniższe dla ciepła (proste uproszczenie)
            WardrobeItem bestFit = categorized.get(type).get(0);
            selected.add(bestFit);
            categorized.remove(type);
        }
    }

    private double calculateTotalClo(List<WardrobeItem> set) {
        return set.stream().mapToDouble(WardrobeItem::getClo).sum();
    }
}