CREATE TABLE wardrobe (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          user_id BIGINT NOT NULL,
                          type VARCHAR(255),
                          name VARCHAR(255),
                          clo DOUBLE
);