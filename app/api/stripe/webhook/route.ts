
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function sendOrderConfirmationEmail(session: Stripe.Checkout.Session) {
  const customer = session.customer as Stripe.Customer;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to: 'goddesshairandbodycare@gmail.com',
    subject: `New Order Confirmation: ${session.id}`,
    html: `
      <h1>New Order</h1>
      <p><strong>Order ID:</strong> ${session.id}</p>
      <p><strong>Customer:</strong> ${customer ? customer.name : 'Guest'}</p>
      <p><strong>Email:</strong> ${customer ? customer.email : 'N/A'}</p>
      <p><strong>Total:</strong> ${(session.amount_total! / 100).toFixed(2)}</p>
      <h2>Items</h2>
      <ul>
        ${lineItems.data.map((item) => `<li>${item.description} x${item.quantity} - $${(item.amount_total / 100).toFixed(2)}</li>`).join('')}
      </ul>
      <h2>Waiver</h2>
      <p><strong>Waiver Signed:</strong> ${session.metadata?.waiverSigned}</p>
      <p><strong>Waiver Signature:</strong> ${session.metadata?.waiverFirstName} ${session.metadata?.waiverLastName}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await sendOrderConfirmationEmail(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
