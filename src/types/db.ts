/**数据库表名 */
export type DbTables = 'data';

/**数据库表结构 */
export interface DbTableSructure {
  allUsers: UserInfo[];
  allAccount: string[];
  allGroups: GroupInfo[];
  messageHistory: MessageLog;
}

/**用户信息 */
export interface UserInfo {
  id: string;
  icon: string;
  city: string;
  age: number;
  level: number;
  gender: number;
  credit: number;
  loginTime: number;
  logoutTime: number;
  privilege: number;
  upgradeDays: number;
  nickname: string;
  account: string;
  password: string;
  phoneNumber: string;
  friends: UserInfo[];
  groups: GroupInfo[];
  activeTime: number;
  createTime: number;
}

/**群组信息 */
export interface GroupInfo {
  gid: number;
  name: string;
  owner: UserInfo;
  member: UserInfo[];
  createTime: number;
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
