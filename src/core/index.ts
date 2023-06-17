import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import dayjs from 'dayjs';
import { aliyunAccess } from '../private';
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

/**
 * 阿里云短信验证码服务
 */
export class AliyunCaptchaClient {
  /**
   * 使用AK&SK初始化账号Client
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
  static createClient(
    accessKeyId: string,
    accessKeySecret: string
  ): Dysmsapi20170525 {
    let config = new $OpenApi.Config({
      // 必填，您的 AccessKey ID
      accessKeyId,
      // 必填，您的 AccessKey Secret
      accessKeySecret,
    });

    // 访问的域名
    config.endpoint = `dysmsapi.aliyuncs.com`;
    return new Dysmsapi20170525(config);
  }

  static async main(data: { phoneNumber: string; code: number }): Promise<any> {
    // 请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID 和 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
    // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例使用环境变量获取 AccessKey 的方式进行调用，仅供参考，建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html
    let client = AliyunCaptchaClient.createClient(
      aliyunAccess.accessKeyId,
      aliyunAccess.accessKeySecret
    );
    let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      signName: 'MgChat',
      templateCode: 'SMS_461395552',
      phoneNumbers: data.phoneNumber,
      templateParam: `{"code":"${data.code}"}`,
    });
    let runtime = new $Util.RuntimeOptions({});
    try {
      // 复制代码运行请自行打印 API 的返回值
      return await client.sendSmsWithOptions(sendSmsRequest, runtime);
    } catch (error: any) {
      // 如有需要，请打印 error
      Util.assertAsString(error.message);
    }
  }
}
