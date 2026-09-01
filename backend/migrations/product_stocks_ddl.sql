CREATE TABLE product_stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    stock INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_stock (product_id, stock)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
