import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // your DB insert code here
    const booking = await prisma.booking.create({
      data: {
        userId: body.userId,
        amount: body.amount,
        paymentId: body.paymentId,
      },
    });

    return new Response(JSON.stringify({ success: true, booking }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Booking insert failed"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
