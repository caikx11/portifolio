const { createChatServer } = require('./chat');
const port = Number(process.env.PORT) || 3069;
createChatServer().listen(port, () => console.log(`Chat em ws://localhost:${port}/ws`));
