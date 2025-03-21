import express from "express";
import { checkAndCreatePromotion } from "../service/promotion_service.js";
import { getCustomerPromotions } from "../repositeries/promotion_repositery.js"
import { authenticateToken } from "../service/user_management_service.js";

const router = express.Router();


// Route to get all promotions for a specific customer
router.get("/:userId", authenticateToken (['customer']), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const promotions = await getCustomerPromotions(userId);
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to generate promotions for a customer based on purchases
router.post("/generate/:userId", authenticateToken(['customer']), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        await checkAndCreatePromotion(userId);
        res.json({ message: "Promotion checked and created if eligible" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
