import express from 'express';
import { clearAllClients } from '../clientManager.js';

const router = express.Router();

/* GET admin home. */
router.get('/', function(req, res, next) {
  res.send('Admin actions available.');
});

/* GET endpoint to kick all clients. */
router.get('/kick-all', function(req, res, next) {
  clearAllClients();
  res.send('All clients have been kicked.');
});

export default router;
