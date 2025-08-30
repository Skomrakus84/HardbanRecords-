// Plik: backend/routes/music.cjs
const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

// Helper do transformacji snake_case na camelCase dla zadań
const transformTask = (task) => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
});

// POST /api/music/releases - Dodawanie nowego wydania
router.post('/releases', async (req, res) => {
    const { title, artist, genre, splits } = req.body;
    if (!title || !artist || !genre) {
        return res.status(400).json({ success: false, message: 'Tytuł, artysta i gatunek są wymagane.' });
    }
    try {
        const newReleaseRes = await db.query(
            'INSERT INTO music_releases (title, artist, genre, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, artist, genre, 'Submitted']
        );
        const newRelease = newReleaseRes.rows[0];

        if (splits && splits.length > 0) {
            for (const split of splits) {
                await db.query(
                    'INSERT INTO music_release_splits (release_id, name, share) VALUES ($1, $2, $3)',
                    [newRelease.id, split.name, parseFloat(split.share)]
                );
            }
        }
        res.status(201).json({ success: true, release: { ...newRelease, splits: splits || [] } });
    } catch (error) {
        console.error("Błąd podczas dodawania wydania muzycznego:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera podczas dodawania wydania.", error: error.message });
    }
});

// PATCH /api/music/releases/:id/splits - Aktualizacja podziałów tantiem
router.patch('/releases/:id/splits', async (req, res) => {
    const { id } = req.params;
    const { splits } = req.body;
    try {
        await db.query('BEGIN');
        await db.query('DELETE FROM music_release_splits WHERE release_id = $1', [id]);
        for (const split of splits) {
            await db.query(
                'INSERT INTO music_release_splits (release_id, name, share) VALUES ($1, $2, $3)',
                [id, split.name, parseFloat(split.share)]
            );
        }
        await db.query('COMMIT');
        res.json({ success: true, message: 'Podziały zostały pomyślnie zaktualizowane.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Błąd podczas aktualizacji podziałów:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera.", error: error.message });
    }
});

// POST /api/music/tasks - Dodawanie nowego zadania muzycznego
router.post('/tasks', async (req, res) => {
    const { text, dueDate } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, message: 'Treść zadania jest wymagana.' });
    }
    try {
        const newTaskRes = await db.query(
            'INSERT INTO music_tasks (text, due_date, completed) VALUES ($1, $2, false) RETURNING *',
            [text, dueDate || null]
        );
        res.status(201).json({ success: true, task: transformTask(newTaskRes.rows[0]) });
    } catch (error) {
        console.error("Błąd podczas dodawania zadania muzycznego:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
    }
});

// PATCH /api/music/tasks/:id - Zmiana statusu zadania muzycznego
router.patch('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        await db.query('UPDATE music_tasks SET completed = $1 WHERE id = $2', [completed, id]);
        res.json({ success: true, message: 'Status zadania został zaktualizowany.' });
    } catch (error) {
        console.error("Błąd podczas aktualizacji zadania muzycznego:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
    }
});

module.exports = router;
