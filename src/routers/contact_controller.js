import express from 'express';
import { saveContactMessage, getAllContactMessages } from '../service/contact_service.js';

const router = express.Router();

// POST: Save a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contactMessage = await saveContactMessage({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully', contactMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Retrieve all contact messages (for admin panel)
router.get('/', async (req, res) => {
  try {
    const messages = await getAllContactMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
