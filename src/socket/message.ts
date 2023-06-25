import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { SECRET_KEY } from '../private';
import { MessageType } from '../types';
import { createHash } from '../utils';

// type ReceivedData = {
//   role: MessageRole;
//   friend: string;
//   uid: string;
//   icon: string;
//   nickname: string;
//   content?: string;
//   image?: string;
// };

type SendMessage = {
  type: MessageType;
  from: string;
  to: string;
  detail: {
    cid: string;
    icon: string;
    nickname: string;
    content: string;
    image: string;
  };
  createTime: number;
};

type ReceivedDataType = {
  from: string;
  to: string;
  icon: string;
  nickname: string;
  content: string;
  image: string;
  type: MessageType;
};

/**
 * 消息服务
 * @param io
 * @param socket
 */
function messageService(io: Server, socket: Socket) {
  const getHash = createHash();
  /**
   * 只监听message方法进行消息中转收发，方便使用postman测试
   * 更完善的程序在后面的注释掉了
   */
  const listener = ({ type, from, to, ...rest }: ReceivedDataType) => {
    const payload: SendMessage = {
      type,
      from,
      to,
      detail: {
        ...rest,
        cid: getHash(),
      },
      createTime: Date.now(),
    };
    // 为确保数据安全将其加密传输
    const token = jwt.sign(payload, SECRET_KEY);
    io.emit('receive-message', token);
    io.emit('send-message-ok', token);
  };
  socket.on('message', listener);

  /**
   * 好友聊天
   */
  // socket
  //   .on('join-frd', (room: string | string[]) => {
  //     socket.join(room);
  //     console.log('join room', room);
  //   })
  //   .on('message', e => {
  //     console.log(e);
  //     io.emit('message', e);
  //   })

  //   .on('send-msg-to-frd', (data: ReceivedData) => {
  //     const { uid, friend } = data;
  //     const friendRoom = `${friend}-${uid}`;
  //     /**
  //      * 用户与好友建立的房间号在“我”的视角来看是 “他->我” ，
  //      * 在对方视角来看是 “我->他”，那么用户“我”进入该房间后向对方广播消息，
  //      * 就变为向“我”的房间内的“他”广播消息，因此通过反转房间号组合顺序就
  //      * 得到了“他”对于“我”的房间号，即你中有我，我中有你。
  //      * 如果不这么做的话，当前的房间号只有自己存在，没有用。
  //      */
  //     const MyRoom = friendRoom.split('-').reverse().join('-');

  //     const swapData = {
  //       ...data,
  //       hidden: false,
  //       isRead: false,
  //       createTime: Date.now(),
  //       cid: new ObjectId().toString(),
  //     };

  //     io.emit('send-frd-ok', swapData);

  //     // 交换角色方
  //     swapData.role = MessageRole.OTHER;
  //     swapData.friend = uid;
  //     swapData.uid = friend;

  //     // 向房间中的客户端广播消息
  //     io.to(MyRoom).emit('receive-frd-msg', swapData);

  //     // 存入数据库
  //   })

  //   .on('close-chat', (room: string) => {
  //     socket.leave(room);
  //     socket.rooms.delete(room);
  //     console.log(room, 'disconnected');
  //   });

  /**
   * 群组聊天
   */
}

export default messageService;