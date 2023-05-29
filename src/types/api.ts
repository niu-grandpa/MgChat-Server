import { ResponseCode } from 'enum';

/** 展示客户端可通过接口查询的所有字段 */
export interface ClientQueryFields {
  account: string;
  phoneNumber: number;
}

/** 接口请求结果 */
export interface ResponseStatus<T> {
  code: ResponseCode;
  msg: string;
  data: T;
}

export type TableProps = 'allUsers' | 'allGroups' | 'messageHistory';
