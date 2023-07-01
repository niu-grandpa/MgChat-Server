import express from 'express';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { CollectionName, MessageCollection } from '../../../types';
import { verifyToken } from '../../../utils';

const MessageApi = express.Router();
const { read, update } = useDbCrud();

MessageApi
  /** 查询某用户与其他人的所有聊天记录 */
  .get('/get', async (request, response) => {})

  /**设置消息已读*/
  .post('/have-read', (request, response) => {})

  /**保存消息记录 */
  .post('/save', (request, response) => {
    const { uid, friend, icon, nickname, logs } = verifyToken(
      request.body.data as string
    ) as unknown as MessageCollection;

    const fields = ['uid', 'friend', 'icon', 'nickname'];

    useApiHandler({
      response,
      required: {
        target: request.body.data,
        must: [...fields, 'logs'],
        check: [
          { type: 'String', fields },
          { type: 'Array', fields: ['logs'] },
        ],
      },
      middleware: [
        async () => {
          update({
            table: CollectionName.MESSAGE_LOGS,
            filter: { $and: [{ uid }, { friend }] },
            update: { icon, nickname, $push: { logs: logs[0] } },
          });
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
