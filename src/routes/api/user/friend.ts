import dayjs from 'dayjs';
import express from 'express';
import { Document, Filter } from 'mongodb';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { DbTable, UserGender, UserStatus } from '../../../types';
import { userMaxLevel } from './../../../core/index';
import { DbApply, DbApplyListInfo } from './../../../types/db';

interface QueryFields {
  keywords: string;
  ageRange?: [number, number];
  gender?: UserGender;
  status?: UserStatus;
}

type A = DbApply['list'];

interface ApplyFields extends DbApplyListInfo {
  who: string;
}

const friendApi = express.Router();
const { read, update } = useDbCrud();
const phoneExc = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;

friendApi
  /**
   * 获取用户是否有新好友申请
   * 需要筛选掉已过期的申请
   */
  .get('/has-apply', async (request, response) => {
    await read({
      table: DbTable.APPLY,
      response,
      filter: { uid: request.body.uid },
      options: { list: { $elemMatch: { expiredTime: { $gt: Date.now() } } } },
    });
  })
  /**
   * 搜索用户
   * 允许通过用户名/昵称/手机号/关键字模糊查询用户表
   * 可选附加条件：性别/年龄/优先在线
   */
  .get('/search-friends', async (request, response) => {
    const { keywords, ageRange, gender, status } = request.body as QueryFields;

    let filter: Filter<Document> = { $and: [] };
    const extra = {
      age: {},
      gender: {},
      status: {},
    };

    useApiHandler({
      response,
      middleware: [
        () => {
          if (gender !== undefined) {
            extra.gender = { gender };
          }
          if (status !== undefined) {
            extra.status = { status };
          }
          if (ageRange && ageRange.length) {
            const [min, max] = ageRange;
            extra.age = { age: { $gte: min, $lte: max ?? userMaxLevel } };
          }

          const extraFlat = { ...extra.age, ...extra.gender, ...extra.status };

          // 判断是否为全数字，可能是查账号或查手机号
          if (keywords.length >= 10 && !isNaN(keywords as any)) {
            if (keywords.length === 10) {
              filter.$and = [{ ...extraFlat, uid: keywords }];
            } else if (phoneExc.test(keywords)) {
              filter.$and = [{ ...extraFlat, phoneNumber: keywords }];
            }
          } else {
            // 昵称或关键字模糊查询
            filter.$and = [
              { ...extraFlat, nickname: { $regex: new RegExp(keywords) } },
            ];
          }
        },
        async () => {
          await read(
            {
              table: DbTable.USER,
              response,
              filter,
            },
            'findAll'
          );
        },
      ],
    });
  })
  /**
   * 申请添加对方好友
   * 新申请有效期为10天
   * 客户端定时读取申请表中自己的数据，监听是否有新增加账号
   */
  .post('/new-apply', async (request, response) => {
    const { who, ...rest } = request.body as ApplyFields;
    useApiHandler({
      response,
      required: {
        target: request.body,
        must: ['who'],
        check: [{ type: 'String', fields: ['who', 'content'] }],
      },
      middleware: [
        async () => {
          // 设置申请有效期为10天
          rest.expiredTime = dayjs().add(10, 'day').valueOf();
          // 向目标用户添加申请方用户账号
          await update({
            table: DbTable.APPLY,
            response,
            filter: { who },
            update: { $addToSet: { list: rest } },
          });
        },
      ],
    });
  })
  /**
   * 添加好友
   * 将各自的用户信息相互添加至对方的friends数组
   * 客户端调用此接口后需再次获取好友列表
   */
  .post('/new-friend', async (request, response) => {
    const fields = ['who', 'content'];
    useApiHandler({
      response,
      required: {
        target: request.body,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          //
        },
      ],
    });
  })
  /**
   * 删除好友
   * 在用户的friends数组里将目标好友标记已删除，方便下次恢复数据（vip用户）。
   */
  .delete('/remove-friend', async (request, response) => {});

export default friendApi;
