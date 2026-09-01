CREATE TABLE best_sellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)ENGINE innodb AUTO_INCREMENT=10 DEFAULT charset=utf8mb4 COLLATE=utf8mb4_unicode_ci;