import Stripe from 'stripe'

// Stripeインスタンスの作成
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// 価格設定
export const PRICES = {
  video: {
    default: 500, // デフォルト価格（円）
  },
  course: {
    default: 2980,
  },
  prompt: {
    default: 300,
  },
}

// 商品タイプ
export type ProductType = 'video' | 'course' | 'prompt'

// Checkout Session作成用のパラメータ
export interface CreateCheckoutParams {
  productId: string
  productType: ProductType
  productName: string
  price: number
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

// Stripe Checkout Sessionを作成
export async function createCheckoutSession(params: CreateCheckoutParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: params.userEmail,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: params.productName,
              description: `${params.productType === 'video' ? '動画' : params.productType === 'course' ? 'コース' : 'プロンプト'}の購入`,
            },
            unit_amount: params.price,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        productId: params.productId,
        productType: params.productType,
        ...params.metadata,
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Webhookのシグネチャ検証
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
}

// 支払い成功時の処理
export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const { userId, productId, productType } = session.metadata!
  
  return {
    userId,
    productId,
    productType: productType as ProductType,
    amount: session.amount_total || 0,
    currency: session.currency,
    customerEmail: session.customer_email,
    paymentIntentId: session.payment_intent as string,
  }
}