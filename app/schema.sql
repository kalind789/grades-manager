DROP TABLE IF EXISTS assignment;
DROP TABLE IF EXISTS section;
DROP TABLE IF EXISTS class;
DROP TABLE IF EXISTS user;

CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS class (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    class_code TEXT,
    class_grade REAL,
    FOREIGN KEY (student_id) REFERENCES user (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS section (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_name TEXT NOT NULL,
    section_weight REAL NOT NULL,
    class_id INTEGER NOT NULL,
    FOREIGN KEY (class_id) REFERENCES class (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_name TEXT NOT NULL,
    assignment_grade REAL,
    section_id INTEGER NOT NULL, 
    FOREIGN KEY (section_id) REFERENCES section (id) ON DELETE CASCADE
)