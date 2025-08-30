// Plik: backend/routes/api.cjs
const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// --- Konfiguracja Klienta S3 ---
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Helpery
const formatDate = (date) => {
    if (!date) return undefined;
    const d = new Date(date);
    return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
};
const transformTask = (task) => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
});

// --- Główne Endpointy ---

// GET /api/data - Pobieranie wszystkich danych aplikacji
router.get('/data', async (req, res) => {
    try {
        const [ musicReleasesRes, musicSplitsRes, musicTasksRes, booksRes, bookSplitsRes, bookChaptersRes, bookIllustrationsRes, publishingTasksRes, appConfigRes ] = await Promise.all([
            db.query('SELECT * FROM music_releases ORDER BY id'),
            db.query('SELECT * FROM music_release_splits'),
            db.query('SELECT * FROM music_tasks ORDER BY id'),
            db.query('SELECT * FROM books ORDER BY id'),
            db.query('SELECT * FROM book_splits'),
            db.query('SELECT * FROM book_chapters ORDER BY book_id, chapter_order'),
            db.query('SELECT * FROM book_illustrations'),
            db.query('SELECT * FROM publishing_tasks ORDER BY id'),
            db.query('SELECT onboarding_complete FROM app_config WHERE id = 1')
        ]);

        const musicSplitsMap = musicSplitsRes.rows.reduce((acc, split) => { (acc[split.release_id] = acc[split.release_id] || []).push({ name: split.name, share: String(split.share) }); return acc; }, {});
        const bookSplitsMap = bookSplitsRes.rows.reduce((acc, split) => { (acc[split.book_id] = acc[split.book_id] || []).push({ name: split.name, share: String(split.share) }); return acc; }, {});
        const bookChaptersMap = bookChaptersRes.rows.reduce((acc, chapter) => { (acc[chapter.book_id] = acc[chapter.book_id] || []).push({ title: chapter.title, content: chapter.content }); return acc; }, {});
        const bookIllustrationsMap = bookIllustrationsRes.rows.reduce((acc, illustration) => { (acc[illustration.book_id] = acc[illustration.book_id] || []).push({ url: illustration.url, prompt: illustration.prompt }); return acc; }, {});

        const releasesWithSplits = musicReleasesRes.rows.map(r => ({ ...r, releaseDate: formatDate(r.release_date), splits: musicSplitsMap[r.id] || [] }));
        const booksWithDetails = booksRes.rows.map(b => ({ ...b, rights: { territorial: !!b.rights_territorial, translation: !!b.rights_translation, adaptation: !!b.rights_adaptation, audio: !!b.rights_audio, drm: !!b.rights_drm }, splits: bookSplitsMap[b.id] || [], chapters: bookChaptersMap[b.id] || [], illustrations: bookIllustrationsMap[b.id] || [] }));

        res.json({
            music: { releases: releasesWithSplits, tasks: musicTasksRes.rows.map(transformTask) },
            publishing: { books: booksWithDetails, tasks: publishingTasksRes.rows.map(transformTask) },
            onboardingComplete: appConfigRes.rows.length > 0 ? appConfigRes.rows[0].onboarding_complete : false,
        });

    } catch (error) {
        console.error("Błąd podczas pobierania danych aplikacji:", error);
        res.status(500).json({ success: false, message: "Nie udało się pobrać danych aplikacji.", error: error.message });
    }
});

// GET /api/s3-presigned-url - Generowanie linku do uploadu
router.get('/s3-presigned-url', async (req, res) => {
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
        return res.status(400).json({ message: "Parametry 'fileName' i 'fileType' są wymagane." });
    }
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: fileType,
    });
    try {
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        res.json({
            presignedUrl: presignedUrl,
            fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`
        });
    } catch (error) {
        console.error("Błąd podczas generowania presigned URL:", error);
        res.status(500).json({ message: 'Nie udało się wygenerować adresu URL.' });
    }
});

module.exports = router;
