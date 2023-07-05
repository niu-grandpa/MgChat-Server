export const enum CollectionName {
  USERS = 'users',
  GROUPS = 'groups',
  MESSAGE_LOGS = 'message_logs',
  UUID = 'uuid',
  USER_APPLICATION = 'user_application',
  CAPTCHAS = 'captchs',
  FRIENDS = 'friends',
}

/** 接口调用后的状态码 */
export const enum ResponseCode {
  ERROR = -1,
  SUCCESS = 0,
  FAIL = 1,
  EXPIRED = 2,
  EXISTED = 3,
  NONE = 4,
  NO_ACCOUNT = 5,
  WRONG_PWD = 6,
  REPEAT_LOGIN = 7,
  NOT_PERMISSION = 8,
  INVALID_CODE = 9,
  USER_IS_OFFLINE = 10,
}

export const ResponseMsg = {
  '-1': '服务器错误',
  0: '成功',
  1: '失败',
  2: '登录已过期',
  3: '数据已存在',
  4: '未查询到相关数据',
  5: '账号错误',
  6: '密码错误',
  7: '当前用户已在线',
  8: '权限不足',
  9: '验证码无效',
  10: '用户已离线',
};

export const enum UserStatus {
  OFFLINE = 0,
  ONLINE = 1,
  ACTIVE = 2,
  BUSY = 3,
  INVISIBILITY = 4,
  DO_NOT_DISTURB = 5,
}

export const enum UserPrivilege {}

export const enum UserGender {
  MAN = 0,
  WOMAN = 1,
  NONE = 3,
}

/**
 * 聊天的角色方
 */
export const enum MessageRole {
  /**我 */
  ME = 0,
  /**对方 */
  OTHER = 1,
}

/**
 * 消息类型
 */
export enum MessageType {
  FRIEND_MSG = 0,
  GROUP_MSG = 1,
}
