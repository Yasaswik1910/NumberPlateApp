const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const db = require('./database'); // using the db setup from database.js

const app = express();
const port = 5000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Route: Upload video and detect plates
app.post('/upload', upload.single('video'), (req, res) => {
  const filePath = path.resolve(__dirname, req.file.path);
  console.log(`Received video: ${filePath}`);

  exec(`python ../python_service/detect.py "${filePath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Python script failed' });
    }

    const plates = stdout.trim().split('\n').filter(Boolean);

    plates.forEach((plate) => {
      db.run(
        'INSERT INTO detected_vehicles (plate_number) VALUES (?)',
        [plate],
        (err) => {
          if (err) console.error(`Failed to insert plate ${plate}:`, err.message);
        }
      );
    });

    res.json({ plates });
  });
});

// API: Mark vehicle as theft
app.post('/mark-theft', (req, res) => {
  const { plate_number } = req.body;

  db.run(
    'INSERT OR IGNORE INTO theft_vehicles (plate_number) VALUES (?)',
    [plate_number],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Plate added to theft_vehicles' });
    }
  );
});

// API: Add detected plate manually
app.post('/add-detected', (req, res) => {
  const { plate } = req.body;

  db.run(
    'INSERT INTO detected_vehicles (plate_number) VALUES (?)',
    [plate],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to insert plate' });
      res.send('Plate added to detected_vehicles');
    }
  );
});

// API: Check if a plate is marked as theft
app.get('/check-theft/:plate', (req, res) => {
  const plate = req.params.plate;

  db.get(
    'SELECT * FROM theft_vehicles WHERE plate_number = ?',
    [plate],
    (err, row) => {
      if (err) return res.status(500).send('Error checking theft plate');

      if (row) res.json({ isTheft: true });
      else res.json({ isTheft: false });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
