const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 80;
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
    const pathname = new URL(
        req.url,
        `http://${req.headers.host || 'localhost'}`
    ).pathname;

    // Health check for Docker and CI/CD
    if (req.method === 'GET' && pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: 'healthy',
            application: 'FocusFlow',
            timestamp: new Date().toISOString()
        }));
    }

    // Serve the dashboard
    if (req.method === 'GET' &&
        (pathname === '/' || pathname === '/index.html')) {

        const filePath = path.join(PUBLIC_DIR, 'index.html');

        return fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                return res.end('Unable to load FocusFlow dashboard.');
            }

            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        });
    }

    // Serve CSS, JavaScript and other static assets
    const safePath = path.resolve(PUBLIC_DIR, '.' + pathname);

    if (!safePath.startsWith(PUBLIC_DIR + path.sep)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.readFile(safePath, (err, content) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            return res.end('404 - Page not found');
        }

        const ext = path.extname(safePath);

        const contentTypes = {
            '.css': 'text/css; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        res.writeHead(200, {
            'Content-Type':
                contentTypes[ext] || 'application/octet-stream',
            'X-Content-Type-Options': 'nosniff'
        });

        res.end(content);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`FocusFlow running on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
});
