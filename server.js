const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const siteDir = path.join(__dirname, 'aco-liff-medical-website');
const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'kevinmokaya001@gmail.com';

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(siteDir));

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP credentials are missing. Set SMTP_USER and SMTP_PASS in your environment.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

app.post('/api/contact', async (req, res) => {
  try {
    const {
      name = '',
      organization = '',
      email = '',
      phone = '',
      category = '',
      urgency = '',
      message = ''
    } = req.body || {};

    if (!name.trim() || !email.trim() || !phone.trim() || !category.trim() || !message.trim()) {
      return res.status(400).json({
        error: 'Please include your name, email, phone, primary interest, and message before submitting.'
      });
    }

    const transporter = createTransporter();
    const subject = `Aco Liff Medical Supplies inquiry from ${name.trim()}`;

    const text = [
      'New contact form submission from the Aco Liff Medical Supplies website.',
      '',
      `Full name: ${name || '-'}`,
      `Organization: ${organization || '-'}`,
      `Email: ${email || '-'}`,
      `Phone: ${phone || '-'}`,
      `Primary interest: ${category || '-'}`,
      `Timeline: ${urgency || '-'}`,
      '',
      'Project details:',
      message || '-'
    ].join('\n');

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #10213d; line-height: 1.6;">
        <h2 style="margin: 0 0 16px; font-size: 20px;">New Aco Liff Medical Supplies inquiry</h2>
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
          <tr><td style="padding: 8px 0; width: 160px; font-weight: 700;">Full name</td><td style="padding: 8px 0;">${escapeHtml(name) || '-'}</td></tr>
          <tr><td style="padding: 8px 0; width: 160px; font-weight: 700;">Organization</td><td style="padding: 8px 0;">${escapeHtml(organization) || '-'}</td></tr>
          <tr><td style="padding: 8px 0; width: 160px; font-weight: 700;">Email</td><td style="padding: 8px 0;">${escapeHtml(email) || '-'}</td></tr>
          <tr><td style="padding: 8px 0; width: 160px; font-weight: 700;">Phone</td><td style="padding: 8px 0;">${escapeHtml(phone) || '-'}</td></tr>
          <tr><td style="padding: 8px 0; width: 160px; font-weight: 700;">Primary interest</td><td style="padding: 8px 0;">${escapeHtml(category) || '-'}</td></tr>
          <tr><td style="padding: 8px 0; width: 160px; font-weight: 700;">Timeline</td><td style="padding: 8px 0;">${escapeHtml(urgency) || '-'}</td></tr>
        </table>
        <div style="padding: 16px; border: 1px solid #d8e4f6; border-radius: 12px; background: #f8fbff;">
          <div style="font-weight: 700; margin-bottom: 8px;">Project details</div>
          <div>${escapeHtml(message).replace(/\n/g, '<br />')}</div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `Aco Liff Medical Supplies <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      replyTo: email || process.env.SMTP_USER,
      subject,
      text,
      html
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact form send error:', error);
    return res.status(500).json({
      error: 'We could not send your message right now. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Aco Liff site running at http://localhost:${PORT}`);
});
