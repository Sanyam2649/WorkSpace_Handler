const nodemailer = require("nodemailer");
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

// MAIN Function
async function sendMail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  // ✅ Step 1: Try SMTP First
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent via SMTP:", info.response);
    return { success: true, via: "SMTP", info };
  } catch (smtpError) {
    console.error("❌ SMTP failed:", smtpError.message);
  }

  // 🔄 Step 2: Fallback to Resend
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      throw error;
    }

    console.log("✅ Email sent via Resend:", data);
    return { success: true, via: "Resend", data };

  } catch (resendError) {
    console.error("🚨 Both SMTP & Resend Failed:", resendError.message);
    throw resendError;
  }
}

module.exports = sendMail;
