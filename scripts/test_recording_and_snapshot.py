import os
import sys
import json
import base64
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3005"

# Sample 1x1 transparent red PNG in base64
SAMPLE_BASE64_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

def run_tests():
    print("=== Testing Consultation Recording & Auto-Snapshot APIs ===")

    # 1. Authenticate as THN (Admin)
    print("\n[1] Authenticating as Admin (THN)...")
    login_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=json.dumps({"email": "thn@goeuro.de", "password": "Goeuro2026!"}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    auth_cookie = None
    with urllib.request.urlopen(login_req) as res:
        assert res.status == 200
        set_cookie = res.headers.get('Set-Cookie')
        if set_cookie:
            auth_cookie = set_cookie.split(';')[0]
    print(f"  ✓ Authenticated successfully with session cookie")

    # 2. Fetch leads
    req = urllib.request.Request(
        f"{BASE_URL}/api/leads",
        headers={'Cookie': auth_cookie} if auth_cookie else {}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            leads = json.loads(resp.read().decode())
    except Exception as e:
        print(f"Failed to fetch leads: {e}")
        sys.exit(1)

    if not leads or len(leads) == 0:
        print("No leads found in DB.")
        sys.exit(1)

    test_lead = leads[0]
    test_lead_id = test_lead["id"]
    print(f"  ✓ Target Student Lead: {test_lead['fullName']} ({test_lead_id})")

    # 3. Test Attendance Snapshot API (Auto SS Trigger)
    print("\n[2] Testing Attendance Snapshot API (/api/meeting/snapshot)...")
    snapshot_payload = json.dumps({
        "image": SAMPLE_BASE64_IMAGE,
        "leadId": test_lead_id,
        "roomId": f"consult-{test_lead_id}",
        "triggerType": "AUTO"
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/meeting/snapshot",
        data=snapshot_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected status 200, got {resp.status}"
        snap_data = json.loads(resp.read().decode())
        assert snap_data["success"] is True
        assert "fileUrl" in snap_data
        print(f"  ✓ Snapshot successfully uploaded: {snap_data['fileUrl']}")

    # 4. Test Consultation Recording API (/api/meeting/recordings)
    print("\n[3] Testing Consultation Recording Upload API (/api/meeting/recordings)...")
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    
    # Add file part
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="file"; filename="test_recording.webm"\r\n')
    body.extend(b'Content-Type: video/webm\r\n\r\n')
    body.extend(b'\x1a\x45\xdf\xa3\x01\x00\x00\x00dummy_webm_bytes_for_testing\r\n')
    
    # Add roomId part
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="roomId"\r\n\r\n')
    body.extend(f"consult-{test_lead_id}\r\n".encode("utf-8"))

    # Add leadId part
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="leadId"\r\n\r\n')
    body.extend(f"{test_lead_id}\r\n".encode("utf-8"))

    # Add duration part
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="duration"\r\n\r\n')
    body.extend(b'185\r\n')

    # Add notes part
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="notes"\r\n\r\n')
    body.extend(b'Automated verification test recording\r\n')
    
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        f"{BASE_URL}/api/meeting/recordings",
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected status 200, got {resp.status}"
        rec_data = json.loads(resp.read().decode())
        assert rec_data["success"] is True
        assert "recording" in rec_data
        print(f"  ✓ Video Recording archived: {rec_data['recording']['fileUrl']} (Duration: {rec_data['recording']['duration']}s)")

    # 5. Verify Lead CRM Record has both Snapshot & Recording
    print("\n[4] Verifying Lead CRM Record with Snapshot & Recording...")
    req = urllib.request.Request(
        f"{BASE_URL}/api/leads",
        headers={'Cookie': auth_cookie} if auth_cookie else {}
    )
    with urllib.request.urlopen(req) as resp:
        leads = json.loads(resp.read().decode())
        target_lead = next((l for l in leads if l["id"] == test_lead_id), None)
        assert target_lead is not None, "Target lead not found in CRM"
        assert target_lead.get("consultationSnapshotUrl") is not None, "consultationSnapshotUrl not populated"
        assert len(target_lead.get("recordings", [])) > 0, "No recordings found on target lead"
        print(f"  ✓ Lead verification passed:")
        print(f"    - Snapshot Proof URL: {target_lead['consultationSnapshotUrl']}")
        print(f"    - Archived Recordings Count: {len(target_lead['recordings'])}")

    print("\n🎉 ALL ONLINE RECORDING & AUTO-SNAPSHOT TESTS PASSED 100%! 🎉")

if __name__ == "__main__":
    run_tests()
