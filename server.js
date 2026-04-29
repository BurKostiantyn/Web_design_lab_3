const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Налаштування для обробки запитів від фронтенду
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Підключення до бази даних SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Помилка підключення до бази даних:', err.message);
    } else {
        console.error('Успішно підключено до бази даних SQLite.');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            gender TEXT,
            date TEXT,
            password TEXT
        )`);
    }
});

// Ендпоінт для РЕЄСТРАЦІЇ
app.post('/api/register', (req, res) => {
    const { name, email, gender, date, password } = req.body;

    const sql = 'INSERT INTO users (name, email, gender, date, password) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [name, email, gender, date, password], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Користувач з таким email вже існує!' });
        }
        res.json({ message: 'Реєстрація успішна!', userId: this.lastID });
    });
});

// Ендпоінт для ВХОДУ
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(sql, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (row) {
            res.json({
                message: 'Вхід успішний',
                user: { name: row.name, email: row.email, gender: row.gender, date: row.date }
            });
        } else {
            res.status(401).json({ error: 'Невірний email або пароль' });
        }
    });
});

// Ендпоінт для ОНОВЛЕННЯ профілю
app.put('/api/update', (req, res) => {
    const { name, gender, date, email } = req.body;

    const sql = 'UPDATE users SET name = ?, gender = ?, date = ? WHERE email = ?';
    db.run(sql, [name, gender, date, email], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Помилка оновлення бази даних' });
        }
        res.json({ message: 'Профіль успішно оновлено!' });
    });
});

// Ендпоінт для ВИДАЛЕННЯ акаунта
app.delete('/api/delete', (req, res) => {
    const { email } = req.body;

    const sql = 'DELETE FROM users WHERE email = ?';
    db.run(sql, [email], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Помилка видалення акаунта' });
        }
        res.json({ message: 'Ваш акаунт було видалено назавжди.' });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер успішно запущено на http://localhost:${port}`);
});