DROP TABLE IF EXISTS wardrobe;

CREATE TABLE wardrobe (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          user_id BIGINT NOT NULL,
                          category VARCHAR(255),
                          is_waterproof BOOLEAN DEFAULT FALSE,
                          is_windproof BOOLEAN DEFAULT FALSE,
                          material VARCHAR(255),
                          grammage DOUBLE,
                          estimated_clo DOUBLE
);