import Stripe from 'stripe';
import Booking from '../models/Booking.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Listen to correct event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.warn('🚨 No bookingId found in metadata');
      return response.status(400).json({ error: 'Invalid session metadata' });
    }

    // ✅ Mark booking as paid in database
    try {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: 'Stripe',
      });
      console.log(`✅ Booking ${bookingId} marked as paid`);
    } catch (err) {
      console.error(`❌ Failed to update booking:`, err.message);
    }
  } else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
};
