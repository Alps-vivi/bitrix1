const http = require('http');
const url = require('url');
const querystring = require('querystring');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Định nghĩa cổng và host cho server
const PORT = 5500;
const HOST = 'localhost';

// Đọc access token từ file tokens.json
let accessToken = '';
try {
    const tokenData = fs.readFileSync(path.join(__dirname, 'tokens.json'), 'utf-8');
    const tokens = JSON.parse(tokenData);
    accessToken = tokens.access_token;
    console.log('Access Token Loaded:', accessToken);
} catch (err) {
    console.error('Error reading tokens file:', err.message);
}

// Tạo server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (pathname === '/test') {
        // Xử lý yêu cầu GET cho /test
        if (accessToken) {
            try {
                // Gửi yêu cầu GET để lấy danh sách contacts
                const response = await axios.get('https://b24-3mnaqi.bitrix24.vn/rest/crm.contact.list.json', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response.data, null, 2)); // Định dạng JSON đẹp
            } catch (error) {
                console.error('API Call Error:', error.message);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Error: ${error.message}`);
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Access token is missing or expired.');
        }
    } else if (pathname === '/install') {
        // Xử lý sự kiện Install App
        const authUrl = `https://b24-3mnaqi.bitrix24.vn/oauth/authorize/?response_type=code&client_id=local.66b1f6cd2fc578.18221948&redirect_uri=http://localhost:${PORT}/callback`;
        res.writeHead(302, { Location: authUrl });
        res.end();
    } else if (pathname === '/callback') {
        // Xử lý callback từ Bitrix24
        const query = querystring.parse(parsedUrl.query);
        const code = query.code;

        if (code) {
            try {
                // Gửi yêu cầu POST để lấy access token
                const tokenResponse = await axios.post('https://oauth.bitrix.info/oauth/token/', querystring.stringify({
                    grant_type: 'authorization_code',
                    client_id: 'local.66b1f6cd2fc578.18221948',
                    client_secret: 'V4T46aCgowWwZKbmvu70gGOWD5nrNPxJZvlXsj5Z66YttoaWTe',
                    code: code
                }), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                // Lưu access token và refresh token vào file tokens.json
                const tokens = {
                    access_token: tokenResponse.data.access_token,
                    refresh_token: tokenResponse.data.refresh_token
                };
                fs.writeFileSync(path.join(__dirname, 'tokens.json'), JSON.stringify(tokens, null, 2));

                accessToken = tokens.access_token; // Cập nhật biến accessToken
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Access token and refresh token received and saved.');
            } catch (error) {
                console.error('Token Exchange Error:', error.message);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Error: ${error.message}`);
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Authorization code is missing.');
        }
    } else {
        // Xử lý các yêu cầu khác
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Khởi động server
server.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});
