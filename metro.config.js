const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ws: require.resolve('./shim/ws-shim.js'),
  stream: require.resolve('./shim/stream-shim.js'),
  events: require.resolve('./shim/events-shim.js'),
  http: require.resolve('./shim/http-shim.js'),
  https: require.resolve('./shim/https-shim.js'),
  crypto: require.resolve('./shim/crypto-shim.js'),
  zlib: require.resolve('./shim/zlib-shim.js'),
  net: require.resolve('./shim/net-shim.js'),
  tls: require.resolve('./shim/tls-shim.js'),
  dgram: require.resolve('./shim/dgram-shim.js'),
  dns: require.resolve('./shim/dns-shim.js'),
  fs: require.resolve('./shim/fs-shim.js'),
  os: require.resolve('./shim/os-shim.js'),
  path: require.resolve('./shim/path-shim.js'),
  child_process: require.resolve('./shim/child_process-shim.js'),
  readline: require.resolve('./shim/readline-shim.js'),
  url: require.resolve('./shim/url-shim.js'),
  util: require.resolve('./shim/util-shim.js'),
  vm: require.resolve('./shim/vm-shim.js'),
  assert: require.resolve('./shim/assert-shim.js'),
  buffer: require.resolve('./shim/buffer-shim.js'),
  module: require.resolve('./shim/module-shim.js'),
  tty: require.resolve('./shim/tty-shim.js'),
  cluster: require.resolve('./shim/cluster-shim.js'),
  worker_threads: require.resolve('./shim/worker_threads-shim.js'),
};

module.exports = config;
