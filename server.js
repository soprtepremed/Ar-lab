const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let filePath = path.join(__dirname, url === '/' ? 'index.html' : url);
    let extname = path.extname(filePath);

    // If no extension, try adding .html
    if (!extname && !filePath.endsWith(path.sep)) {
        filePath += '.html';
        extname = '.html';
    }

    let contentType = 'text/html';
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile(path.join(__dirname, '404.html'), (err, content404) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content404 || '<h1>404 Not Found</h1>', 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(port, () => {
    console.log(`Servidor Ar Lab corriendo en http://localhost:${port}/`);
});
