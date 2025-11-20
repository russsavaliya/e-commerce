
const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || '1200'
app.set('port', PORT);

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});