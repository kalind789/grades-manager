DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS classes;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE class (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    class_code TEXT,
    class_proffesor TEXT,
    class_grade REAL,
    FOREIGN KEY (student_id) REFERENCES user (id)
);