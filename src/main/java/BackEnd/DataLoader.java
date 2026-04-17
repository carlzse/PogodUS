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
            // Dodajemy ubiór dla Kacpra (ID: 1)
            saveItem(1L, "Kurtka Gore-Tex", "Outerwear", 1.2, true);
            saveItem(1L, "T-shirt Bawełniany", "Top", 0.1, false);

            // Dodajemy ubiór dla Kasi (ID: 2)
            saveItem(2L, "Płaszcz przeciwdeszczowy", "Outerwear", 1.1, true);
            saveItem(2L, "Bluza z kapturem", "Top", 0.6, false);

            System.out.println("Baza danych została zainicjalizowana rekordami startowymi.");
        }
    }

    private void saveItem(Long uId, String name, String type, Double clo, boolean water) {
        WardrobeItem item = new WardrobeItem();
        item.setUserId(uId);
        item.setName(name);
        item.setType(type);
        item.setClo(clo);
        item.setWaterproof(water);
        wardrobeRepository.save(item);
    }
}