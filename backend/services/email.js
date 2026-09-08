import nodemailer from 'nodemailer'
import os from 'os'

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

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
  const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '')
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  const insecureTls =
    process.env.SMTP_INSECURE_TLS === 'true' ||
    (process.env.NODE_ENV !== 'production' && os.platform() === 'win32')

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER,
      pass,
    },
    family: process.env.SMTP_FAMILY === '4' ? 4 : undefined,
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: !insecureTls,
      servername: process.env.SMTP_HOST || 'smtp.gmail.com',
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 25000,
  })
}

export async function sendPasswordResetEmail(to, resetUrl) {
  if (!isEmailConfigured()) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend .env')
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  const transporter = createTransport()

  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'Reset your BudgetWise password',
      text: [
        'You requested a password reset for your BudgetWise account.',
        '',
        'Open this link to set a new password (valid for 1 hour):',
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
  } catch (err) {
    const hint =
      err.code === 'ESOCKET' || /certificate|socket/i.test(err.message)
        ? ' Tip: set SMTP_INSECURE_TLS=true in backend/.env for local Windows, restart with npm run dev, or use the on-screen reset link.'
        : ''
    err.message = `${err.code || 'SMTP'}: ${err.message}${hint}`
    throw err
  }
}
