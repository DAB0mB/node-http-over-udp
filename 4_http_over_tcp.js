const { HTTPParser } = require('_http_common');
const net = require('net');

const PORT = 8101;
// According to the specs, HTTP 1.1 uses CRLF for line breaks
// https://www.rfc-editor.org/rfc/rfc2616
const CRLF = '\r\n';
const { kOnBody } = HTTPParser;

const store = {
  requestBody: '',
  responseBody: '',
};

const server = net.createServer((socket) => {
  const parser = new HTTPParser();
  parser.initialize(HTTPParser.REQUEST, {});
  parser[kOnBody] = body => store.requestBody = body.toString();

  socket.on('data', (chunk) => {
    parser.execute(chunk, 0, chunk.length);
  });

  socket.on('end', () => {
    const content = `Hi, ${store.requestBody}`;
    socket.end([
      'HTTP/1.1 200 OK',
      'Content-Type: text/plain',
      `Content-Length: ${content.length}`,
      '',
      content,
    ].join(CRLF));
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
  const parser = new HTTPParser();
  parser.initialize(HTTPParser.RESPONSE, {});
  parser[kOnBody] = body => store.responseBody = body.toString();

  client.on('data', (chunk) => {
    parser.execute(chunk, 0, chunk.length);
  });

  client.on('end', finalize);

  client.connect({ port: PORT }, () => {
    console.log(`TCP client connected to ${PORT}`);

    const content = 'Eytan';
    client.end([
      'POST /say-hi HTTP/1.1',
      'Content-Type: text/plain',
      `Content-Length: ${content.length}`,
      '',
      content,
    ].join(CRLF));
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
