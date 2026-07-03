CREATE TABLE ban_users(
    id int(10) unsigned not null AUTO_INCREMENT,
    user_id int(10) unsigned not null,
    email varchar(255) not null,    
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )ENGINE innodb AUTO_INCREMENT=10 DEFAULT charset=utf8mb4 COLLATE=utf8mb4_unicode_ci;