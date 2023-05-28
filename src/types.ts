import { ObjectId } from 'mongodb';

/**数据库表名 */
export type DbTables = 'data';

/** 展示客户端可通过接口查询的所有字段 */
export interface ClientQueryFields {
  _id: ObjectId;
  phoneNumber: number;
}

/** 接口调用后的状态码 */
export enum ResponseCode {
  SUCCESS = 0,
  FAIL = 1,
  EXPIRED = 2,
  EXISTED = 3,
  NONE = 4,
}

export enum ResponseMsg {
  SUCCESS = '操作成功',
  FAIL = '操作失败',
  EXPIRED = '已过期',
  EXISTED = '数据已存在',
  NONE = '未查询到相关数据',
}

/** 接口请求结果 */
export interface ResponseStatus<T> {
  code: ResponseCode;
  msg: string;
  data: T;
}

/**数据库表结构 */
export interface DbTableSructure {
  all_users: UserInfo[];
  all_groups: GroupInfo[];
  message_log: MessageLog;
}

/**用户信息 */
export interface UserInfo {
  uid: string;
  icon: string;
  city: string;
  age: number;
  level: number;
  gender: number;
  privilege: number;
  nickname: string;
  account: string;
  password: string;
  phoneNumber: string;
  friends: UserInfo[];
  groups: GroupInfo[];
  activeTime: number;
  registrationTime: number;
}

/**群组信息 */
export interface GroupInfo {
  gid: number;
  name: string;
  owner: UserInfo;
  member: UserInfo[];
  created: number;
}

/**消息记录 */
export type MessageLog = Record<
  string,
  Record<
    string,
    Array<{
      role: 'me' | 'other';
      content: string;
      images: string[];
      time: number;
    }>
  >
>;
