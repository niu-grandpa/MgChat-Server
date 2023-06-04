import { ObjectId } from 'mongodb';
import { MessageRole, UserStatus } from './enum';

export declare namespace DbUser {
  interface UserInfo {
    icon: string;
    city: string;
    age: number;
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
    friends: UserInfo[];
    groups: DbGroup.GroupInfo[];
    timeInfo: {
      loginTime: number;
      logoutTime: number;
      activeTime: number;
      createTime: number;
    };
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

export declare namespace DbMessage {
  type HistoryMessageType = {
    cid: string;
    role: MessageRole;
    content: string;
    image: string;
    hidden: boolean;
    createTime: number;
  };
  type RecordType = {
    who: string;
    createTime: number;
    message: HistoryMessageType[];
  };
  interface Record {
    uid: string;
    record: RecordType[];
  }
}

export interface DbAccount {
  _id: ObjectId;
  uid: string[];
  key: 'allUids';
}

export interface DbApply {
  _id: ObjectId;
  uid: string;
  list?: DbApplyListInfo[];
}

export type DbApplyListInfo = {
  uid: string;
  content?: string;
  expiredTime: number;
};
