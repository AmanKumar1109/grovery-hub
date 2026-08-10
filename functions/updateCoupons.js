const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // I need to know if we have a service account key or if I can run it using default credentials

// Actually, it's easier to write a script that runs inside the functions emulator or just a node script if the environment is authenticated.
// Wait! We can just use the firebase-admin SDK if GOOGLE_APPLICATION_CREDENTIALS is set, but it might not be.
