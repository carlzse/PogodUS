package BackEnd.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import BackEnd.Service.ClothingService;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/clothing") // Główny prefix dla wszystkich endpointów
public class ClothingController {

    private static final Logger logger = LoggerFactory.getLogger(ClothingController.class);
    private final ClothingService clothingService;

    @Autowired
    public ClothingController(ClothingService clothingService) {
        this.clothingService = clothingService;
    }

    /**
     * Główny endpoint API pod ścieżką /api/clothing/suggestion
     */
    @GetMapping("/suggestion")
    public ResponseEntity<?> getClothingSuggestion(
            @RequestParam(required = false) String latitude,
            @RequestParam(required = false) String longitude) {

        logger.info("Otrzymano żądanie sugestii ubioru dla: lat={}, lon={}", latitude, longitude);

        // Dodatkowe logowanie przed parsowaniem
        logger.debug("Raw latitude: {}", latitude);
        logger.debug("Raw longitude: {}", longitude);

        logger.info("Otrzymano żądanie sugestii ubioru dla: lat={}, lon={}", latitude, longitude);

        // Sprawdzanie czy parametry zostały podane
        if (latitude == null || longitude == null) {
            logger.warn("Brakujące parametry: latitude={}, longitude={}", latitude, longitude);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Wymagane parametry: latitude i longitude");
            return ResponseEntity.badRequest().body(error);
        }

        // Konwersja string do double z obsługą potencjalnych błędów
        try {
            double lat = Double.parseDouble(latitude.replace(",", "."));
            double lon = Double.parseDouble(longitude.replace(",", "."));

            logger.info("Przekonwertowane współrzędne: lat={}, lon={}", lat, lon);

            return processClothingSuggestionRequest(lat, lon);
        } catch (NumberFormatException e) {
            logger.error("Błąd konwersji współrzędnych: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Nieprawidłowy format współrzędnych. Podaj wartości numeryczne.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Dodatkowy endpoint bezpośrednio pod /suggestion dla testów
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Test endpoint is working!");
        return ResponseEntity.ok(response);
    }

    /**
     * Metoda pomocnicza przetwarzająca żądanie - używana przez oba endpointy
     */
    private ResponseEntity<?> processClothingSuggestionRequest(double latitude, double longitude) {
        try {
            // Sprawdzenie poprawności parametrów
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                logger.warn("Nieprawidłowe współrzędne: lat={}, lon={}", latitude, longitude);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Nieprawidłowe współrzędne geograficzne");
                return ResponseEntity.badRequest().body(error);
            }

            // Pobierz dane pogodowe
            Map<String, Object> weatherData = clothingService.getWeatherData(latitude, longitude);

            if (weatherData == null) {
                throw new RuntimeException("Nie otrzymano danych pogodowych");
            }

            // Wygeneruj sugestie ubioru
            ClothingService.ClothingSuggestion suggestion = clothingService.getSuggestion(weatherData);

            if (suggestion == null) {
                throw new RuntimeException("Nie udało się wygenerować sugestii");
            }

            // Przygotuj odpowiedź
            Map<String, Object> response = new HashMap<>();
            response.put("mainClothing", suggestion.getMainClothing());
            response.put("additionalItems", suggestion.getAdditionalItems());
            response.put("description", suggestion.getDescription());
            response.put("fullSuggestion", suggestion.toString());

            logger.info("Pomyślnie zwrócono sugestię ubioru");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Błąd podczas przetwarzania żądania: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Wystąpił błąd podczas generowania sugestii ubioru: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}