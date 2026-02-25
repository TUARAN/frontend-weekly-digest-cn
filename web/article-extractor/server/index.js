const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// ensure base dirs
const BASE_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(BASE_DIR, 'output-backup');
fs.ensureDirSync(BACKUP_DIR);

// serve saved backups/assets under a same-origin path so the client iframe can load resources
app.use('/api/backups', express.static(BACKUP_DIR));

// mounting routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Article Extractor backend running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
