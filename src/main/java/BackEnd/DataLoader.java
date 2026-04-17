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
            // Przykładowe dane dla Kacpra (ID: 1)
            saveItem(1L, "T-shirt", false, false, "Bawełna", 150.0, 0.09);
            saveItem(1L, "Bluza", false, true, "Poliester", 280.0, 0.34);
            saveItem(1L, "Kurtka", true, true, "Gore-Tex", null, 0.70);
            saveItem(1L, "Jeansy", false, true, "Denim", 400.0, 0.25);

            System.out.println("Baza danych zainicjalizowana nową strukturą.");
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