import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { subscription, userId } = await request.json();
    
    // Backend'e subscription'ı gönder
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription, userId })
    });

    if (!response.ok) {
      throw new Error('Subscription kaydedilemedi');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json({ error: 'Subscription kaydedilemedi' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { subscription, userId } = await request.json();
    
    // Backend'den subscription'ı kaldır
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription, userId })
    });

    if (!response.ok) {
      throw new Error('Subscription kaldırılamadı');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json({ error: 'Subscription kaldırılamadı' }, { status: 500 });
  }
} 