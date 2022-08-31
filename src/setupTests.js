const nodeCrypto = require('crypto');

// eslint-disable-next-line no-undef
window.crypto = {
  getRandomValues(buffer) {
    return nodeCrypto.randomFillSync(buffer);
  },
};
