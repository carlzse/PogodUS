package BackEnd;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final WardrobeRepository wardrobeRepository;

    public DataLoader(WardrobeRepository wardrobeRepository) {
        this.wardrobeRepository = wardrobeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (wardrobeRepository.count() == 0) {
            // Przykładowe dane dla użytkownika (ID: 1)

            // --- GÓRA (Topy / Warstwy bazowe) ---
            saveItem(1L, "T-shirt", false, false, "Bawełna", 140.0, 0.09);
            saveItem(1L, "T-shirt", false, false, "Poliester sportowy", 120.0, 0.08);
            saveItem(1L, "Koszula (długi rękaw)", false, false, "Len", 180.0, 0.20);
            saveItem(1L, "Koszula (długi rękaw)", false, false, "Bawełna", 220.0, 0.24);
            saveItem(1L, "Bielizna termo", false, false, "Wełna merino", 200.0, 0.18);
            saveItem(1L, "Bielizna termo", false, false, "Syntetyk", 150.0, 0.15);

            // --- WARSTWY ŚRODKOWE (Bluzy / Swetry) ---
            saveItem(1L, "Bluza / Sweter", false, true, "Bawełna/Poliester", 280.0, 0.30);
            saveItem(1L, "Bluza / Sweter", false, false, "Wełna", 400.0, 0.40);
            saveItem(1L, "Bluza / Sweter", false, false, "Polar", 200.0, 0.28);
            saveItem(1L, "Bluza / Sweter", false, true, "Polar gruby", 300.0, 0.35);

            // --- DÓŁ (Spodnie) ---
            saveItem(1L, "Jeansy", false, true, "Denim gruby", 450.0, 0.28);
            saveItem(1L, "Jeansy", false, true, "Denim lekki", 300.0, 0.22);
            saveItem(1L, "Spodnie (lekkie)", false, false, "Chinosy bawełniane", 250.0, 0.20);
            saveItem(1L, "Spodnie (lekkie)", false, false, "Materiał sportowy", 180.0, 0.15);
            saveItem(1L, "Spodnie (lekkie)", true, true, "Softshell", 320.0, 0.25);

            // --- WARSTWY WIERZCHNIE (Kurtki) ---
            saveItem(1L, "Kurtka lekka", true, true, "Nylon (Wiatrówka)", 100.0, 0.30);
            saveItem(1L, "Kurtka lekka", false, true, "Bomberka", 250.0, 0.35);
            saveItem(1L, "Kurtka zimowa", true, true, "Puch naturalny", null, 0.85);
            saveItem(1L, "Kurtka zimowa", true, true, "Puch syntetyczny", null, 0.75);
            saveItem(1L, "Kurtka zimowa", true, true, "Parka wełniana", null, 0.70);
            saveItem(1L, "Kurtka lekka", true, true, "Gore-Tex Shell", null, 0.40);

            System.out.println("Baza danych zainicjalizowana 21 nowymi ubraniami.");
        }
    }

    private void saveItem(Long uId, String cat, boolean water, boolean wind, String mat, Double gram, Double clo) {
        WardrobeItem item = new WardrobeItem();
        item.setUserId(uId);
        item.setCategory(cat);
        item.setWaterproof(water);
        item.setWindproof(wind);
        item.setMaterial(mat);
        item.setGrammage(gram);
        item.setEstimatedClo(clo);
        wardrobeRepository.save(item);
    }
}