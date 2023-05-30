import { ResponseCode, ResponseMsg } from './types';

export function wrapperResult(data: any, status: ResponseCode) {
  const result = {
    code: status,
    msg: ResponseMsg[status!],
    data,
  };
  return result;
}

/**
 * 通过客户端生成的加密令牌解密手机号码
 */
export function endcodePhoneToken(token: string, code: string): string {
  /**
   * 令牌格式：
   * [手机末位][验证码][手机第2-3位][时间戳][手机第4-6位][两位随机数][手机第7-9位][两位随机数][手机第10位][手机首位]
   *
   * 解密规则：
   * [首尾调换][删除固定位验证码][不变][删除时间戳][不变][删除两位数][不变][删除两位数][不变]
   * 例：64893531685440050004025324131291 --> 15302541396
   */

  let result = '';

  result += token[token.length - 1];
  result += token.substring(code.length - 1, 7);
  result += token.substring(20, 23);
  result += token.substring(25, 28);
  result += token.substring(30, 31);
  result += token[0];

  return result;
}
