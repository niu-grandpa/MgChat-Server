import { DbMessage, DbUser } from './db';
import { ResponseCode, UserStatus } from './enum';

/** 展示客户端传递给api接口的所有参数字段 */
export interface ClientQueryFields {
  id: string;
  uid: string;
  password: string;
  code: string;
  who: string;
  cid: string;
  status: UserStatus;
  phoneNumber: string;
  withdraw: boolean;
  timeInfo: DbUser.UserInfo['timeInfo'];
  recordMsg: DbMessage.HistoryMessageType;
}

/** 接口请求结果 */
export interface ResponseStatus<T> {
  code: ResponseCode;
  msg: string;
  data: T;
}
