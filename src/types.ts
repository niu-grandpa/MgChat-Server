/**数据库表名 */
export type DbTables = 'USERS';

/** 展示客户端可通过接口查询的所有字段 */
export interface ClientQueryFields {
  uid: number;
}

/** 接口请求返回的状态码 */
export enum ResponseCode {
  SUCCESS = 0,
  FAIL = 1,
  EXPIRED = 2,
}

/** 接口请求结果 */
export interface ResponseStatus<T> {
  code: ResponseCode;
  msg: string;
  data: T;
}
