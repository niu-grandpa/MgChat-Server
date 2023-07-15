import express from 'express';
import { useApiHandler, useDbCrud } from '../../../hooks';
import {
  CollectionName,
  MessageCollection,
  ResponseCode,
} from '../../../types';
import { signData, wrapperResult } from '../../../utils';

const MessageApi = express.Router();
const { read, update } = useDbCrud();

MessageApi
  /**
   * 获取用户与所有好友的聊天数据
   */
  .get('/sync-friend-messages', async (request, response) => {
    const { uid } = request.query;
    await read(
      { table: CollectionName.MESSAGE_LOGS, response, filter: { uid } },
      'findAll'
    );
  })
  /**
   * 获取好友新消息
   */
  .get('/new-friend-messages', async (request, response) => {
    const { uid } = request.query;
    const list = await read(
      { table: CollectionName.MESSAGE_LOGS, filter: { uid } },
      'findAll'
    );
    if (list !== null) {
      const all = list as MessageCollection[];
      const newList = all.map(({ friend, logs }) => ({ friend, logs }));
      // 加密传输
      response.send(wrapperResult(signData(newList), ResponseCode.SUCCESS));
    } else {
      response.send(wrapperResult(null, ResponseCode.FAIL));
    }
  })

  /**设置消息是否已读*/
  .post('/action-read', (request, response) => {
    const { uid, friend } = request.body.data;
    const common = {
      table: CollectionName.MESSAGE_LOGS,
      filter: { $and: [{ uid }, { friend }] },
    };

    useApiHandler({
      response,
      required: {
        target: request.body.data,
        must: ['uid', 'friend'],
      },
      middleware: [
        async () => {
          const list = await read(common);
          if (list !== null) {
            for (const item of (list as MessageCollection).logs) {
              if (item.read) continue;
              item.read = true;
            }
            return list;
          }
          return false;
        },
        async (data: Promise<MessageCollection | boolean>) => {
          const _data = await data;
          let updated = false;
          if (Array.isArray(_data)) {
            await update({
              ...common,
              update: { $set: { logs: _data } },
            });
            updated = true;
          }
          response.send(wrapperResult(update, ResponseCode.SUCCESS));
        },
      ],
    });
  })

  /**
   * 删除用户某条消息记录
   * 这里并不会真正的删除该条数据，而是打上隐藏标记
   * 除非参数withdraw为true会真正删除（撤回功能）
   */
  .delete('/remove', (request, response) => {});

export default MessageApi;
