const express = require('express');
const router = express.Router();
const {
  getUserGamification,
  addPoints,
  updateTaskProgress,
  getLeaderboard,
  getUserBadges
} = require('../controllers/gamificationController');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../middleware/validation');
const log = require('../utils/logger');

/**
 * @swagger
 * /api/gamification/{userId}:
 *   get:
 *     summary: Kullanıcının gamification bilgilerini getir
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Gamification bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *                 level:
 *                   type: string
 *                 nextLevel:
 *                   type: string
 *                 progressToNextLevel:
 *                   type: number
 *                 experience:
 *                   type: number
 *                 badges:
 *                   type: array
 *                 dailyTasks:
 *                   type: array
 *                 statistics:
 *                   type: object
 */
router.get('/:userId', sanitizeInput, asyncHandler(getUserGamification));

/**
 * @swagger
 * /api/gamification/{userId}/points:
 *   post:
 *     summary: Kullanıcıya puan ekle
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *               - reason
 *             properties:
 *               points:
 *                 type: number
 *                 description: Eklenecek puan miktarı
 *               reason:
 *                 type: string
 *                 description: Puan ekleme sebebi
 *     responses:
 *       200:
 *         description: Puan başarıyla eklendi
 */
router.post('/:userId/points', sanitizeInput, asyncHandler(addPoints));

/**
 * @swagger
 * /api/gamification/{userId}/tasks:
 *   put:
 *     summary: Görev ilerlemesini güncelle
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - progress
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: Görev ID
 *               progress:
 *                 type: number
 *                 description: İlerleme miktarı
 *     responses:
 *       200:
 *         description: Görev ilerlemesi güncellendi
 */
router.put('/:userId/tasks', sanitizeInput, asyncHandler(updateTaskProgress));

/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: Liderlik tablosunu getir
 *     tags: [Gamification]
 *     responses:
 *       200:
 *         description: Liderlik tablosu başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rank:
 *                     type: number
 *                   username:
 *                     type: string
 *                   points:
 *                     type: number
 *                   level:
 *                     type: string
 *                   totalPurchases:
 *                     type: number
 *                   totalSpent:
 *                     type: number
 */
router.get('/leaderboard', sanitizeInput, asyncHandler(getLeaderboard));

/**
 * @swagger
 * /api/gamification/{userId}/badges:
 *   get:
 *     summary: Kullanıcının rozetlerini getir
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Rozetler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   earned:
 *                     type: boolean
 *                   earnedAt:
 *                     type: string
 *                     format: date-time
 *                   progress:
 *                     type: number
 *                   maxProgress:
 *                     type: number
 *                   completed:
 *                     type: boolean
 */
router.get('/:userId/badges', sanitizeInput, asyncHandler(getUserBadges));

module.exports = router; 