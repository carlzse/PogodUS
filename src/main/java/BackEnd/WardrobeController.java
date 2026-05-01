package BackEnd;

import BackEnd.Service.RecommendationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wardrobe")
@CrossOrigin(origins = "http://localhost:3000") // Bardzo ważne: pozwala Reactowi wysłać dane
public class WardrobeController {

    @Autowired
    private WardrobeRepository wardrobeRepository;

    @PostMapping
    public WardrobeItem addItem(@RequestBody WardrobeItem item) {
        System.out.println("Otrzymano ubranie kategorii: " + item.getCategory() + " dla użytkownika ID: " + item.getUserId());
        return wardrobeRepository.save(item);
    }

    @GetMapping
    public List<WardrobeItem> getAllItems() {
        return wardrobeRepository.findAll();
    }

    @Autowired
    private BackEnd.Service.RecommendationService recommendationService;

    @GetMapping("/recommendation")
    public RecommendationDto getRecommendation(
            @RequestParam Long userId,
            @RequestParam double temp,
            @RequestParam boolean rain) {

        // 1. Wywołujemy istniejącą metodę (bez jej modyfikacji)[cite: 11, 14]
        List<WardrobeItem> items = recommendationService.getPersonalizedRecommendation(userId, temp, rain);

        // 2. Wyliczamy targetClo zgodnie z Twoim wzorem
        double targetClo = (31.0 - temp) / 10.0;
        if (targetClo < 0.2) targetClo = 0.2;

        // 3. Zwracamy nowy obiekt DTO zamiast samej listy[cite: 14]
        return new RecommendationDto(items, targetClo);
    }
}