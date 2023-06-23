import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import messageService from './message';

const createSocketIo = (http: HttpServer) => {
  const io = new Server(http, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', socket => {
    messageService(io, socket);
    console.log('a user connecting to socket.io');
  });

  io.on('disconnect', () => {
    console.log('user disconnected');
  });
};

export default createSocketIo;
