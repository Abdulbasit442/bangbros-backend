const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS: allow only your Vercel frontend
app.use(cors({
  origin: 'https://bangbros-frontend-jui8.vercel.app',
  methods: ['POST'],
  credentials: false
}));

// ✅ To parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Multer config for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// ✅ Email handler
app.post('/submit-form', upload.single('picture'), async (req, res) => {
  try {
    const {
      fullName,
      Date,
      age,
      gender,
      feedback,
      payment
    } = req.body;

    const file = req.file;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,       // e.g. bangbrosapprovalboards@gmail.com
        pass: process.env.GMAIL_APP_PASS    // Gmail App Password
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: 'New BangBros Form Submission',
      html: `
        <h2>New Application Received</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>DOB:</strong> ${Date}</p>
        <p><strong>Age Group:</strong> ${age}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Payment Method:</strong> ${payment}</p>
        <p><strong>Comment:</strong> ${feedback}</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `,
      attachments: file ? [{
        filename: file.originalname,
        path: file.path
      }] : []
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: '✅ Form submitted successfully!' });
  } catch (err) {
    console.error('❌ Email Error:', err.message);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// ✅ Health check route for Render
app.get('/', (req, res) => {
  res.json({ message: 'Server is live ✅' });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
