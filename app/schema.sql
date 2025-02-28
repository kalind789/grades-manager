-- Drop tables if they exist to prevent conflicts
DROP TABLE IF EXISTS assignment CASCADE;
DROP TABLE IF EXISTS section CASCADE;
DROP TABLE IF EXISTS class CASCADE;
DROP TABLE IF EXISTS student CASCADE;

-- ✅ Create `student` table
CREATE TABLE IF NOT EXISTS student (
    id SERIAL PRIMARY KEY,
    studentname TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE
);

-- ✅ Create `class` table
CREATE TABLE IF NOT EXISTS class (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    class_code TEXT,
    class_grade REAL,
    FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE
);

-- ✅ Create `section` table
CREATE TABLE IF NOT EXISTS section (
    id SERIAL PRIMARY KEY,
    section_name TEXT NOT NULL,
    section_weight REAL NOT NULL,
    class_id INTEGER NOT NULL,
    FOREIGN KEY (class_id) REFERENCES class (id) ON DELETE CASCADE
);

-- ✅ Create `assignment` table
CREATE TABLE IF NOT EXISTS assignment (
    id SERIAL PRIMARY KEY,
    assignment_name TEXT NOT NULL,
    assignment_grade REAL,
    section_id INTEGER NOT NULL, 
    FOREIGN KEY (section_id) REFERENCES section (id) ON DELETE CASCADE
);