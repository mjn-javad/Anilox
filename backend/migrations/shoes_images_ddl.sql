-- جدول کامل shoes_images با فیلد sort_order
CREATE TABLE shoes_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shoes_id INT NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (shoes_id) REFERENCES shoes(id) ON DELETE CASCADE,
    INDEX idx_sort_order (sort_order),
    INDEX idx_shoes_id (shoes_id)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;