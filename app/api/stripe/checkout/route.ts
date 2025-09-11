import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe'

// 決済ログテーブルの作成（データベースに記録）
async function logPaymentAttempt(
  supabase: any,
  userId: string,
  productId: string,
  productType: string,
  status: 'initiated' | 'success' | 'failed' | 'cancelled',
  error?: string
) {
  try {
    await supabase
      .from('payment_logs')
      .insert({
        user_id: userId,
        product_id: productId,
        product_type: productType,
        status,
        error_message: error,
        created_at: new Date().toISOString()
      })
  } catch (err) {
    console.error('Failed to log payment attempt:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, productType, productName, price } = body

    // 既に購入済みかチェック
    let existingPurchase = null
    
    if (productType === 'video') {
      // 動画の購入チェック
      const { data: videoPurchase } = await supabase
        .from('video_purchases')
        .select('*')
        .eq('video_id', productId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      existingPurchase = videoPurchase

      // コースに含まれている動画かチェック
      if (!existingPurchase) {
        const { data: courseVideo } = await supabase
          .from('course_videos')
          .select(`
            course_id,
            courses!inner(
              id,
              title,
              course_purchases!inner(
                user_id,
                status
              )
            )
          `)
          .eq('video_id', productId)
          .eq('courses.course_purchases.user_id', user.id)
          .eq('courses.course_purchases.status', 'active')
          .single()

        if (courseVideo) {
          return NextResponse.json({
            error: 'already_purchased_in_course',
            message: `この動画は既に購入済みのコース「${courseVideo.courses.title}」に含まれています。`,
            courseId: courseVideo.course_id,
            courseTitle: courseVideo.courses.title
          }, { status: 400 })
        }
      }
    } else if (productType === 'course') {
      const { data } = await supabase
        .from('course_purchases')
        .select('*')
        .eq('course_id', productId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      existingPurchase = data
    } else if (productType === 'prompt') {
      const { data } = await supabase
        .from('prompt_purchases')
        .select('*')
        .eq('prompt_id', productId)
        .eq('buyer_id', user.id)
        .single()
      
      existingPurchase = data
    }

    if (existingPurchase) {
      return NextResponse.json({
        error: 'already_purchased',
        message: 'この商品は既に購入済みです。'
      }, { status: 400 })
    }

    // 無料の場合は直接購入記録を作成
    if (price === 0) {
      if (productType === 'video') {
        await supabase
          .from('video_purchases')
          .insert({
            video_id: productId,
            user_id: user.id,
            price_paid: 0,
            status: 'active',
            payment_method: 'free'
          })
      } else if (productType === 'course') {
        await supabase
          .from('course_purchases')
          .insert({
            course_id: productId,
            user_id: user.id,
            price_paid: 0,
            status: 'active',
            payment_method: 'free'
          })
      } else if (productType === 'prompt') {
        await supabase
          .from('prompt_purchases')
          .insert({
            prompt_id: productId,
            buyer_id: user.id,
            price: 0,
            payment_method: 'free'
          })
      }

      return NextResponse.json({ 
        success: true, 
        free: true,
        redirectUrl: `/${productType}/${productId}`
      })
    }

    // 決済開始をログに記録
    await logPaymentAttempt(supabase, user.id, productId, productType, 'initiated')

    // Stripe Checkout Sessionを作成
    const origin = request.headers.get('origin') || ''
    const session = await createCheckoutSession({
      productId,
      productType,
      productName,
      price,
      userId: user.id,
      userEmail: user.email!,
      successUrl: `${origin}/${productType}/${productId}?purchase=success`,
      cancelUrl: `${origin}/${productType}/${productId}?purchase=cancelled`,
    })

    return NextResponse.json({ 
      sessionId: session.sessionId,
      url: session.url 
    })
  } catch (error) {
    console.error('Checkout error:', error)
    
    // エラーをログに記録
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const body = await request.json().catch(() => ({}))
      await logPaymentAttempt(
        supabase,
        user.id,
        body.productId || 'unknown',
        body.productType || 'unknown',
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}