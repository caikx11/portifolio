const { createApp } = require('./app');
const { openDb } = require('./db');
const port = Number(process.env.PORT) || 3067;
createApp(openDb()).listen(port, () => console.log(`Encurtador em http://localhost:${port}`));
