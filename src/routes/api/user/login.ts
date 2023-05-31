import express from 'express';

const loginApi = express.Router();

loginApi.post('/login', async (req, res) => {});

loginApi.post('/login-with-phone');

export { loginApi };
