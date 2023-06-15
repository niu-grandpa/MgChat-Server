import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { ResponseCode, ResponseMsg } from './types';

export type JwtPayload = Partial<{
  uid: string;
  code: string;
  password: string;
  phoneNumber: string;
}>;

export function wrapperResult(data: any, status: ResponseCode) {
  const result = {
    code: status,
    msg: ResponseMsg[status!],
    data,
  };
  return result;
}

/**
 * JWT生成用户token
 *
 * 注意：桌面应用不存在通过url访问页面，因此token的作用在于登录验证
 *
 * @param key uid或phoneNumber
 */
export function jwtToken() {
  //密钥
  const SECRET_KEY = 'Z99w0t772r3h';

  return {
    set: (payload: JwtPayload) =>
      jwt.sign(payload, SECRET_KEY, {
        expiresIn: dayjs().add(1, 'month').valueOf(),
      }),

    verify: (
      token: string,
      callback?: jwt.VerifyCallback<string | jwt.JwtPayload> | undefined
    ) => jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] }, callback),

    decode: (token: string) => jwt.decode(token),
  };
}
