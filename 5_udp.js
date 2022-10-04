const dgram = require('dgram');

const PORT = 8101;
// End of stream
const EOS = Buffer.from('\0');

const store = {
  requestBody: '',
  responseBody: '',
};

const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');

function serverListen() {
  let sender;

  server.on('message', (chunk, info) => {
    sender ??= [info.port, info.address];
    store.requestBody += chunk.slice(0, -1);

    if (chunk.subarray(-1).compare(EOS)) return;

    server.send(`Hi, ${store.requestBody}${EOS}`, ...sender);
  });

  server.bind(PORT, () => {
    console.log(`UDP server listening on ${PORT}`);

    clientConnect();
  });
}

function clientConnect() {
  client.connect(PORT, () => {
    console.log(`UDP client connected to ${PORT}`);

    httpRequest();
  });
}

function httpRequest() {
  client.on('message', (chunk) => {
    store.responseBody += chunk.slice(0, -1);

    if (chunk.subarray(-1).compare(EOS)) return;

    finalize();
  });

  client.send(`Eytan${EOS}`);
}

function finalize() {
  server.close();
  client.close();

  console.log();
  console.log('[Request body]');
  console.log(store.requestBody); // Eytan

  console.log();
  console.log('[Response body]');
  console.log(store.responseBody); // Hi, Eytan
}

serverListen();
