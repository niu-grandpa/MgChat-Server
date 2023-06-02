#!/usr/bin/env node

/**
 * Module dependencies.
 */

import debug from 'debug';
import http from 'http';
import path from 'path';
import app from '../src/app';
import createSocketIo from '../src/socket';

const _debug = debug('server:server');
const pkg = require(path.join(__dirname, '../package.json'));

/**
 * Get hostname from package.json.
 */

const hostname = pkg.env.TEST_URL;
app.set('hostname', hostname);
/**
 * Get port from package.json.
 */

const port = normalizePort(pkg.env.PORT);
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Create Socket server.
 */

createSocketIo(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr!.port;
  _debug('Listening on ' + bind);
}
