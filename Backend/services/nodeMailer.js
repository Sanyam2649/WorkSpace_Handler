const nodemailer = require("nodemailer");
require("dotenv").config();

// Create transporter
const transporter = nodemailer.createTransport({
  // service: "gmail",
  host : process.env.SMTP_HOST || "smtp.gmail.com",
   port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Function to send mail
async function sendMail(to, subject, text, html) {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_USER}`,
      to,
      subject,
      text,
      html,
    };
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = sendMail;
