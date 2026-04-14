import json

with open('vercel.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for header_block in data['headers']:
    for h in header_block['headers']:
        if h['key'] == 'Content-Security-Policy':
            h['value'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src https://fonts.gstatic.com; "
                "img-src 'self' data: blob: https://placehold.co https://images.unsplash.com https://images.pexels.com; "
                "connect-src 'self' https://drawnbuy-backend.onrender.com wss://drawnbuy-backend.onrender.com; "
                "frame-ancestors 'none'; "
                "object-src 'none';"
            )
            print('CSP updated!')
            print(h['value'])

with open('vercel.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Done!')
