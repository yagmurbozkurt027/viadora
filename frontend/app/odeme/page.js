'use client';
import { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

// Stripe public key (test key)
// const stripePromise = loadStripe('pk_test_...'); // Gerçek key ile değiştirilecek

const CheckoutForm = ({ amount, onSuccess }) => {
  // const stripe = useStripe();
  // const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Stripe functionality temporarily disabled
    toast.info('Ödeme sistemi şu an aktif değil');
    setLoading(false);
    
    // if (!stripe || !elements) {
    //   return;
    // }

    // try {
    //   // Ödeme niyeti oluştur
    //   const response = await fetch('/api/payments/create-payment-intent', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       amount: amount,
    //       currency: 'try'
    //     }),
    //   });

    //   const { clientSecret } = await response.json();

    //   // Ödemeyi onayla
    //   const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    //     payment_method: {
    //       card: elements.getElement(CardElement),
    //     }
    //   });

    //   if (paymentError) {
    //     setError(paymentError.message);
    //     toast.error('Ödeme başarısız: ' + paymentError.message);
    //   } else {
    //     toast.success('Ödeme başarıyla tamamlandı!');
    //     onSuccess(paymentIntent);
    //   }
    // } catch (err) {
    //   setError('Ödeme işlemi sırasında bir hata oluştu');
    //   toast.error('Ödeme işlemi sırasında bir hata oluştu');
    // } finally {
    //   setLoading(false);
    // }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💳 Kredi Kartı Bilgileri</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kart Bilgileri
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <p className="text-gray-500">Ödeme sistemi şu an aktif değil</p>
            {/* <CardElement options={cardElementOptions} /> */}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'İşleniyor...' : 'Ödeme Yap'}
        </button>
      </div>
    </form>
  );
};

export default function OdemePage() {
  const [amount, setAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderData, setOrderData] = useState({
    items: [],
    total: 0
  });

  useEffect(() => {
    // Basit test verileri
    const testItems = [
      { productId: '1', name: 'Test Ürün', quantity: 1, price: 100 }
    ];
    
    setOrderData({
      items: testItems,
      total: 100
    });
    setAmount(100);
  }, []);

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Sipariş oluştur
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          orderData: {
            userId: localStorage.getItem('userId'),
            items: orderData.items,
            total: amount,
            shippingAddress: {
              firstName: localStorage.getItem('username') || 'Test',
              lastName: 'Kullanıcı',
              email: localStorage.getItem('email') || 'test@example.com',
              phone: '0555 123 45 67',
              address: 'Test Adres',
              city: 'İstanbul',
              postalCode: '34000'
            },
            billingAddress: {
              firstName: localStorage.getItem('username') || 'Test',
              lastName: 'Kullanıcı',
              email: localStorage.getItem('email') || 'test@example.com',
              phone: '0555 123 45 67',
              address: 'Test Adres',
              city: 'İstanbul',
              postalCode: '34000'
            }
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentSuccess(true);
        toast.success('Sipariş başarıyla oluşturuldu!');
      }
    } catch (err) {
      toast.error('Sipariş oluşturulurken hata oluştu');
    }
  };



  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Ödeme Başarılı!</h1>
            <p className="text-gray-600 mb-6">
              Siparişiniz başarıyla oluşturuldu. Sipariş takibi için e-posta adresinizi kontrol edin.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">💳 Güvenli Ödeme</h1>
          <p className="text-gray-600">Kredi kartı bilgilerinizi güvenle girin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ödeme Formu */}
          <div>
            {/* <Elements stripe={stripePromise}> */}
              <CheckoutForm 
                amount={amount} 
                onSuccess={handlePaymentSuccess}
              />
            {/* </Elements> */}
          </div>

          {/* Sipariş Özeti */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
            <h3 className="text-lg font-semibold mb-4">📋 Sipariş Özeti</h3>
            
            <div className="space-y-3 mb-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₺{item.price}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Toplam:</span>
                <span>₺{amount}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-800 mb-2">🔒 Güvenli Ödeme</h4>
              <p className="text-sm text-blue-700">
                Kredi kartı bilgileriniz SSL ile şifrelenir ve güvenle saklanır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 