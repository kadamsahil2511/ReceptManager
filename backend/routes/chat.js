import express from 'express';
import { chat, quickAction } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', chat);
router.post('/quick-action', quickAction);

export default router;
