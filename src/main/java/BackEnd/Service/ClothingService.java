package BackEnd.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;

@Service
public class ClothingService {

    private static final Logger logger = LoggerFactory.getLogger(ClothingService.class);
    private final RestTemplate restTemplate;

    public ClothingService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Pobiera dane pogodowe z OpenMeteo API
     *
     * @param latitude szerokość geograficzna
     * @param longitude długość geograficzna
     * @return mapa zawierająca dane pogodowe
     */
    public Map<String, Object> getWeatherData(double latitude, double longitude) {
        try {
            // Walidacja współrzędnych
            if (latitude < -90 || latitude > 90) {
                logger.error("Nieprawidłowa szerokość geograficzna: {}", latitude);
                throw new IllegalArgumentException("Szerokość geograficzna musi być w zakresie od -90 do 90 stopni. Podano: " + latitude);
            }

            if (longitude < -180 || longitude > 180) {
                logger.error("Nieprawidłowa długość geograficzna: {}", longitude);
                throw new IllegalArgumentException("Długość geograficzna musi być w zakresie od -180 do 180 stopni. Podano: " + longitude);
            }

            logger.info("Pobieranie danych pogodowych dla: lat={}, lon={}", latitude, longitude);

            // Konstrukcja URL do API OpenMeteo - uproszczony format zapytania
            String url = String.format(
                    "https://api.open-meteo.com/v1/forecast?latitude=%.6f&longitude=%.6f&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto",
                    latitude, longitude);

            logger.debug("URL zapytania: {}", url);

            try {
                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                logger.info("Otrzymano odpowiedź z Open Meteo API, status: {}", response.getStatusCode());

                if (response.getStatusCode() != HttpStatus.OK) {
                    logger.error("Nieprawidłowy status odpowiedzi: {}", response.getStatusCode());
                    throw new RuntimeException("Nieprawidłowa odpowiedź z API pogodowego: " + response.getStatusCode());
                }

                Map<String, Object> responseBody = response.getBody();

                // Adaptacja nowego formatu API (current zamiast current_weather)
                if (responseBody.containsKey("current") && !responseBody.containsKey("current_weather")) {
                    Map<String, Object> currentData = (Map<String, Object>) responseBody.get("current");
                    Map<String, Object> currentWeather = new HashMap<>();

                    // Mapowanie danych z nowego formatu na stary format
                    if (currentData.containsKey("temperature_2m")) {
                        currentWeather.put("temperature", currentData.get("temperature_2m"));
                    }
                    if (currentData.containsKey("weathercode")) {
                        currentWeather.put("weathercode", currentData.get("weathercode"));
                    }
                    if (currentData.containsKey("windspeed_10m")) {
                        currentWeather.put("windspeed", currentData.get("windspeed_10m"));
                    }

                    responseBody.put("current_weather", currentWeather);
                }

                return responseBody;
            } catch (RestClientException e) {
                logger.error("Błąd podczas komunikacji z API: {}", e.getMessage());
                throw new RuntimeException("Błąd komunikacji z API pogodowym: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            logger.error("Błąd podczas pobierania danych pogodowych: {}", e.getMessage(), e);
            throw new RuntimeException("Nie udało się pobrać danych pogodowych: " + e.getMessage(), e);
        }
    }

    /**
     * Generuje sugestię ubioru na podstawie aktualnej temperatury
     *
     * @param weatherData dane pogodowe pobrane z API
     * @return obiekt zawierający sugestie ubioru
     */
    public ClothingSuggestion getSuggestion(Map<String, Object> weatherData) {
        try {
            // Logowanie otrzymanych danych
            logger.debug("Otrzymane dane pogodowe: {}", weatherData);

            // Sprawdzenie czy dane zawierają current_weather
            if (weatherData == null) {
                logger.error("Brak danych pogodowych");
                throw new RuntimeException("Brak danych pogodowych");
            }

            if (!weatherData.containsKey("current_weather")) {
                logger.error("Brak danych current_weather w odpowiedzi");
                throw new RuntimeException("Nieprawidłowe dane pogodowe - brak current_weather");
            }

            Map<String, Object> currentWeather = (Map<String, Object>) weatherData.get("current_weather");

            if (!currentWeather.containsKey("temperature") || !currentWeather.containsKey("weathercode")) {
                logger.error("Brak temperatury lub kodu pogody w danych");
                throw new RuntimeException("Niepełne dane pogodowe - brak temperature lub weathercode");
            }

            double temperature = (double) currentWeather.get("temperature");
            int weatherCode = ((Number) currentWeather.get("weathercode")).intValue();

            String mainClothing;
            String additionalItems = "";
            String description;

            // Podstawowe sugestie ubioru na podstawie temperatury
            if (temperature > 20) {
                mainClothing = "koszulka";
                description = "Dziś jest ciepło, wystarczy lekki ubiór.";
            } else if (temperature >= 15) {
                mainClothing = "bluza";
                description = "Umiarkowana temperatura, przyda się bluza.";
            } else {
                mainClothing = "bluza i kurtka";
                description = "Dziś jest chłodno, ubierz się ciepło.";
            }

            // Dodatkowe sugestie w zależności od warunków pogodowych
            if (isRainy(weatherCode)) {
                additionalItems += "parasol, ";
            }

            if (isWindy(weatherData)) {
                additionalItems += "wiatrowka, ";
            }

            if (isSunny(weatherCode) && temperature > 15) {
                additionalItems += "okulary przeciwsłoneczne, ";
            }

            // Usunięcie przecinka i spacji z końca
            if (!additionalItems.isEmpty()) {
                additionalItems = additionalItems.substring(0, additionalItems.length() - 2);
            }

            logger.info("Wygenerowano sugestię ubioru: {} + {}", mainClothing, additionalItems);
            return new ClothingSuggestion(mainClothing, additionalItems, description);
        } catch (Exception e) {
            logger.error("Błąd podczas generowania sugestii ubioru: {}", e.getMessage(), e);
            throw new RuntimeException("Nie udało się wygenerować sugestii ubioru: " + e.getMessage(), e);
        }
    }

    /**
     * Sprawdza, czy warunki pogodowe wskazują na deszcz
     */
    private boolean isRainy(int weatherCode) {
        // Kody pogodowe odpowiadające deszczowi
        return weatherCode >= 51 && weatherCode <= 65  // Mżawka i deszcz
                || weatherCode >= 80 && weatherCode <= 82;  // Przelotne deszcze
    }

    /**
     * Sprawdza, czy jest wietrznie
     */
    private boolean isWindy(Map<String, Object> weatherData) {
        try {
            Map<String, Object> currentWeather = (Map<String, Object>) weatherData.get("current_weather");

            if (currentWeather.containsKey("windspeed")) {
                double windspeed = (double) currentWeather.get("windspeed");
                return windspeed > 20;  // Zakładamy, że powyżej 20 km/h jest wietrznie
            }
            return false;
        } catch (Exception e) {
            logger.warn("Nie można określić czy jest wietrznie: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Sprawdza, czy jest słonecznie
     */
    private boolean isSunny(int weatherCode) {
        // Kody 0, 1 to czyste niebo i głównie bezchmurne
        return weatherCode == 0 || weatherCode == 1;
    }

    /**
     * Klasa wewnętrzna reprezentująca sugestię ubioru
     */
    public static class ClothingSuggestion {
        private String mainClothing;
        private String additionalItems;
        private String description;

        public ClothingSuggestion(String mainClothing, String additionalItems, String description) {
            this.mainClothing = mainClothing;
            this.additionalItems = additionalItems;
            this.description = description;
        }

        public String getMainClothing() {
            return mainClothing;
        }

        public String getAdditionalItems() {
            return additionalItems;
        }

        public String getDescription() {
            return description;
        }

        @Override
        public String toString() {
            StringBuilder suggestion = new StringBuilder(description + " Sugerowany ubiór: " + mainClothing);
            if (!additionalItems.isEmpty()) {
                suggestion.append(". Dodatkowo: ").append(additionalItems);
            }
            return suggestion.toString();
        }
    }
}