import express from 'express';
import { getConnectedClients } from '../clientManager.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getConnectedClients());
});

export default router;
