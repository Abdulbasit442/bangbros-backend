// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

app.post('/submit-form', upload.single('picture'), async (req, res) => {
  console.log('🔥 Form submission received');

  try {
    const data = req.body;
    const file = req.file;

    const emailBody = `
      Full Name: ${data.fullName}
      Date of Birth: ${data.Date}
      Age Group: ${data.age}
      Gender: ${data.gender}
      Payment Method: ${data.payment}
      Comments: ${data.feedback}
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'bangbrosapprovalboards@gmail.com',
      subject: 'New BangBros Registration Submission',
      text: emailBody,
      attachments: file
        ? [
            {
              filename: file.originalname,
              path: path.join(__dirname, file.path),
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');

    // Clean up uploaded file
    if (file) fs.unlinkSync(path.join(__dirname, file.path));

    res.json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error('❌ Email Error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
