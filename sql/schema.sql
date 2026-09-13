CREATE DATABASE IF NOT EXISTS codebridge_api;
USE codebridge_api;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enrollment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);

INSERT INTO courses (title, description, category, price) VALUES
('HTML and CSS Fundamentals', 'Learn the fundamentals of building web pages.', 'Web Development', 30000),
('JavaScript Programming', 'Learn JavaScript programming and modern concepts.', 'Web Development', 40000),
('React.js Development', 'Build modern frontend applications using React.js.', 'Frontend', 50000),
('Node.js and Express.js', 'Develop backend applications and REST APIs.', 'Backend', 50000),
('MySQL Database Development', 'Learn database design and SQL development.', 'Database', 40000),
('Full Stack Web Development', 'Build complete frontend and backend applications.', 'Full Stack', 70000);
