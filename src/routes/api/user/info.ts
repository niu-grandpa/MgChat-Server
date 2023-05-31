import express from 'express';

const infoApi = express.Router();

infoApi.get('/info', async (req, res) => {});

export { infoApi };
