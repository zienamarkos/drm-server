const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// Create an Express app
const app = express();

// Use CORS to allow cross-origin requests
app.use(cors());

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bdrm', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a schema and model for storing uploaded files
const FileSchema = new mongoose.Schema({
    author: String,
    title: String,
    type: String,
    filePath: String,
    fileName: String,
    postedDate: { type: Date, default: Date.now },
});

const FileModel = mongoose.model('File', FileSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Create an API endpoint for file uploads
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        // Get file information from the request
        const { originalname, filename } = req.file;
        const { author, title, type } = req.body;

        // Create a new file entry in the database
        const newFile = new FileModel({
            author,
            title,
            type,
            filePath: req.file.path,
            fileName: filename,
            
            
        });

        // Save the file entry to the database
        await newFile.save();

        res.status(201).json({
            message: 'File uploaded successfully',
            file: newFile,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create an API endpoint to retrieve all files
app.get('/api/files', async (req, res) => {
    try {
        const files = await FileModel.find();
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
