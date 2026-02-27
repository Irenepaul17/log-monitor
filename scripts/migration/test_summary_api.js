const http = require('http');

const url = 'http://localhost:3000/api/dashboard/summary?userId=697ba6fb6655ebe5578a89f3&role=sse';

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
