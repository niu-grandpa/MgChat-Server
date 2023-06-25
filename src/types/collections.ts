import { ObjectId } from 'mongodb';
import { UserGender, UserStatus } from './enum';

export type UserCollection = {
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
  timeInfo: {
    loginTime: number;
    logoutTime: number;
    activeTime: number;
    createTime: number;
    expiredTime: number;
    lastActiveTime: number;
  };
};

export type GroupCollection = {
  _id: ObjectId;
  gid: number;
  name: string;
  icon: string;
  owner: UserCollection;
  member: UserCollection[];
  createTime: number;
};

export type FriendCollection = {
  _id: ObjectId;
  uid: string;
  list: UserCollection;
};

export type MessageCollection = {
  _id: ObjectId;
  uid: string;
  friend: string;
  icon: string;
  nickname: string;
  logs: {
    cid: string;
    from: string;
    to: string;
    content: string;
    image: string;
    hidden: boolean;
    read: boolean;
    createTime: number;
  }[];
};

export type UuidCollection = {
  _id: ObjectId;
  uid: string;
  createTime: number;
};

export type UserApplyCollection = {
  _id: ObjectId;
  /**申请者 */
  applicant: string;
  /**被申请者 */
  respondent: string;
  nickname: string;
  icon: string;
  gender: UserGender;
  message: string;
  createTime: number;
};

export type CaptchaCollection = {
  _id: ObjectId;
  code: string;
  phoneNumber: number;
  expireTime: number;
};
