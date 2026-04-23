import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for contact messages (replace with database in production)
const contactSubmissions: Array<{
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}> = [];

// Validation functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^(0[5-7]\d{8}|0[8-9]\d{8})$/.test(phone.replace(/\s/g, ''));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!name || name.trim().length < 2) {
      errors.name = ['Le nom doit contenir au moins 2 caractères'];
    }

    if (!email || !validateEmail(email)) {
      errors.email = ['Adresse email invalide'];
    }

    if (!phone || !validatePhone(phone)) {
      errors.phone = ['Numéro de téléphone invalide (ex: 0612345678)'];
    }

    if (!message || message.trim().length < 10) {
      errors.message = ['Le message doit contenir au moins 10 caractères'];
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 422 }
      );
    }

    // Create submission
    const submission = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.replace(/\s/g, ''),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    // Store submission (in production, save to database)
    contactSubmissions.push(submission);

    // Log for development
    console.log('📧 New Contact Form Submission:', submission);

    // TODO: Send email notification (use SendGrid, AWS SES, etc. in production)
    // await sendEmailNotification(submission);

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: {
        id: submission.id,
        createdAt: submission.createdAt,
      },
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

// GET endpoint to view submissions (admin only - add auth in production)
export async function GET() {
  // In production, add authentication check here
  return NextResponse.json({
    success: true,
    data: contactSubmissions,
    count: contactSubmissions.length,
  });
}
