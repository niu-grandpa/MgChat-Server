import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

const createSocketIo = (http: HttpServer) => {
  const io = new Server(http);

  io.on('connection', socket => {
    console.log('someone connecting to socket.io');
  });
};

export default createSocketIo;
