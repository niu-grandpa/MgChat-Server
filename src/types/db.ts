import { ObjectId } from 'mongodb';
import { UserStatus } from './enum';

export declare namespace DbUser {
  interface UserInfo {
    icon: string;
    city: string;
    age: number;
    status: UserStatus;
    level: number;
    gender: number;
    credit: number;
    loginTime: number;
    privilege: number;
    upgradeDays: number;
    nickname: string;
    account: string;
    password: string;
    phoneNumber: string;
    friends: UserInfo[];
    groups: DbGroup.GroupInfo[];
    activeTime: number;
    createTime: number;
  }
}

export declare namespace DbGroup {
  interface GroupInfo {
    gid: number;
    name: string;
    owner: DbUser.UserInfo;
    member: DbUser.UserInfo[];
    createTime: number;
  }
}

export declare namespace DbMessage {}

export type DbAccount = {
  _id: ObjectId;
  uid: string[];
  key: 'allUids';
};
