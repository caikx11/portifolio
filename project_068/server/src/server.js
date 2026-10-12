const { createApp } = require('./app');
const { openDb } = require('./db');
const port = Number(process.env.PORT) || 3068;
createApp(openDb()).listen(port, () => console.log(`Notas API em http://localhost:${port}`));
