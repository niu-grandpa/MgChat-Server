export const enum DbTable {
  USER = 'user',
  GROUP = 'group',
  MESSAGE = 'message',
  ACCOUNT = 'account',
}

/** 接口调用后的状态码 */
export const enum ResponseCode {
  SUCCESS = 0,
  FAIL = 1,
  EXPIRED = 2,
  EXISTED = 3,
  NONE = 4,
  WRONG_PWD = 5,
}

export const ResponseMsg = {
  0: '成功',
  1: '失败',
  2: '已过期',
  3: '数据已存在',
  4: '未查询到相关数据',
  5: '密码错误',
};

export const enum UserStatus {
  ONLINE = 0,
  OFFLINE = 1,
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
