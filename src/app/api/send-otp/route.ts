// instafitcore/src/app/api/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase-client';  // Adjust path if needed

export async function POST(request: NextRequest) {
  try {
    const { email, mode } = await request.json(); // mode: 'login' | 'register'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 4-digit OTP (digits only)
    const otp = otpGenerator.generate(4, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Store the OTP temporarily in Supabase
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Setup email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password recommended
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject:
        mode === 'register'
          ? 'Your 4-Digit Signup Code'
          : 'Your 4-Digit Login Code',
      text: `Your 4-digit code is: ${otp}. It expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in OTP API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
