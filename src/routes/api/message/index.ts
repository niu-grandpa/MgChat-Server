import express from 'express';
import { ObjectId } from 'mongodb';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { ClientQueryFields, DbMessage, DbTable } from '../../../types';

const messageApi = express.Router();
const { read, create, update } = useDbCrud();

messageApi
  /** 查询某用户与其他人的所有聊天记录 */
  .get('/get', async (request, response) => {
    await read({
      response,
      request,
      table: DbTable.MESSAGE,
      filter: { account: request.body.account },
    });
  })

  /**保存消息记录 */
  .post('/save', async (request, response) => {
    const { account, recordMsg } = request.body as ClientQueryFields;
    const { who, data } = recordMsg;
    const common = {
      table: DbTable.MESSAGE,
      filter: { account },
    };
    useApiHandler({
      response,
      required: {
        target: request.body,
        must: ['account', 'recordMsg'],
        check: [{ type: 'Object', fields: ['recordMsg'] }],
      },
      middleware: [
        // 当前用户是否创建了消息记录数据集
        async () =>
          await create({ ...common, newData: { account, record: [] } }),
        async () => {
          const { record } = (await read(
            common
          )) as unknown as DbMessage.Record;

          // 查找对方用户是否已有数据集存在当前用户消息记录中
          const [isWhoHasData] = record.filter(item => item.who === who);
          if (!isWhoHasData) {
            // @ts-ignore
            record.push({ who, message: [] });
          }

          // 向用户的聊天对象数据集里添加记录
          record.some(item => {
            if (item.who === who) {
              data.cid = new ObjectId(~~(Math.random() * 10)).toString();
              item.message.push(data);
              return true;
            }
          });

          await update({
            ...common,
            response,
            update: { $set: { record } },
          });
        },
      ],
    });
  })

  /**删除用户所有聊天记录或单删某条消息记录 */
  .delete('/delete', async (request, response) => {
    useApiHandler({
      response,
      required: {
        target: request.body,
        must: ['account', 'who', 'cid'],
      },
      middleware: [
        async () => {
          //
        },
      ],
    });
  });

export { messageApi };
