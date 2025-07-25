const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer setup (for file upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Default route
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// POST route
app.post('/submit-form', upload.single('picture'), async (req, res) => {
  const data = req.body;
  const file = req.file;

  const output = `
    New Submission:
    Name: ${data.fullName}
    DOB: ${data.Date}
    Age: ${data.age}
    Gender: ${data.gender}
    Interests: ${data.interests}
    Payment: ${data.payment}
    Feedback: ${data.feedback}
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"BangBros Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: '💥 New BangBros Registration',
      text: output,
      attachments: file
        ? [{ filename: file.originalname, content: file.buffer }]
        : []
    });

    res.json({ message: 'success' });
  } catch (err) {
    console.error('Email Error:', err.message);
    res.status(500).json({ message: 'Email Failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
