import { Router } from 'express';
import { AliyunCaptchaClient } from '../../../core';
import { useApiHandler, useDbCrud } from '../../../hooks';
import {
  CaptchaCollection,
  CollectionName,
  ResponseCode,
} from '../../../types';
import { wrapperResult } from '../../../utils';

const { read, update, create } = useDbCrud();
const captchaApi = Router();

captchaApi
  .post('/send', async (request, response) => {
    const { phoneNumber } = request.body.data;

    // 验证码默认取当前时间戳后6位
    let code = (Date.now() % 1000000) + '';

    useApiHandler({
      response,
      middleware: [
        async () => {
          // 随机生成与数据库中所有未过期的验证码不同的数字
          const list = (await read(
            { table: CollectionName.CAPTCHAS },
            'findAll'
          )) as CaptchaCollection[];

          const set = new Set(list.map(item => item.code));
          while (set.has(code)) {
            code = ~~(Math.random() * 900000) + 100000 + '';
          }
        },
        async () => {
          // 调用阿里云短信服务发验证码
          try {
            const { body } = await AliyunCaptchaClient.main({
              phoneNumber,
              code,
            });
            if (body.message === '只能向已回复授权信息的手机号发送') {
              response.send(wrapperResult(null, ResponseCode.NOT_PERMISSION));
              return false;
            }
            response.send(wrapperResult(code, ResponseCode.SUCCESS));
          } catch (err) {
            response.status(500);
            response.send(wrapperResult(err, ResponseCode.ERROR));
          }
        },
        async () => {
          // 验证码存入数据库
          await create({
            table: CollectionName.CAPTCHAS,
            newData: { createdAt: new Date(), code, phoneNumber },
          });
        },
      ],
    });
  })
  /**
   * 检查验证码有效性
   */
  .post('/verify', (request, response) => {
    useApiHandler({
      response,
      required: {
        target: request.body.data,
        must: ['phoneNumber', 'code'],
      },
      verifyCaptcha: request.body.data,
      middleware: [
        () => {
          response.send(wrapperResult(true, ResponseCode.SUCCESS));
        },
      ],
    });
  });

export default captchaApi;
