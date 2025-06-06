const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'entries.json');

function readEntries() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    return [];
  }
}

function writeEntries(entries) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

app.get('/api/entries', (req, res) => {
  res.json(readEntries());
});

app.post('/api/entries', (req, res) => {
  const entries = readEntries();
  const entry = {
    id: Date.now(),
    date: req.body.date,
    meal: req.body.meal,
    calories: parseInt(req.body.calories, 10) || 0
  };
  entries.push(entry);
  writeEntries(entries);
  res.json(entry);
});

app.delete('/api/entries/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entries = readEntries();
  const updated = entries.filter(e => e.id !== id);
  writeEntries(updated);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
