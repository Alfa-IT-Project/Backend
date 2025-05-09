import { Router } from 'express';
import RewardsService from '../service/rewards_service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();// Adjust the import based on your project structure
const router = Router();

// Create a new reward
router.post('/createReward', async (req, res) => {
    try {
        const reward = await RewardsService.createReward(req.body);
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all rewards
router.get('/all/rewards', async (req, res) => {
    try {
        const rewards = await RewardsService.getAllRewards();
        res.json(rewards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reward by ID
router.get('/reward/:id', async (req, res) => {
    try {
        const reward = await RewardsService.getRewardById(Number(req.params.id));
        res.json(reward);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Update reward
router.put('/updateReward/:id', async (req, res) => {
    try {
        const reward = await RewardsService.updateReward(Number(req.params.id), req.body);
        res.json(reward);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete reward
router.delete('/deleteReward/:id', async (req, res) => {
    try {
        const result = await RewardsService.deleteReward(Number(req.params.id));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Redeem points
router.post('/redeemPoints', async (req, res) => {
    const { userId, points } = req.body;
    try {
        const result = await RewardsService.redeemPoints(userId, points);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// routes/rewardRoutes.js or a dedicated tierRoutes.js
router.get('/tiers', async (req, res) => {
    try {
      const tiers = await prisma.tier.findMany();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tiers', error });
    }
  });
  
export default router;
