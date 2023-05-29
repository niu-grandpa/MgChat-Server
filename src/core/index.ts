import { UserInfo } from '../types';

/**
 * 结算用户等级与积分与获取规则
 *
 * 活跃时间：（logout time - login time）>= 24hours --> level + 1
 *
 * 积分：level + 1 --> credit + 500 || 每日在线时间 >= 2hours --> credit + 50
 */

export function settlementUserLevelAndCredit(data: UserInfo) {
  //
}
