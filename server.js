const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const db = new Database('messages.db', { verbose: console.log });

// Создание таблицы, если она не существует
db.serialize(() => {
  const stmt = db.prepare('SELECT * FROM messages');
  const rows = stmt.all();
  console.log(rows);
});
app.use(express.json());

// Загрузка сообщений
app.get('/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id DESC", (err, rows) => {
        if (err) {
            console.error('Database read error:', err);
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
            console.error('Database write error:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send({ id: this.lastID, text });
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
