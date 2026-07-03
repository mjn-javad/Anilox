CREATE TABLE shoes_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shoes_id INT NOT NULL,
    size INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (shoes_id) REFERENCES shoes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_shoe_sizer (shoes_id, size)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;