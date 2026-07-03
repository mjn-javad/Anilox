CREATE TABLE users(
    id int(10) unsigned not null AUTO_INCREMENT,
    name varchar(255) not null,
    avatar varchar(255) DEFAULT null,
    password varchar(255) DEFAULT null,
    username varchar(255) not null,
    email varchar(255) not null,
    provider enum("local", "google", "meta") not null DEFAULT "local",
    role ENUM("user", "admin") not null DEFAULT "user",
    
    PRIMARY KEY (id),
    UNIQUE KEY users_unique_username (username),
    UNIQUE KEY users_unique_email (email)
    )ENGINE innodb AUTO_INCREMENT=10 DEFAULT charset=utf8mb4 COLLATE=utf8mb4_unicode_ci;