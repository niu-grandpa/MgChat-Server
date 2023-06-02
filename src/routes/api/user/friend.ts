import express from 'express';
import { Document, Filter } from 'mongodb';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { DbTable, UserGender, UserStatus } from '../../../types';
import { userMaxLevel } from './../../../core/index';

interface QueryFields {
  keywords: string;
  ageRange?: [number, number];
  gender?: UserGender;
  status?: UserStatus;
}

const friendApi = express.Router();
const { read, update } = useDbCrud();
const phoneExc = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;

friendApi
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
              filter.$and = [{ ...extraFlat, account: keywords }];
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
  .post('/apply-friend', async (request, response) => {})
  /**
   * 添加好友
   * 将各自的用户信息相互添加至对方的friends数组
   */
  .post('/add-friend', async (request, response) => {
    //
  })
  /**
   * 删除好友
   * 在用户的friends数组里将目标好友标记已删除，方便下次恢复数据（vip用户）。
   */
  .delete('/remove-friend', async (request, response) => {});

export default friendApi;
