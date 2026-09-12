const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database
const db = new sqlite3.Database("./quotes.db");

// Create favorites table
db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get random quote from public API
app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    const data = await response.json();

    res.json({
      quote: data.quote,
      author: data.author
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

// Save favorite quote
app.post("/api/favorites", (req, res) => {
  const { quote, author } = req.body;

  if (!quote || !author) {
    return res.status(400).json({ error: "Quote and author are required" });
  }

  db.run(
    "INSERT INTO favorites (quote, author) VALUES (?, ?)",
    [quote, author],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save favorite" });
      }

      res.json({
        message: "Quote added to favorites",
        id: this.lastID
      });
    }
  );
});

// Get favorite history
app.get("/api/favorites", (req, res) => {
  db.all(
    "SELECT * FROM favorites ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch favorites" });
      }

      res.json(rows);
    }
  );
});

// Delete favorite
app.delete("/api/favorites/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM favorites WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete favorite" });
      }

      res.json({ message: "Favorite deleted" });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});