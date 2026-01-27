
import "dotenv/config";
import pool from "../db.js";

async function run() {
    try {
        console.log("Running migration...");

        // Add title column
        await pool.query(`
      ALTER TABLE gallery 
      ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    `);
        console.log("Added title column.");

        // Add event_id column with foreign key relation
        // Allowing NULL because a gallery image might not be associated with an event
        await pool.query(`
      ALTER TABLE gallery 
      ADD COLUMN IF NOT EXISTS event_id INT REFERENCES events(id) ON DELETE SET NULL;
    `);
        console.log("Added event_id column.");

    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await pool.end();
    }
}

run();
