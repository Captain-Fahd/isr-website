import { Request, Response } from 'express';
import { Resend } from 'resend';

const ISR_EMAIL = 'isr@rmit.edu.au';

export async function sendContactEmail(req: Request, res: Response) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_ADDRESS;

  if (!apiKey || !fromAddress) {
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'name, email, subject, and message are all required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  const resend = new Resend(apiKey);

  const inboundHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `;

  const confirmationHtml = `
    <h2>We've received your message</h2>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thank you for reaching out to the Islamic Society of RMIT (ISR). We've received your message and will get back to you as soon as possible.</p>
    <hr />
    <p><strong>Your message:</strong></p>
    <blockquote>${escapeHtml(message).replace(/\n/g, '<br />')}</blockquote>
    <p>Warm regards,<br />ISR Team</p>
  `;

  try {
    const [inbound, confirmation] = await Promise.all([
      resend.emails.send({
        from: fromAddress,
        to: [ISR_EMAIL],
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        html: inboundHtml,
      }),
      resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: `We've received your message — ISR`,
        html: confirmationHtml,
      }),
    ]);

    if (inbound.error || confirmation.error) {
      const err = inbound.error ?? confirmation.error;
      console.error('Resend error:', err);
      res.status(502).json({ error: 'Failed to send email' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(502).json({ error: 'Failed to send email' });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
