CREATE TABLE discount_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL COMMENT 'مقدار تخفیف (درصد یا مبلغ ثابت)',
    applies_to ENUM('all_products', 'specific_product') NOT NULL DEFAULT 'all_products',
    product_id INT NULL COMMENT 'اگر برای محصول خاصی باشد',
    max_uses INT DEFAULT NULL COMMENT 'حداکثر تعداد استفاده',
    used_count INT DEFAULT 0 COMMENT 'تعداد دفعات استفاده شده',
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES shoes(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_valid_dates (valid_from, valid_until),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;