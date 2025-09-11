import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, handlePaymentSuccess } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = await verifyWebhookSignature(body, signature)

    // checkout.session.completed イベントを処理
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const paymentData = await handlePaymentSuccess(session)
      
      const supabase = await createClient()
      
      // 購入記録を作成
      if (paymentData.productType === 'video') {
        await supabase
          .from('video_purchases')
          .insert({
            video_id: paymentData.productId,
            user_id: paymentData.userId,
            price_paid: paymentData.amount,
            status: 'active',
            payment_intent_id: paymentData.paymentIntentId,
            payment_method: 'stripe'
          })
      } else if (paymentData.productType === 'course') {
        await supabase
          .from('course_purchases')
          .insert({
            course_id: paymentData.productId,
            user_id: paymentData.userId,
            price_paid: paymentData.amount,
            status: 'active',
            payment_intent_id: paymentData.paymentIntentId,
            payment_method: 'stripe'
          })
      } else if (paymentData.productType === 'prompt') {
        await supabase
          .from('prompt_purchases')
          .insert({
            prompt_id: paymentData.productId,
            buyer_id: paymentData.userId,
            price: paymentData.amount,
            payment_method: 'stripe',
            transaction_id: paymentData.paymentIntentId
          })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}