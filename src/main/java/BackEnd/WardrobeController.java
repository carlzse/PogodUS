package BackEnd;

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
        System.out.println("Otrzymano ubranie: " + item.getName() + " dla użytkownika ID: " + item.getUserId());
        return wardrobeRepository.save(item);
    }

    @GetMapping
    public List<WardrobeItem> getAllItems() {
        return wardrobeRepository.findAll();
    }

    @Autowired
    private BackEnd.Service.RecommendationService recommendationService;

    @GetMapping("/recommendation")
    public List<WardrobeItem> getRecommendation(
            @RequestParam Long userId,
            @RequestParam double temp,
            @RequestParam boolean rain) {
        return recommendationService.getPersonalizedRecommendation(userId, temp, rain);
    }
}