// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/submit-form", upload.single("picture"), async (req, res) => {
  const data = req.body;
  const file = req.file;

  try {
    const mailOptions = {
      from: `BangBros Form <${process.env.EMAIL_USER}>`,
      to: "bangbrosapprovalboards@gmail.com",
      subject: "New Registration Form Submission",
      html: `
        <h2>New User Submission</h2>
        <p><strong>Full Name:</strong> ${data.fullName}</p>
        <p><strong>Date of Birth:</strong> ${data.Date}</p>
        <p><strong>Age Group:</strong> ${data.age}</p>
        <p><strong>Gender:</strong> ${data.gender}</p>
        <p><strong>Interest:</strong> ${data.interests}</p>
        <p><strong>Payment Method:</strong> ${data.payment}</p>
        <p><strong>Feedback:</strong> ${data.feedback}</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `,
      attachments: file ? [
        {
          filename: file.originalname,
          path: file.path,
        },
      ] : [],
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Email Error:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
