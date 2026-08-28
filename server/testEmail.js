const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


transporter.verify((error, success) => {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  if (error) {
    console.log("❌ App Password / Gmail SMTP Error:");
    console.log(error.message);
  } else {
    console.log("✅ Gmail App Password is correct!");
    console.log("SMTP connection successful.");
  }
});