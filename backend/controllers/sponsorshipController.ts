import { Request, Response } from 'express';
import { Resend } from 'resend';
import { shouldMockExternals } from '../lib/mockPayloads';

const ISR_EMAIL = 'isr@rmit.edu.au';

export async function sendSponsorshipEnquiry(req: Request, res: Response) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_ADDRESS;

  if (!apiKey || !fromAddress) {
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  const { name, email, phone, businessType, businessName, message } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    businessName?: string;
    message?: string;
  };

  if (
    !name?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !businessType?.trim() ||
    !businessName?.trim() ||
    !message?.trim()
  ) {
    res.status(400).json({
      error:
        'name, email, phone, businessType, businessName, and message are all required',
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  // Accepts international formats: digits, spaces, dashes, dots, brackets, leading +.
  const phoneRegex = /^\+?[\d\s().-]{6,20}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ error: 'Invalid phone number' });
    return;
  }

  if (shouldMockExternals()) {
    res.status(200).json({ success: true });
    return;
  }

  const resend = new Resend(apiKey);

  const inboundHtml = `
    <h2>New Sponsorship Enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Business Name:</strong> ${escapeHtml(businessName)}</p>
    <p><strong>Business Type:</strong> ${escapeHtml(businessType)}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `;

  const confirmationHtml = `
    <h2>We've received your sponsorship enquiry</h2>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thank you for your interest in partnering with the Islamic Society of RMIT (ISR). We've received your enquiry on behalf of ${escapeHtml(businessName)} and our team will be in touch shortly.</p>
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
        subject: `[Sponsorship] ${businessName}`,
        html: inboundHtml,
      }),
      resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: `We've received your sponsorship enquiry — ISR`,
        html: confirmationHtml,
      }),
    ]);

    if (inbound.error) {
      console.error('Resend inbound error:', inbound.error);
      res.status(502).json({ error: 'Failed to send email' });
      return;
    }

    if (confirmation.error) {
      console.warn('Resend confirmation error (non-fatal):', confirmation.error);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Sponsorship form error:', err);
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
