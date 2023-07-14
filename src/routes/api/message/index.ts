import express from 'express';
import { useDbCrud } from '../../../hooks';
import { CollectionName } from '../../../types';

const MessageApi = express.Router();
const { read, update } = useDbCrud();

MessageApi
  /**
   * 获取用户与所有好友的聊天数据
   */
  .get('/sync-friend-message', async (request, response) => {
    const { uid } = request.query;
    await read(
      { table: CollectionName.MESSAGE_LOGS, filter: { uid }, response },
      'findAll'
    );
  })

  /**设置消息已读*/
  .post('/have-read', (request, response) => {})

  /**
   * 删除用户某条消息记录
   * 这里并不会真正的删除该条数据，而是打上隐藏标记
   * 除非参数withdraw为true会真正删除（撤回功能）
   */
  .delete('/remove', (request, response) => {});

export default MessageApi;
