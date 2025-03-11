CREATE TABLE beaches (
    id SERIAL PRIMARY KEY,
    access_by_car BOOLEAN NOT NULL,
    access_by_foot VARCHAR(20) NOT NULL,  -- "EASY", etc.
    access_by_ship BOOLEAN NOT NULL,
    adapted_shower BOOLEAN NOT NULL,
    annual_max_occupancy VARCHAR(20) NOT NULL,  -- "LOW", "MEDIUM", etc.
    assisted_bathing BOOLEAN NOT NULL,
    bathing_conditions VARCHAR(20) NOT NULL,  -- "CALM_WATERS", etc.
    classification VARCHAR(20) NOT NULL,  -- "FREE", etc.
    environment_condition VARCHAR(20) NOT NULL,  -- "URBAN", "SEMI_URBAN", etc.
    has_adapted_showers BOOLEAN NOT NULL,
    blue_flag BOOLEAN NOT NULL,
    has_cobbles BOOLEAN NOT NULL,
    has_concrete BOOLEAN NOT NULL,
    has_foot_showers BOOLEAN NOT NULL,
    has_gravel BOOLEAN NOT NULL,
    has_mixed_composition BOOLEAN NOT NULL,
    has_pebbles BOOLEAN NOT NULL,
    has_rock BOOLEAN NOT NULL,
    has_sand BOOLEAN NOT NULL,
    has_showers BOOLEAN NOT NULL,
    has_toilets BOOLEAN NOT NULL,
    is_beach BOOLEAN NOT NULL,
    is_windy BOOLEAN NOT NULL,
    is_zbm BOOLEAN NOT NULL,
    island VARCHAR(50) NOT NULL,
    kids_area BOOLEAN NOT NULL,
    last_update DATE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    length INT NOT NULL,  -- in meters
    lifeguard_service VARCHAR(100) NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    pmr_shade BOOLEAN NOT NULL,
    protection_level VARCHAR(20) NOT NULL,  -- "LOW", "MEDIUM", etc.
    province VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,  -- "LOW", etc.
    sand_color VARCHAR(20) NOT NULL,  -- "GOLDEN", etc.
    sports_area BOOLEAN NOT NULL,
    sunbed_rentals BOOLEAN NOT NULL,
    umbrella_rentals BOOLEAN NOT NULL,
    water_sports_rentals BOOLEAN NOT NULL,
    wheelchair_access BOOLEAN NOT NULL,
    width INT NOT NULL  -- in meters
);

CREATE INDEX idx_beaches_name ON beaches(name);
CREATE INDEX idx_beaches_province ON beaches(province);
CREATE INDEX idx_beaches_municipality ON beaches(municipality);
CREATE INDEX idx_beaches_island ON beaches(island);
CREATE INDEX idx_beaches_latitude ON beaches(latitude);
CREATE INDEX idx_beaches_longitude ON beaches(longitude);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    google_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE favourites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    beach_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favourites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favourites_beach FOREIGN KEY (beach_id) REFERENCES beaches(id) ON DELETE CASCADE,
    UNIQUE (user_id, beach_id)
);

CREATE INDEX idx_favourites_user_id ON favourites(user_id);
CREATE INDEX idx_favourites_beach_id ON favourites(beach_id);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    beach_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_beach FOREIGN KEY (beach_id) REFERENCES beaches(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_beach_id ON reviews(beach_id);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
