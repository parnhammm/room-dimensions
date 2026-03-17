// This file is loaded by Jest via setupFiles BEFORE any modules are evaluated.
// It forces AppDataSource to connect to the test database instead of the dev database.
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3307';
process.env.DB_DATABASE = 'room_dimensions_test';
process.env.DB_USERNAME = 'root';
process.env.DB_PASSWORD = 'testpassword';
