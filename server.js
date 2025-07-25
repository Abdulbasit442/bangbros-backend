require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static upload directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// POST route to handle form submission
app.post('/submit-form', upload.single('picture'), async (req, res) => {
  try {
    const formData = req.body;
    const file = req.file;

    let emailBody = '<h2>New Registration Form Submission</h2><ul>';
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        emailBody += `<li><strong>${key}:</strong> ${formData[key].join(', ')}</li>`;
      } else {
        emailBody += `<li><strong>${key}:</strong> ${formData[key]}</li>`;
      }
    }
    emailBody += '</ul>';

    if (file) {
      emailBody += `<p><strong>Picture:</strong> Attached</p>`;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'bangbrosapprovalboards@gmail.com',
      subject: 'New BangBros Registration Submission',
      html: emailBody,
      attachments: file
        ? [
            {
              filename: file.originalname,
              path: file.path,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Email Error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
