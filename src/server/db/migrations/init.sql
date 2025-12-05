CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL
);

-- seed sample data if empty
INSERT INTO users (id, name, role)
SELECT 1, 'Alice', 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT INTO users (id, name, role)
SELECT 2, 'Bob', 'USER' WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 2);
