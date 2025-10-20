const express = require('express');
const cors = require('cors');
const pg = require('pg');
const path = require('path');

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Configuration ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Allow larger JSON payloads

// --- Helper Function to Initialize Database ---
const initializeDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS link_data (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
    console.log('Database table checked/created successfully.');
  } catch (err) {
    console.error('Error initializing database table', err.stack);
  } finally {
    client.release();
  }
};

// --- API Routes ---

// GET endpoint to fetch link data
app.get('/api/links', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT data FROM link_data WHERE id = $1', ['user_links']);
    client.release();

    if (result.rows.length > 0) {
      res.json(result.rows[0].data);
    } else {
      res.status(404).json({ message: 'No link data found. Please save some data first.' });
    }
  } catch (err) {
    console.error('Error fetching links', err.stack);
    res.status(500).send('Server Error');
  }
});

// POST endpoint to save/update link data
app.post('/api/links', async (req, res) => {
  const { linkData } = req.body;
  if (!linkData) {
    return res.status(400).send('linkData is required');
  }

  try {
    const client = await pool.connect();
    // Use UPSERT logic: Insert if not exists, update if it does.
    await client.query(`
      INSERT INTO link_data (id, data)
      VALUES ($1, $2)
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data;
    `, ['user_links', JSON.stringify(linkData)]);
    client.release();

    res.status(200).json({ message: 'Data saved successfully.' });
  } catch (err) {
    console.error('Error saving links', err.stack);
    res.status(500).send('Server Error');
  }
});

// --- Serve Frontend ---
// In CommonJS, __dirname refers to the directory of the current file.
// Since this file is in /server, __dirname is /server.
// We want to serve files from the root, which is one level up.
const buildPath = path.join(__dirname, '..'); 

app.use(express.static(buildPath));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


// --- Start Server ---
app.listen(PORT, async () => {
  await initializeDb();
  console.log(`Server is running on port ${PORT}`);
});