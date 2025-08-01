const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validation');
const log = require('../utils/logger');

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Ödeme niyeti oluştur
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Ödeme tutarı (kuruş cinsinden)
 *               currency:
 *                 type: string
 *                 description: Para birimi (TRY)
 *     responses:
 *       200:
 *         description: Ödeme niyeti başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/create-payment-intent', 
  sanitizeInput,
  asyncHandler(async (req, res) => {
    try {
      const { amount, currency = 'try' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Geçerli bir tutar gerekli' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe kuruş cinsinden çalışır
        currency: currency.toLowerCase(),
        metadata: {
          integration_check: 'accept_a_payment'
        }
      });

      log.info('Payment intent created', { 
        amount, 
        currency, 
        paymentIntentId: paymentIntent.id 
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (err) {
      log.error('Payment intent creation failed', { error: err.message });
      res.status(500).json({ error: 'Ödeme niyeti oluşturulamadı' });
    }
  })
);

/**
 * @swagger
 * /api/payments/confirm-payment:
 *   post:
 *     summary: Ödemeyi onayla ve sipariş oluştur
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *               - orderData
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               orderData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Ödeme başarıyla onaylandı
 *       400:
 *         description: Ödeme başarısız
 */
router.post('/confirm-payment',
  sanitizeInput,
  asyncHandler(async (req, res) => {
    try {
      const { paymentIntentId, orderData } = req.body;

      // Ödeme durumunu kontrol et
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Ödeme henüz tamamlanmadı' });
      }

      // Sipariş oluştur
      const order = new Order({
        userId: orderData.userId,
        items: orderData.items,
        total: orderData.total,
        status: 'paid',
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntentId,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress
      });

      await order.save();

      log.info('Payment confirmed and order created', {
        orderId: order._id,
        paymentIntentId,
        amount: order.total
      });

      res.json({
        success: true,
        orderId: order._id,
        message: 'Ödeme başarıyla tamamlandı'
      });
    } catch (err) {
      log.error('Payment confirmation failed', { error: err.message });
      res.status(500).json({ error: 'Ödeme onaylanamadı' });
    }
  })
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook başarıyla işlendi
 */
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      log.error('Webhook signature verification failed', { error: err.message });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        log.info('Payment succeeded', { paymentIntentId: paymentIntent.id });
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        log.warn('Payment failed', { paymentIntentId: failedPayment.id });
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  })
);

/**
 * @swagger
 * /api/payments/orders/{orderId}:
 *   get:
 *     summary: Sipariş detaylarını getir
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sipariş detayları
 *       404:
 *         description: Sipariş bulunamadı
 */
router.get('/orders/:orderId',
  asyncHandler(async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId)
        .populate('userId', 'username email')
        .populate('items.productId', 'name price image');

      if (!order) {
        return res.status(404).json({ error: 'Sipariş bulunamadı' });
      }

      res.json(order);
    } catch (err) {
      log.error('Order retrieval failed', { error: err.message });
      res.status(500).json({ error: 'Sipariş bilgileri alınamadı' });
    }
  })
);

/**
 * @swagger
 * /api/payments/orders:
 *   get:
 *     summary: Kullanıcının siparişlerini getir
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcının siparişleri
 */
router.get('/orders',
  asyncHandler(async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'Kullanıcı ID gerekli' });
      }

      const orders = await Order.find({ userId })
        .populate('items.productId', 'name price image')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (err) {
      log.error('Orders retrieval failed', { error: err.message });
      res.status(500).json({ error: 'Siparişler alınamadı' });
    }
  })
);

module.exports = router; 