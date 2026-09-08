import nodemailer from 'nodemailer'

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

/** Prefer FRONTEND_URL; else first CLIENT_ORIGIN (non-localhost in production). */
export function getFrontendOrigin() {
  if (process.env.FRONTEND_URL?.trim()) {
    return process.env.FRONTEND_URL.trim().replace(/\/$/, '')
  }

  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(/,|\|\|/)
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)

  if (process.env.NODE_ENV === 'production') {
    const hosted = origins.find((o) => !/localhost|127\.0\.0\.1/i.test(o))
    if (hosted) return hosted
  }

  return origins[0] || 'http://localhost:5173'
}

function createTransport() {
  // Gmail app passwords are often copied with spaces — strip them
  const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '')
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass,
    },
  })
}

export async function sendPasswordResetEmail(to, resetUrl) {
  if (!isEmailConfigured()) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend .env')
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  const transporter = createTransport()

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your BudgetWise password',
    text: [
      'You requested a password reset for your BudgetWise account.',
      '',
      `Open this link to set a new password (valid for 1 hour):`,
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <p>You requested a password reset for your <strong>BudgetWise</strong> account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  })
}
