// Updated server.js to fix "Date is not a constructor" issue
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Serve static files (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Form submission route
app.post('/submit-form', upload.single('picture'), async (req, res) => {
  try {
    const formData = req.body;
    const file = req.file;

    const mailOptions = {
      from: `Bangbros Form <${process.env.EMAIL_USER}>`,
      to: 'bangbrosapprovalboards@gmail.com',
      subject: 'New Bangbros Registration Submission',
      html: `
        <h2>New Registration Submission</h2>
        <p><strong>Full Name:</strong> ${formData.fullName}</p>
        <p><strong>DOB:</strong> ${formData.Date}</p>
        <p><strong>Age:</strong> ${formData.age}</p>
        <p><strong>Gender:</strong> ${formData.gender}</p>
        <p><strong>Payment Method:</strong> ${formData.payment}</p>
        <p><strong>Comments:</strong> ${formData.feedback}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `,
      attachments: file ? [
        {
          filename: file.originalname,
          path: file.path
        }
      ] : []
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('❌ Email Error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
