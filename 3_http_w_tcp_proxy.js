const http = require('http');
const net = require('net');

const HTTP_PORT = 8101;
const PROXY_PORT = 8102;

const store = {
  requestBody: '',
  responseBody: '',
};

const proxy = net.createServer((localSocket) => {
  const remoteSocket = net.createConnection({ port: HTTP_PORT });

  localSocket.on('data', (chunk) => {
    remoteSocket.write(chunk);
  });

  remoteSocket.on('data', (chunk) => {
    localSocket.write(chunk);
  });

  localSocket.on('close', () => {
    remoteSocket.end();
  });

  remoteSocket.on('close', () => {
    localSocket.end();
  });
});

const httpServer = http.createServer({ port: HTTP_PORT }, (req, res) => {
  let data = ''

  req.on('data', (chunk) =>  {
    data += chunk;
  });

  req.on('end', () => {
    store.requestBody = data;

    const content = `Hi, ${data}`;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', content.length);
    res.write(content);
    res.end();
  });
});

function httpServerListen() {
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening on ${HTTP_PORT}`);

    proxyListen();
  });
}

function proxyListen() {
  proxy.listen(PROXY_PORT, () => {
    console.log(`TCP proxy listening on ${PROXY_PORT}`);

    httpRequest();
  });
}

function httpRequest() {
  const req = http.request({
    port: PROXY_PORT,
    method: 'POST',
    path: '/say-hi',
  }, (res) => {
    let data = '';

    res.on('data', (chunk) =>  {
      data += chunk;
    });

    res.on('end', () => {
      store.responseBody = data;
      finalize();
    });
  });

  const content = 'Eytan';
  req.setHeader('Content-Type', 'text/plain');
  req.setHeader('Content-Length', content.length);
  req.write(content);
  req.end();
}

function finalize() {
  proxy.close();
  httpServer.close();

  console.log();
  console.log('[Request body]');
  console.log(store.requestBody); // Eytan

  console.log();
  console.log('[Response body]');
  console.log(store.responseBody); // Hi, Eytan
}

httpServerListen();
