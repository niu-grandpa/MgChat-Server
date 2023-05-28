import express from 'express';
import path from 'path';

const viewsRouter = express.Router();

/* GET home page. */
viewsRouter.get('/', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export { viewsRouter };
