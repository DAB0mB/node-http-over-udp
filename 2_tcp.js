const net = require('net');

const PORT = 8101;

const store = {
  requestBody: '',
  responseBody: '',
};

const server = net.createServer((socket) => {
  socket.on('data', (chunk) => {
    store.requestBody += chunk;
  });

  socket.on('end', () => {
    socket.end(`Hi, ${store.requestBody}`);
  });
});

const client = new net.Socket();

function serverListen() {
  server.listen(PORT, () => {
    console.log(`TCP server listening on ${PORT}`);

    httpRequest();
  });
}

function httpRequest() {
  client.on('data', (chunk) => {
    store.responseBody += chunk;
  });

  client.on('end', finalize);

  client.connect({ port: PORT }, () => {
    console.log(`TCP client connected to ${PORT}`);

    client.end('Eytan');
  });
}

function finalize() {
  server.close();

  console.log();
  console.log('[Request body]');
  console.log(store.requestBody); // Eytan

  console.log();
  console.log('[Response body]');
  console.log(store.responseBody); // Hi, Eytan
}

serverListen();
