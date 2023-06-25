import express, { Response } from 'express';
import { Document, Filter } from 'mongodb';
import { userMaxLevel } from '../../../core/index';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { CollectionName, UserGender, UserStatus } from '../../../types';
import {
  UserApplyCollection,
  UserCollection,
} from '../../../types/collections';

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
   * 查询用户好友
   */
  .get('/list', async (request, response) => {
    const { uid, phoneNumber } = request.query;
    const filter = uid ? { uid } : { phoneNumber };
    await read({
      table: CollectionName.FRIENDS,
      response,
      filter,
    });
  })

  /**
   * 获取用户是否有新好友申请
   * 需要筛选掉已过期的申请
   */
  .get('/has-apply', async (request, response) => {
    await read({
      table: CollectionName.USER_APPLICATION,
      response,
      filter: { uid: request.query.uid },
    });
  })

  /**
   * 搜索用户
   * 允许通过用户名/昵称/手机号/关键字模糊查询用户表
   * 可选附加条件：性别/年龄/优先在线
   */
  .get('/search', (request, response) => {
    const { keywords, ageRange, gender, status } =
      request.query as unknown as QueryFields;

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
              table: CollectionName.USERS,
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
  .post('/new-apply', (request, response) => {
    const { applicant, respondent, ...rest } = request.body
      .data as UserApplyCollection;
    const fields = ['applicant', 'respondent', 'gender', 'nickname', 'icon'];
    useApiHandler({
      response,
      required: {
        target: request.body.data,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          await update({
            table: CollectionName.USER_APPLICATION,
            response,
            filter: { respondent },
            update: { $set: { applicant, respondent, ...rest } },
          });
        },
      ],
    });
  })

  /**
   * 添加好友
   * 将各自的用户信息相互添加至对方的friends数组
   * 客户端调用此接口后需再次获取好友列表
   * @todo 添加打招呼消息
   */
  .post('/add', (request, response) => {
    const { applicant, respondent } = request.body.data as UserApplyCollection;
    const fields = ['applicant', 'respondent'];
    useApiHandler({
      response,
      required: {
        target: request.body.data,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => await addToEach(response, applicant, respondent),
        async () => await addToEach(response, respondent, applicant),
      ],
    });
  })

  /**
   * 删除好友
   * 在用户的friends数组里将目标好友标记已删除，方便下次恢复数据（vip用户）。
   */
  .delete('/remove', async (request, response) => {});

export default friendApi;

const addToEach = async (
  response: Response,
  uid: string,
  friendUid: string
) => {
  // 添加对方用户
  const friend = (await read({
    table: CollectionName.USERS,
    filter: { uid: friendUid },
  })) as unknown as UserCollection;

  // 重置用户重要信息
  const newData = {
    ...friend,
    token: '',
    credit: 0,
    password: '',
    timeInfo: {},
  };

  await update({
    table: CollectionName.FRIENDS,
    filter: { uid },
    response,
    update: { $pull: { list: { newData } } },
  });
};
