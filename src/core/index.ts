import dayjs from 'dayjs';
import { UserInfo } from '../types';

const levelDays: Record<string, number> = {};
const maxLevel = 12;

for (let i = 1; i <= maxLevel; i++) {
  if (i <= 3) levelDays[i] = 7;
  if (i >= 4 && i <= 7) levelDays[i] = 14;
  if (i >= 8) levelDays[i] = 21;
}

/**
 * 结算用户等级和积分
 * @param data
 * @returns
 */
export function settlementUserLevelAndCredit(
  data: UserInfo & { logoutTime: number }
) {
  const { loginTime, logoutTime, level } = data;

  // 当前活跃时间由登出时间减去登录时间得到，单位（h）
  let currentActiveHours = dayjs(logoutTime).diff(dayjs(loginTime), 'h');
  let currentActiveMinutes = dayjs(logoutTime).diff(dayjs(loginTime), 'm');
  let currentActiveSeconds = dayjs(logoutTime).diff(dayjs(loginTime), 's');

  // 当前活跃时间每达到整的1个小时阶段，每次加50积分
  if (currentActiveHours >= 1) {
    let t = currentActiveHours;
    while (t--) data.credit += 50;
  } else {
    // 登录一个小时之内的按分钟转成小时
    if (currentActiveMinutes > 0) {
      currentActiveHours = Number((currentActiveMinutes / 60).toFixed(3));
    } else {
      // 登录不到一分钟按秒转成小时
      currentActiveHours = Number((currentActiveSeconds / 60 / 60).toFixed(3));
    }
  }

  // 更新总活跃时间
  data.activeTime += currentActiveHours;

  if (level < maxLevel) {
    // 获得升级天数的途径是通过累计每次登录的活跃小时数，并转成天数
    const upgradeDays = (data.upgradeDays += ~~(currentActiveHours / 24));
    const limit = levelDays[level];
    if (upgradeDays >= limit) {
      data.level += 1;
      // 升级一次+200用户积分
      data.credit += 200;
      // 如果不是为0，说明当前攒的升级天数有多出来的，要作为下一次升级的初始天数
      // 例如需要攒7天的升级天数，但是当前结算后得到的可消耗升级天数为9，
      // 那么多出来2天作为下一次升级的初始天数
      data.upgradeDays -= limit;
    }
  }

  // 当前活跃时间大于1小时+10积分
  while (currentActiveHours--) {
    data.credit += 10;
  }

  return data;
}
