const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('../service-account-key.json'))
});

const remoteConfig = admin.remoteConfig();

module.exports = remoteConfig;