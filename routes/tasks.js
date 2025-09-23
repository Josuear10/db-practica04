const express = require("express");
const pool = require("../db");

const router = express.Router();

// POST /tasks (crear tarea)
router.post("/", async (req, res) => {
  const { user_id, title, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, description) VALUES ($1,$2,$3) RETURNING *",
      [user_id, title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks/:userId (listar tareas de usuario)
router.get("/:userId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC", [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id/status (avanzar estado)
router.put("/:id/status", async (req, res) => {
  try {
    const task = await pool.query("SELECT status FROM tasks WHERE id=$1", [req.params.id]);
    if (task.rows.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });

    let newStatus = "pending";
    if (task.rows[0].status === "pending") newStatus = "in_progress";
    else if (task.rows[0].status === "in_progress") newStatus = "done";

    const result = await pool.query("UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *", [newStatus, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
