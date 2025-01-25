const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('./messages.db');

// Создание таблицы, если она не существует
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)");
});

// Настройка статических файлов
app.use(express.static('public'));
app.use(express.json());

// Загрузка сообщений из базы данных
app.get('/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id DESC", (err, rows) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.json(rows);
    });
});

// Добавление нового сообщения
app.post('/message', (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).send('Message cannot be empty');
    }

    db.run("INSERT INTO messages (text) VALUES (?)", [text], function (err) {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).send({ id: this.lastID, text });
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
