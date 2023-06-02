import express from 'express';
import { Document, ObjectId } from 'mongodb';
import { useApiHandler, useDbCrud } from '../../../hooks';
import {
  ClientQueryFields,
  DbMessage,
  DbTable,
  ResponseCode,
} from '../../../types';
import { wrapperResult } from '../../../utils';

const messageApi = express.Router();
const { read, create, update, deleteOne } = useDbCrud();

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
    const { account, who, recordMsg } = request.body as ClientQueryFields;
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
              recordMsg.hidden = false;
              recordMsg.cid = new ObjectId(~~(Math.random() * 10)).toString();
              item.message.push(recordMsg);
              return true;
            }
          });

          await update({ ...common, update: { $set: { record } } });
          // 返回消息id
          response.send(wrapperResult(recordMsg.cid, ResponseCode.SUCCESS));
        },
      ],
    });
  })

  /**
   * 删除用户某条消息记录
   * 这里并不会真正的删除该条数据，而是打上隐藏标记
   * 除非参数withdraw为true会真正删除
   */
  .delete('/delete', async (request, response) => {
    const { account, cid, withdraw } = request.body as ClientQueryFields;
    const fields = ['account', 'who', 'cid'];
    let doc: Document;

    useApiHandler({
      response,
      required: {
        target: request.body,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        () => {
          const hiddenElm = {
            update: { $set: { 'record.$[].message.$[idx].hidden': true } },
            options: { arrayFilters: [{ 'idx.cid': cid }] },
          };
          const removeElm = {
            update: { $pull: { 'record.$[].message': { cid } } },
          };
          withdraw ? (doc = removeElm) : (doc = hiddenElm);
        },
        async () => {
          await update({
            table: DbTable.MESSAGE,
            response,
            filter: { account },
            ...doc,
          });
        },
      ],
    });
  });

export { messageApi };
