import { DbMessage, DbUser } from './db';
import { ResponseCode, UserStatus } from './enum';

/** 展示客户端传递给api接口的所有参数字段 */
export interface ClientQueryFields {
  id: string;
  account: string;
  password: string;
  code: string;
  phoneToken: string;
  status: UserStatus;
  phoneNumber: number;
  timeInfo: DbUser.UserInfo['timeInfo'];
  recordMsg: {
    who: string;
    data: DbMessage.HistoryMessageType;
  };
}

/** 接口请求结果 */
export interface ResponseStatus<T> {
  code: ResponseCode;
  msg: string;
  data: T;
}
