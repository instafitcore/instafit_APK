import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {
            email,
            name,
            service,
            date,
            time,
            amount,
            orderId,
        } = await req.json();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Insta Fit Core" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Your Insta Fit Core Booking Has Been Confirmed`,
            html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color:#16a34a;">Booking Confirmed 🎉</h2>

    <p>Dear <strong>${name}</strong>,</p>

    <p>
      We are happy to inform you that your booking with
      <strong>Insta Fit Core</strong> has been successfully confirmed.
      Thank you for choosing our services.
    </p>

    <p><strong>Booking Details:</strong></p>

    <table style="border-collapse: collapse;">
      <tr>
        <td style="padding:6px 12px;"><strong>Service</strong></td>
        <td style="padding:6px 12px;">${service}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;"><strong>Date</strong></td>
        <td style="padding:6px 12px;">${date}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;"><strong>Time</strong></td>
        <td style="padding:6px 12px;">${time}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;"><strong>Amount Paid</strong></td>
        <td style="padding:6px 12px;">₹${amount}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;"><strong>Order ID</strong></td>
        <td style="padding:6px 12px;">${orderId}</td>
      </tr>
    </table>

    <p>
      Please keep this email for your reference. If you have any questions
      or require further assistance, feel free to contact us.
    </p>

    <p>
      We look forward to serving you and supporting you on your fitness journey.
    </p>

    <p>
      Warm regards,<br/>
      <strong>Insta Fit Core Team</strong><br/>
      📧 instafitcore@gmail.com
    </p>
  </div>
`,

        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
