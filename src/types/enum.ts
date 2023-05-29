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
