const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Cache for stats
let statsCache = null;
let lastModified = null;

// Watch file for changes
fs.stat(DATA_PATH)
  .then((stats) => {
    lastModified = stats.mtime;
    fs.watchFile(DATA_PATH, (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        statsCache = null; // Invalidate cache
        lastModified = curr.mtime;
      }
    });
  })
  .catch(() => {
    // File doesn't exist yet
  });

async function calculateStats() {
  try {
    const stats = await fs.stat(DATA_PATH);

    // Return cached data if file hasn't changed
    if (statsCache && lastModified && stats.mtime <= lastModified) {
      return statsCache;
    }

    const raw = await fs.readFile(DATA_PATH, "utf8");
    const items = JSON.parse(raw);

    statsCache = {
      total: items.length,
      averagePrice:
        items.length > 0
          ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
          : 0,
    };

    lastModified = stats.mtime;
    return statsCache;
  } catch (error) {
    throw error;
  }
}

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    const stats = await calculateStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
