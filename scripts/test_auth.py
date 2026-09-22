import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

base = 'http://localhost:3005'

# 1. Test wrong password
req = urllib.request.Request(
    f'{base}/api/auth/login',
    data=json.dumps({'email': 'thn@goeuro.de', 'password': 'wrongpassword'}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    urllib.request.urlopen(req)
    print('FAIL: Expected 401 for wrong password')
    sys.exit(1)
except urllib.error.HTTPError as e:
    assert e.code == 401
    print(f'PASS: Wrong password returned HTTP {e.code}')

# 2. Test correct credentials
req = urllib.request.Request(
    f'{base}/api/auth/login',
    data=json.dumps({'email': 'thn@goeuro.de', 'password': 'Goeuro2026!'}).encode(),
    headers={'Content-Type': 'application/json'}
)
res = urllib.request.urlopen(req)
cookie = res.headers.get('Set-Cookie')
data = json.loads(res.read().decode())
assert res.status == 200
assert data['user']['email'] == 'thn@goeuro.de'
assert 'goeuro_user_id' in cookie
print(f"PASS: Valid login returned user {data['user']['name']} ({data['user']['role']['name']})")
print(f"PASS: Session cookie set correctly: {cookie[:60]}...")

# 3. Test /api/auth/me with cookie
cookie_val = cookie.split(';')[0]
req = urllib.request.Request(f'{base}/api/auth/me', headers={'Cookie': cookie_val})
res = urllib.request.urlopen(req)
me_data = json.loads(res.read().decode())
assert me_data['user']['email'] == 'thn@goeuro.de'
print(f"PASS: /api/auth/me successfully validated session for {me_data['user']['name']}")

# 4. Test 1-click quick demo login for Counselor KMH
req = urllib.request.Request(
    f'{base}/api/users',
    headers={'Cookie': cookie_val}
)
users = json.loads(urllib.request.urlopen(req).read().decode())
kmh = next(u for u in users if u['email'] == 'kmh@goeuro.de')

req = urllib.request.Request(
    f'{base}/api/auth/login',
    data=json.dumps({'isDemo': True, 'userId': kmh['id']}).encode(),
    headers={'Content-Type': 'application/json'}
)
res = urllib.request.urlopen(req)
demo_data = json.loads(res.read().decode())
assert demo_data['user']['email'] == 'kmh@goeuro.de'
print(f"PASS: 1-Click demo login succeeded for {demo_data['user']['name']}")

# 5. Test logout
req = urllib.request.Request(f'{base}/api/auth/logout', data=b'{}', headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
assert res.status == 200
print(f"PASS: Logout succeeded with HTTP {res.status}")

print("\nALL AUTHENTICATION INTEGRATION TESTS PASSED!")
