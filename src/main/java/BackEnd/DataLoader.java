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
            // ==================== WARSTWA PODSTAWOWA (BASE TOP) ====================
            saveItem(1L, "T-shirt", false, false, "Bawełna", 140.0, 0.09);
            saveItem(1L, "T-shirt", false, false, "Poliester sportowy", 120.0, 0.08);
            saveItem(1L, "Koszula (długi rękaw)", false, false, "Bawełna", 180.0, 0.22);
            saveItem(1L, "Koszula (długi rękaw)", false, false, "Len", 160.0, 0.20);
            saveItem(1L, "Bielizna termo", false, false, "Wełna merino", 200.0, 0.18);
            saveItem(1L, "Bielizna termo", false, false, "Syntetyk", 150.0, 0.15);

            // ==================== WARSTWA ŚRODKOWA (MID LAYER) ====================
            saveItem(1L, "Bluza / Sweter", false, false, "Bawełna/Poliester", 280.0, 0.30);
            saveItem(1L, "Bluza / Sweter", false, false, "Wełna", 400.0, 0.40);
            saveItem(1L, "Polar", false, false, "Polar 300", 300.0, 0.32);
            saveItem(1L, "Sweter wełniany", false, false, "Wełna merynosów", 450.0, 0.38);

            // ==================== WARSTWA ZEWNĘTRZNA (OUTER) ====================
            saveItem(1L, "Kurtka lekka", true, true, "Gore-Tex", null, 0.42);
            saveItem(1L, "Kurtka lekka", true, true, "Nylon (Wiatrówka)", 100.0, 0.30);
            saveItem(1L, "Kurtka zimowa", true, true, "Puch naturalny", null, 0.85);
            saveItem(1L, "Kurtka zimowa", true, true, "Puch syntetyczny", null, 0.75);
            saveItem(1L, "Parka", true, true, "Bawełna z impregnacją", null, 0.65);
            saveItem(1L, "Softshell", true, true, "Membrana", 280.0, 0.45);
            saveItem(1L, "Wiatrówka", false, true, "Nylon", 120.0, 0.25);

            // ==================== DÓŁ (BOTTOM) ====================
            saveItem(1L, "Spodnie (lekkie)", false, false, "Chinosy bawełniane", 250.0, 0.20);
            saveItem(1L, "Spodnie (lekkie)", false, false, "Materiał sportowy", 180.0, 0.15);
            saveItem(1L, "Spodnie (lekkie)", true, true, "Softshell", 320.0, 0.25);
            saveItem(1L, "Jeansy", false, false, "Denim gruby", 450.0, 0.28);
            saveItem(1L, "Jeansy", false, false, "Denim lekki", 300.0, 0.22);
            saveItem(1L, "Spodnie wełniane", false, false, "Wełna", 500.0, 0.30);
            saveItem(1L, "Spodnie termo", false, false, "Poliester", 200.0, 0.18);

            System.out.println("Baza danych zainicjalizowana – dodano wszystkie kategorie ubrań.");
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