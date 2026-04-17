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

    public List<WardrobeItem> getPersonalizedRecommendation(Long userId, double tempApparent, boolean isRaining) {
        // 1. Oblicz cel izolacji (CLO)
        double targetClo = (31.0 - tempApparent) / 10.0;
        if (targetClo < 0.2) targetClo = 0.2;

        // 2. Pobierz ubrania użytkownika
        List<WardrobeItem> myItems = wardrobeRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());

        if (myItems.isEmpty()) return new ArrayList<>();

        // 3. Grupujemy po kategorii (np. "T-shirt", "Jeansy")
        Map<String, List<WardrobeItem>> categorized = myItems.stream()
                .collect(Collectors.groupingBy(WardrobeItem::getCategory));

        List<WardrobeItem> selectedSet = new ArrayList<>();

        // 4. Logika wyboru warstw (Dopasowana do Twoich polskich nazw w Wardrobe.js)

        // SLOT: DÓŁ (Spodnie)
        pick(categorized, List.of("Jeansy", "Spodnie (lekkie)"), selectedSet);

        // SLOT: GÓRA (Baza)
        pick(categorized, List.of("T-shirt", "Koszula (długi rękaw)", "Bielizna termo"), selectedSet);

        // SLOT: WARSTWA DOCIEPLAJĄCA / PRZECIWDESZCZOWA
        if (isRaining) {
            // Priorytet dla ubrań wodoodpornych w zimne/deszczowe dni
            Optional<WardrobeItem> rainGear = myItems.stream()
                    .filter(WardrobeItem::isWaterproof)
                    .findFirst();
            rainGear.ifPresent(item -> {
                if (!selectedSet.contains(item)) selectedSet.add(item);
            });
        } else if (tempApparent < 18.0) {
            pick(categorized, List.of("Bluza / Sweter", "Kurtka lekka", "Kurtka zimowa"), selectedSet);
        }

        return selectedSet;
    }

    private void pick(Map<String, List<WardrobeItem>> categorized, List<String> preferences, List<WardrobeItem> selected) {
        for (String pref : preferences) {
            if (categorized.containsKey(pref) && !categorized.get(pref).isEmpty()) {
                selected.add(categorized.get(pref).get(0));
                break; // Znaleźliśmy najlepszy odpowiednik dla tego slotu
            }
        }
    }
}