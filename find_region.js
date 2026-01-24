const dns = require('dns');

const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'af-south-1', 'ap-east-1', 'ap-northeast-1', 'ap-northeast-2',
    'ap-northeast-3', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
    'ca-central-1', 'eu-central-1', 'eu-north-1', 'eu-west-1',
    'eu-west-2', 'eu-west-3', 'me-south-1', 'sa-east-1'
];

async function checkRegion(region) {
    return new Promise((resolve) => {
        const host = `aws-0-${region}.pooler.supabase.com`;
        dns.lookup(host, (err, address) => {
            if (err) resolve(null);
            else resolve({ region, address });
        });
    });
}

async function main() {
    console.log('Buscando regiones con IPv4...');
    const results = await Promise.all(regions.map(r => checkRegion(r)));
    const valid = results.filter(r => r !== null);
    console.log('Regiones encontradas:', valid.map(v => v.region).join(', '));

    console.log('\nIntentando identificar la región del proyecto ebihobjrwcwtjfazcjmv...');
    // Realmente no podemos "adivinar" el tenant en el pooler sin conectarnos, 
    // pero si us-east-1 falló con "Tenant not found", probaremos otras.
}

main();
