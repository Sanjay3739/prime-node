const express = require('express');
const multer = require('multer');
const { createReadStream } = require('fs');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client with your API key
const openai = new OpenAI({ apiKey:process.env.OPENAI_API_KEY});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
const cors = require('cors');
app.use(cors());

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Store the paragraph globally
let paragraph = "";

// Define route for setting the paragraph from a PDF file
app.post('/upload_pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        // Extract text from the uploaded PDF
        const pdfBuffer = req.file.buffer;
        const pdfText = await extractTextFromPDF(pdfBuffer);

        // Set the extracted text as the paragraph
        paragraph = pdfText;

        res.status(200).send("PDF uploaded and text extracted successfully.");
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).send("Error uploading PDF");
    }
});

// Extract text from PDF
async function extractTextFromPDF(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    return data.text;
}

// Define route for asking questions
app.post('/ask_question', express.json(), async (req, res) => {
    try {
        const { question } = req.body;

        if (!paragraph) {
            return res.status(400).send("Paragraph not set. Please set the paragraph first.");
        }

        // Call OpenAI API to get the answer
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: paragraph },
                { role: 'user', content: question }
            ]
        });

        const answer = completion.choices[0].message.content;
        res.json({ answer });
    } catch (error) {
        console.error("Error asking question:", error);
        res.status(500).send("Error asking question");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
