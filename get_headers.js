const https = require('https');

const options = {
    hostname: 'ebihobjrwcwtjfazcjmv.supabase.co',
    port: 443,
    path: '/rest/v1/',
    method: 'GET',
    headers: {
        'apikey': 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd'
    }
};

const req = https.request(options, (res) => {
    console.log('Status code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    res.on('data', (d) => {
        // process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});
req.end();
