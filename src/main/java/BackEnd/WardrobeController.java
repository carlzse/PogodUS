package BackEnd;

import BackEnd.Service.RecommendationDto;
import BackEnd.Service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wardrobe")
@CrossOrigin(origins = "http://localhost:3000")
public class WardrobeController {

    @Autowired
    private WardrobeRepository wardrobeRepository;

    @Autowired
    private RecommendationService recommendationService;

    @PostMapping
    public WardrobeItem addItem(@RequestBody WardrobeItem item) {
        System.out.println("Otrzymano ubranie kategorii: " + item.getCategory() + " dla użytkownika ID: " + item.getUserId());
        return wardrobeRepository.save(item);
    }

    @GetMapping
    public List<WardrobeItem> getAllItems() {
        return wardrobeRepository.findAll();
    }

    @GetMapping("/recommendation")
    public RecommendationDto getRecommendation(
            @RequestParam Long userId,
            @RequestParam double temp,
            @RequestParam boolean rain,
            @RequestParam double windSpeed) {

        List<WardrobeItem> items = recommendationService.getPersonalizedRecommendation(userId, temp, rain, windSpeed);
        double targetClo = recommendationService.calculateTargetClo(temp, rain, windSpeed);
        return new RecommendationDto(items, targetClo);
    }
}