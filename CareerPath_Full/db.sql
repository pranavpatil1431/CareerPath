-- Create database and students table for CareerPath project
CREATE DATABASE IF NOT EXISTS careerpath;
USE careerpath;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  marks INT NOT NULL,
  stream VARCHAR(50),
  course VARCHAR(100),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
