import { Server, Socket } from 'socket.io';
import { useDbCrud } from '../hooks';
import { CollectionName, MessageType } from '../types';
import { createHash, verifyToken } from '../utils';

type ReceivedDataType = {
  from: string;
  to: string;
  icon: string;
  nickname: string;
  content: string;
  image: string;
  type: MessageType;
} & {
  cid: string;
  createTime: number;
};

const { update } = useDbCrud();

/**
 * 消息服务
 * @param io
 * @param socket
 */
function messageService(io: Server, socket: Socket) {
  const getHash = createHash();

  const onMessage = (data: string) => {
    const source = verifyToken(data) as unknown as ReceivedDataType;

    source.cid = getHash();
    source.createTime = Date.now();

    // 保存消息到数据库
    update({
      table: CollectionName.MESSAGE_LOGS,
      filter: { $and: [{ uid: source.to }, { friend: source.from }] },
      update: { $push: { logs: source } },
    })
      .then(() => {
        io.emit('receive-friend-message', { state: 'ok' });
      })
      .catch(error => {
        io.emit('receive-friend-message', { state: 'fail', error });
      });
  };

  socket.on('message', onMessage);

  /**
   * 群组聊天
   */
}

export default messageService;
