import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { AccountError, enforceRateLimit } from '@/lib/account-security';

const submissionSchema = z.object({
  from: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(100),
  subject: z.string().trim().min(1).max(200).refine(value => !/[\r\n]/.test(value)),
  message: z.string().trim().min(1).max(5000),
  recaptchaToken: z.string().max(4096).optional(),
}).strict();

// Lazily create the client so the module can load at build time without the key
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// Recipient email is stored server-side for privacy
const RECIPIENT_EMAIL = process.env.CONTACT_EMAIL;

// reCAPTCHA secret key for server-side verification
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    // If no secret key is configured, skip verification
    console.warn('RECAPTCHA_SECRET_KEY not configured, skipping captcha verification');
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    
    // For reCAPTCHA v3, check if score is above threshold (0.5 is recommended)
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
    const { from, name, subject, message, recaptchaToken } = parsed.data;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    await enforceRateLimit('contact-ip', ip, 20);
    await enforceRateLimit('contact-email', from.toLowerCase(), 10);

    // Verify reCAPTCHA
    if (RECAPTCHA_SECRET_KEY && !recaptchaToken) {
      return NextResponse.json({ error: 'Please complete the spam check and try again.' }, { status: 400 });
    }
    if (recaptchaToken && RECAPTCHA_SECRET_KEY) {
      const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidCaptcha) {
        return NextResponse.json(
          { error: 'Captcha verification failed' },
          { status: 400 }
        );
      }
    }

    // Check if recipient email is configured
    if (!RECIPIENT_EMAIL) {
      console.error('CONTACT_EMAIL not configured in environment variables');
      return NextResponse.json(
        { error: 'Contact email not configured' },
        { status: 500 }
      );
    }

    // Send email using Resend
    // Note: On free tier, you can only send to your own verified email
    const resend = getResendClient();
    if (!resend) {
      console.error('RESEND_API_KEY not configured in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [RECIPIENT_EMAIL],
      subject: subject,
      text: `Name: ${name}\nEmail: ${from}\nSubject: ${subject}\n\n${message}`,
      replyTo: from,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof AccountError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
