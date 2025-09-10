// Fix: Use qualified express types to avoid conflicts with global types.
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import KnowledgeFile from '../models/KnowledgeFile';

const router = express.Router();

// Ensure uploads directory exists
// Fix: Resolve path from current working directory to avoid issues with __dirname not being defined in some environments.
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// GET all knowledge files
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const files = await KnowledgeFile.find().sort({ uploadedAt: -1 });
        res.json(files);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// POST (upload) a new file
router.post('/', upload.single('file'), async (req: express.Request, res: express.Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const { originalname, mimetype, size, path: filePath } = req.file;
    
    const newFile = new KnowledgeFile({
        name: originalname,
        type: mimetype,
        size,
        path: filePath
    });

    try {
        const savedFile = await newFile.save();
        res.status(201).json(savedFile);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a file
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const fileToDelete = await KnowledgeFile.findById(req.params.id);
        if (!fileToDelete) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete file from filesystem
        fs.unlink(fileToDelete.path, async (err) => {
            if (err) {
                console.error("Failed to delete file from filesystem:", err);
                // For robustness, we'll still attempt to delete the DB record.
            }

            // Delete record from database
            await KnowledgeFile.findByIdAndDelete(req.params.id);
            res.json({ message: 'File deleted successfully' });
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;