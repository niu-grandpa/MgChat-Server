import dayjs from 'dayjs';
import { DbUser } from '../types';

/**用户最高等级 */
export const userMaxLevel = 12;

const levelDays: Record<string, number> = {};

for (let i = 1; i <= userMaxLevel; i++) {
  // 1-3等级所需升级天数: 7
  if (i <= 3) levelDays[i] = 7;
  // 4-7等级所需升级天数: 14
  if (i >= 4 && i <= 7) levelDays[i] = 14;
  // 8-12等级所需升级天数: 21
  if (i >= 8) levelDays[i] = 21;
}

/**
 * 结算用户等级和积分
 * @param data
 * @returns
 */
export function settlementUserLevelAndCredit(data: DbUser.UserInfo) {
  const { level, timeInfo } = data;
  const { loginTime, logoutTime, lastActiveTime } = timeInfo;

  // 当前活跃时间由下线时间减去登录时间得到，单位（h）
  let currentActiveHours = dayjs(logoutTime).diff(dayjs(loginTime), 'h');
  let currentActiveMinutes = dayjs(logoutTime).diff(dayjs(loginTime), 'm');

  // 当前活跃时间每达到整的1个小时阶段，每次加6积分
  if (currentActiveHours >= 1) {
    let t = currentActiveHours;
    while (t--) data.credit += 6;
  } else if (currentActiveMinutes > 0) {
    // 登录一个小时之内的按分钟转成小时
    currentActiveHours = Number((currentActiveMinutes / 60).toFixed(1));
  }

  // 更新总活跃时间
  data.timeInfo.activeTime += currentActiveHours;

  // 用户未满级，执行升级算法
  if (level < userMaxLevel) {
    // 当活跃时间+上次临时累计的活跃时间
    currentActiveHours += lastActiveTime;

    // 计算从登录到登出的时间是否大于等于1天
    const payload = ~~(currentActiveHours / 24);

    // 不到1天则累加到上次活跃时间
    if (payload < 1) {
      data.timeInfo.lastActiveTime += currentActiveHours;
    } else {
      const limit = levelDays[level];
      // 获得升级天数的途径是通过累计每次登录的活跃小时数，并转成天数
      const upgradeDays = (data.upgradeDays += payload);
      // 累计升级天数达到了对应等级限制的升级天数
      if (upgradeDays >= limit) {
        data.level += 1;

        // 升级一次+100积分
        data.credit += 100;

        // 如果不是为0，说明当前攒的升级天数有多出来的，要作为下一次升级的初始天数
        // 例如需要攒7天的升级天数，但是当前结算后得到的可消耗升级天数为9，
        // 那么多出来2天作为下一次升级的初始天数
        data.upgradeDays -= limit;

        while (data.upgradeDays > 0) {
          data.timeInfo.lastActiveTime += 24;
        }
      }
    }
  }

  return data;
}
