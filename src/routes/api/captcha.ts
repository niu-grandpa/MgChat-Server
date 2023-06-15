import { Router } from 'express';
import { useApiHandler } from '../../hooks';
import { ResponseCode } from '../../types';
import { wrapperResult } from '../../utils';

const captchaApi = Router();

captchaApi
  .post('/send', (request, response) => {
    const { phoneNumber } = request.body.data;
    // todo
  })
  .post('/verify', (request, response) => {
    useApiHandler({
      response,
      verifyCaptcha: request.body.data,
      middleware: [
        () => {
          response.status(200);
          response.send(wrapperResult(null, ResponseCode.SUCCESS));
        },
      ],
    });
  });

export default captchaApi;
