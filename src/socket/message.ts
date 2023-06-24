import { ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { MessageRole } from '../types';

type ReceivedData = {
  role: MessageRole;
  friend: string;
  uid: string;
  icon: string;
  nickname: string;
  content?: string;
  image?: string;
};

/**
 * 消息服务
 * @param io
 * @param socket
 */
function messageService(io: Server, socket: Socket) {
  /**
   * 好友聊天
   */
  socket
    .on('join-frd', (room: string | string[]) => {
      socket.join(room);
    })
    .on('send-msg-to-frd', (data: ReceivedData) => {
      const { uid, friend } = data;
      const room = `${uid}-${friend}`;
      const returnVal = {
        ...data,
        hidden: false,
        isRead: false,
        createTime: Date.now(),
        cid: new ObjectId().toString(),
      };

      io.emit('send-frd-success', returnVal);

      // 交换角色方
      returnVal.role = MessageRole.OTHER;
      returnVal.friend = uid;
      returnVal.uid = friend;

      // 向房间中的客户端广播消息
      io.to(room).emit('receive-frd-msg', returnVal);

      // 存入数据库
    })
    .on('close-chat', (room: string) => {
      socket.leave(room);
      socket.rooms.delete(room);
      console.log(room, 'disconnected');
    });

  /**
   * 群组聊天
   */
}

export default messageService;
