import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:3005'

def post_json(path, data):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as res:
        return res.status, json.loads(res.read().decode('utf-8'))

def get_json(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={'Content-Type': 'application/json'}, method='GET')
    with urllib.request.urlopen(req) as res:
        return res.status, json.loads(res.read().decode('utf-8'))

def test_meeting_signaling():
    print("=== Testing In-House WebRTC Consultation Signaling API ===")
    room_id = 'test-room-consult-101'

    # 1. Counselor joins
    status, res = post_json('/api/meeting/signal', {
        'roomId': room_id,
        'role': 'counselor',
        'action': 'join'
    })
    assert status == 200 and res['success'] == True
    print("✓ Counselor joined room successfully")

    # 2. Student joins
    status, res = post_json('/api/meeting/signal', {
        'roomId': room_id,
        'role': 'student',
        'action': 'join'
    })
    assert status == 200 and res['studentActive'] == True
    print("✓ Student joined room successfully")

    # 3. Counselor sends SDP Offer
    status, res = post_json('/api/meeting/signal', {
        'roomId': room_id,
        'role': 'counselor',
        'action': 'signal',
        'payload': {
            'type': 'offer',
            'data': {'type': 'offer', 'sdp': 'v=0\r\no=- 461173 2 IN IP4 127.0.0.1...'}
        }
    })
    assert status == 200 and res['success'] == True
    print("✓ Counselor SDP offer sent successfully")

    # 4. Student polls for signals
    status, res = get_json(f'/api/meeting/signal?roomId={room_id}&role=student&since=0')
    assert status == 200
    assert any(m['type'] == 'offer' for m in res['messages'])
    print(f"✓ Student received {len(res['messages'])} relayed signal(s), including WebRTC SDP offer")

    # 5. Student sends SDP Answer
    status, res = post_json('/api/meeting/signal', {
        'roomId': room_id,
        'role': 'student',
        'action': 'signal',
        'payload': {
            'type': 'answer',
            'data': {'type': 'answer', 'sdp': 'v=0\r\no=- 461174 2 IN IP4 127.0.0.1...'}
        }
    })
    assert status == 200 and res['success'] == True
    print("✓ Student SDP answer sent successfully")

    # 6. Counselor polls and receives SDP Answer
    status, res = get_json(f'/api/meeting/signal?roomId={room_id}&role=counselor&since=0')
    assert status == 200
    assert any(m['type'] == 'answer' for m in res['messages'])
    print(f"✓ Counselor received relayed WebRTC SDP answer")

    # 7. Student leaves
    status, res = post_json('/api/meeting/signal', {
        'roomId': room_id,
        'role': 'student',
        'action': 'leave'
    })
    assert status == 200 and res['success'] == True
    print("✓ Student left room cleanly")

    print("\n🎉 ALL IN-HOUSE WEBRTC SIGNALING TESTS PASSED 100%! 🎉")

if __name__ == '__main__':
    test_meeting_signaling()
