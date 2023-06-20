import { ObjectId } from 'mongodb';
import { MessageRole, UserStatus } from './enum';

export type DbUser = {
  _id: ObjectId;
  icon: string;
  city: string;
  age: number;
  token: string;
  status: UserStatus;
  level: number;
  gender: number;
  credit: number;
  privilege: number;
  upgradeDays: number;
  nickname: string;
  uid: string;
  password: string;
  phoneNumber: string;
  friends: DbUser[];
  groups: DbGroup[];
  timeInfo: {
    loginTime: number;
    logoutTime: number;
    activeTime: number;
    createTime: number;
    expiredTime: number;
    lastActiveTime: number;
  };
};

export type DbGroup = {
  _id: ObjectId;
  gid: number;
  name: string;
  owner: DbUser;
  member: DbUser[];
  createTime: number;
};

export type DbMessage = {
  _id: ObjectId;
  uid: string;
  friend: string;
  icon: string;
  nickname: string;
  logs: {
    cid: string;
    role: MessageRole;
    content: string;
    image: string;
    hidden: boolean;
    isRead: boolean;
    createTime: number;
  }[];
};

export type DbAccount = {
  _id: ObjectId;
  uid: string[];
  key: 'allUids';
};

export type DbApply = {
  _id: ObjectId;
  uid: string;
  list?: DbApplyListInfo[];
};

export type DbApplyListInfo = {
  uid: string;
  content?: string;
  expiredTime: number;
};

export type DbCaptchas = {
  _id: ObjectId;
  code: string;
  phoneNumber: number;
  expireTime: number;
};
