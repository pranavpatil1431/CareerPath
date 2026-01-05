-- Enhanced database schema for CareerPath project
CREATE DATABASE IF NOT EXISTS careerpath;
USE careerpath;

-- Drop existing table if it exists to recreate with new structure
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  marks INT NOT NULL CHECK (marks >= 0 AND marks <= 100),
  stream VARCHAR(50) DEFAULT 'Science',
  course VARCHAR(100) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  address TEXT DEFAULT '',
  date_of_birth DATE NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  application_id VARCHAR(50) UNIQUE,
  
  -- Indexes for better performance
  INDEX idx_email (email),
  INDEX idx_marks (marks DESC),
  INDEX idx_stream (stream),
  INDEX idx_applied_at (applied_at DESC),
  INDEX idx_status (status)
);

-- Insert sample data for testing
INSERT INTO students (name, email, marks, stream, course, application_id) VALUES
('Patil Pranav Maruti', 'pranav@example.com', 99, 'Science', 'Computer Science', 'APP001'),
('Tejashree Sangram Patil', 'tejashree@example.com', 99, 'Science', 'Engineering', 'APP002'),
('Alice Johnson', 'alice@example.com', 92, 'Science', 'Computer Science', 'APP003'),
('Bob Smith', 'bob@example.com', 88, 'Arts', 'English Literature', 'APP004'),
('Carol Davis', 'carol@example.com', 90, 'Commerce', 'Business Administration', 'APP005'),
('Anu Patil', 'anu@example.com', 98, 'Arts', 'BE', 'APP006'),
('Shekhar Jadhav', 'shekhar@example.com', 91, 'Commerce', 'BBA', 'APP007'),
('Anushka Mane', 'anushka@example.com', 85, 'Science', 'BCA', 'APP008'),
('Tanu Khot', 'tanu@example.com', 76, 'Science', 'Engineering', 'APP009'),
('Yash Mane', 'yash@example.com', 68, 'Science', 'BCA', 'APP010'),
('Isha Kadam', 'isha@example.com', 82, 'Arts', 'BE', 'APP011');

-- Create a view for merit rankings
CREATE VIEW merit_rankings AS
SELECT 
  id,
  name,
  email,
  marks,
  stream,
  course,
  applied_at,
  application_id,
  status,
  -- Overall rank (all streams combined)
  ROW_NUMBER() OVER (ORDER BY marks DESC, applied_at ASC) as overall_rank,
  -- Stream-wise rank
  ROW_NUMBER() OVER (PARTITION BY stream ORDER BY marks DESC, applied_at ASC) as stream_rank
FROM students 
WHERE status = 'pending'
ORDER BY marks DESC, applied_at ASC;

-- Create stored procedure for getting merit list
DELIMITER //
CREATE PROCEDURE GetMeritList(IN stream_filter VARCHAR(50))
BEGIN
  IF stream_filter = 'all' OR stream_filter IS NULL THEN
    SELECT * FROM merit_rankings ORDER BY overall_rank;
  ELSE
    SELECT * FROM merit_rankings WHERE stream = stream_filter ORDER BY stream_rank;
  END IF;
END //
DELIMITER ;

-- Create trigger to auto-generate application ID
DELIMITER //
CREATE TRIGGER generate_application_id 
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
  IF NEW.application_id IS NULL THEN
    SET NEW.application_id = CONCAT('APP', LPAD(FLOOR(RAND() * 999999), 6, '0'));
  END IF;
END //
DELIMITER ;
