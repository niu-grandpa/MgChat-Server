import jwt from 'jsonwebtoken';
import { PWD_SECRET_KEY, SECRET_KEY } from './private';
import { ResponseCode, ResponseMsg } from './types';

export const wrapperResult = (data: any, status: ResponseCode) => {
  const result = {
    code: status,
    msg: ResponseMsg[status!],
    data,
  };
  return result;
};

export const signData = (
  payload: any,
  key?: 'password',
  expiresIn?: string | number
) => {
  const token = jwt.sign(
    payload,
    key === 'password' ? PWD_SECRET_KEY : SECRET_KEY,
    { expiresIn }
  );
  return token;
};

export const verifyToken = <T>(token: string, key?: 'password') => {
  let res: T | null = null;
  jwt.verify(
    token,
    key === 'password' ? PWD_SECRET_KEY : SECRET_KEY,
    (err, decoded) => {
      if (err) {
        console.log('JWT验证失败:', err);
        return;
      }
      res = decoded as T;
    }
  );
  return res;
};

export function createHash() {
  //产生一个hash值，只有数字，规则和java的hashcode规则相同
  const getHashCode = (str: string) => {
    const BASE_HASH = 1013;
    const HASH_CODE = 5381;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = BASE_HASH * hash + str.charCodeAt(i);
      if (hash > HASH_CODE - 1) hash %= HASH_CODE; //java int溢出则取模
    }
    return hash;
  };

  const arr = Array<string>(62);
  let range = 0;
  let str = '';

  //时间戳来自客户端，精确到毫秒，但仍旧有可能在在多线程下有并发，
  //尤其hash化后，毫秒数前面的几位都不变化，导致不同日期hash化的值有可能存在相同，
  //因此使用下面的随机数函数，在时间戳上加随机数，保证hash化的结果差异会比较大
  /*
   ** randomWord 产生任意长度随机字母数字组合
   ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
   ** 用法  randomWord(false,6);规定位数 flash
   ** randomWord(true,3，6);长度不定，true
   ** arr变量可以把其他字符加入，如以后需要小写字母，直接加入即可
   */
  const randomWord = (min: number, max: number) => {
    if (!arr[0]) {
      let idx = 0;
      for (let i = 97; i <= 122; i++) {
        arr[idx++] = String.fromCharCode(i);
      }
      for (let i = 65; i <= 90; i++) {
        arr[idx++] = String.fromCharCode(i);
      }
      for (let i = 48; i <= 57; i++) {
        arr[idx++] = String.fromCharCode(i);
      }
    }
    str = '';
    // 随机产生
    range = ~~(Math.random() * (max - min)) + min;
    for (let i = 0; i < range; i++) {
      const pos = ~~(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  };

  return () => {
    //定义一个时间戳，计算与1970年相差的毫秒数  用来获得唯一时间
    const timestamp = new Date().valueOf();
    const myRandom = randomWord(16, 24);
    const hashcode = getHashCode(myRandom + timestamp.toString());
    return `${myRandom}${hashcode}`;
  };
}
