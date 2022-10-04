const http = require('http');

const PORT = 8101;

const store = {
  requestBody: '',
  responseBody: '',
};

const server = http.createServer({ port: PORT }, (req, res) => {
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

function serverListen() {
  server.listen(PORT, () => {
    console.log(`HTTP server listening on ${PORT}`);

    httpRequest();
  });
}

function httpRequest() {
  const req = http.request({
    port: PORT,
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
  server.close();

  console.log();
  console.log('[Request body]');
  console.log(store.requestBody); // Eytan

  console.log();
  console.log('[Response body]');
  console.log(store.responseBody); // Hi, Eytan
}

serverListen();
