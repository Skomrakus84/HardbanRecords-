// Plik: backend/routes/publishing.cjs
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

// POST /api/publishing/books - Dodawanie nowej książki
router.post('/books', async (req, res) => {
    const { title, author, genre, splits, chapters, rights } = req.body;
    if (!title || !author) {
        return res.status(400).json({ success: false, message: 'Tytuł i autor są wymagani.' });
    }
    try {
        await db.query('BEGIN');
        const newBookRes = await db.query(
            'INSERT INTO books (title, author, genre, status, rights_territorial, rights_translation, rights_adaptation, rights_audio, rights_drm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [title, author, genre, 'Draft', !!rights.territorial, !!rights.translation, !!rights.adaptation, !!rights.audio, !!rights.drm]
        );
        const newBook = newBookRes.rows[0];

        if (chapters && chapters.length > 0) {
           for (const [index, chapter] of chapters.entries()) {
               await db.query('INSERT INTO book_chapters (book_id, title, content, chapter_order) VALUES ($1, $2, $3, $4)', [newBook.id, chapter.title, chapter.content, index]);
           }
        }
        if (splits && splits.length > 0) {
            for (const split of splits) {
                await db.query('INSERT INTO book_splits (book_id, name, share) VALUES ($1, $2, $3)', [newBook.id, split.name, parseFloat(split.share)]);
            }
        }
        await db.query('COMMIT');
        res.status(201).json({ success: true, book: { ...newBook, splits, chapters, rights } });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Błąd podczas dodawania książki:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera.", error: error.message });
    }
});

// PATCH /api/publishing/books/:id - Aktualizacja danych książki
router.patch('/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, status, blurb, keywords, rights, splits, chapters, coverImageUrl } = req.body;
    
    try {
        await db.query('BEGIN');

        if (title) await db.query('UPDATE books SET title = $1 WHERE id = $2', [title, id]);
        if (blurb) await db.query('UPDATE books SET blurb = $1 WHERE id = $2', [blurb, id]);
        if (keywords) await db.query('UPDATE books SET keywords = $1 WHERE id = $2', [keywords, id]);
        if (coverImageUrl) await db.query('UPDATE books SET cover_image_url = $1 WHERE id = $2', [coverImageUrl, id]);
        if (rights) {
            await db.query(
                'UPDATE books SET rights_territorial = $1, rights_translation = $2, rights_adaptation = $3, rights_audio = $4, rights_drm = $5 WHERE id = $6',
                [!!rights.territorial, !!rights.translation, !!rights.adaptation, !!rights.audio, !!rights.drm, id]
            );
        }

        if (splits) {
            await db.query('DELETE FROM book_splits WHERE book_id = $1', [id]);
            for (const split of splits) {
                await db.query('INSERT INTO book_splits (book_id, name, share) VALUES ($1, $2, $3)', [id, split.name, parseFloat(split.share)]);
            }
        }
        
        if (chapters) {
            await db.query('DELETE FROM book_chapters WHERE book_id = $1', [id]);
            for (const [index, chapter] of chapters.entries()) {
                await db.query('INSERT INTO book_chapters (book_id, title, content, chapter_order) VALUES ($1, $2, $3, $4)', [id, chapter.title, chapter.content, index]);
            }
        }

        await db.query('COMMIT');
        res.json({ success: true, message: 'Książka została pomyślnie zaktualizowana.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Błąd podczas aktualizacji książki:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera.", error: error.message });
    }
});

// POST /api/publishing/tasks - Dodawanie nowego zadania wydawniczego
router.post('/tasks', async (req, res) => {
    const { text, dueDate } = req.body;
     if (!text) {
        return res.status(400).json({ success: false, message: 'Treść zadania jest wymagana.' });
    }
    try {
        const newTaskRes = await db.query(
            'INSERT INTO publishing_tasks (text, due_date, completed) VALUES ($1, $2, false) RETURNING *',
            [text, dueDate || null]
        );
        res.status(201).json({ success: true, task: transformTask(newTaskRes.rows[0]) });
    } catch (error) {
        console.error("Błąd podczas dodawania zadania wydawniczego:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
    }
});

// PATCH /api/publishing/tasks/:id - Zmiana statusu zadania wydawniczego
router.patch('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        await db.query('UPDATE publishing_tasks SET completed = $1 WHERE id = $2', [completed, id]);
        res.json({ success: true, message: 'Status zadania został zaktualizowany.' });
    } catch (error) {
        console.error("Błąd podczas aktualizacji zadania wydawniczego:", error);
        res.status(500).json({ success: false, message: "Wystąpił błąd serwera." });
    }
});

module.exports = router;
