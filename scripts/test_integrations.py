import urllib.request
import urllib.parse
import json
import time
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3005"

def run_tests():
    print("=== Testing GOEURO Multi-Channel Live Ingestion Connectors ===")
    
    # 1. Test Google Form Webhook
    print("\n[1] Testing Google Form Webhook Endpoint (/api/integrations/google-form)...")
    gf_payload = {
        "Full Name": "Ko Aung Kyaw Test",
        "Phone Number": "+959111222333",
        "Viber/Telegram": "@aungkyaw_de",
        "Email": "aungkyaw.test@example.com",
        "Interested Pathway": "Ausbildung Nursing",
        "Current German Level": "B1",
        "Education Background": "High School Passed 2023",
        "Budget": "5000 EUR",
        "Notes": "Looking for October 2026 intake Ausbildung in Hamburg"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/integrations/google-form",
        data=json.dumps(gf_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 201, f"Expected 201, got {res.status}"
        data = json.loads(res.read().decode('utf-8'))
        assert data.get("success") is True, "Expected success=True"
        assert "leadId" in data and data["leadId"] is not None
        gf_lead_id = data["leadId"]
        print(f"  ✓ Google Form Lead Ingested Successfully: ID {gf_lead_id}, Counselor: {data.get('assignedCounselor')}")

    # 2. Test Facebook Webhook Handshake (GET)
    print("\n[2] Testing Facebook Webhook Handshake Verification (GET)...")
    params = urllib.parse.urlencode({
        "hub.mode": "subscribe",
        "hub.verify_token": "goeuro_fb_verify_token_2026",
        "hub.challenge": "9876543210"
    })
    req = urllib.request.Request(f"{BASE_URL}/api/integrations/facebook?{params}")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        body = res.read().decode('utf-8')
        assert body == "9876543210", f"Expected challenge string '9876543210', got {body}"
        print("  ✓ Facebook Webhook Handshake Verified (hub.challenge returned correctly)")

    # 3. Test Facebook Lead Ingestion (POST)
    print("\n[3] Testing Facebook Lead Ads Ingestion (POST)...")
    fb_payload = {
        "object": "page",
        "entry": [{
            "id": "100293848",
            "time": 1726617600,
            "changes": [{
                "field": "leadgen",
                "value": {
                    "leadgen_id": "fb_lead_test_001",
                    "ad_id": "ad_ausbildung_2026",
                    "form_id": "form_germany_study",
                    "full_name": "Ma Su Mon FB Test",
                    "phone_number": "+959987654321",
                    "email": "sumon.test@example.com",
                    "pathway": "Public University Master",
                    "german_level": "A2"
                }
            }]
        }]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/integrations/facebook",
        data=json.dumps(fb_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 201, f"Expected 201, got {res.status}"
        data = json.loads(res.read().decode('utf-8'))
        assert data.get("success") is True
        assert "leadId" in data
        print(f"  ✓ Facebook Lead Ads Ingested: ID {data.get('leadId')}")

    # 4. Test TikTok Lead Ingestion (POST)
    print("\n[4] Testing TikTok Bio & Ad Ingestion (POST)...")
    tt_payload = {
        "event": "lead_submission",
        "lead_id": "tt_lead_test_002",
        "campaign_id": "hamburg_student_pov_2026",
        "name": "Zin Min Thu TikTok Test",
        "phone": "+959445566778",
        "viber": "+959445566778",
        "pathway": "Ausbildung IT Specialist",
        "german_level": "A1",
        "source_video": "tiktok.com/@goeuro_de/video/73918239"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/integrations/tiktok",
        data=json.dumps(tt_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 201, f"Expected 201, got {res.status}"
        data = json.loads(res.read().decode('utf-8'))
        assert data.get("success") is True
        assert "leadId" in data
        tt_lead_id = data["leadId"]
        print(f"  ✓ TikTok Lead Ingested: ID {tt_lead_id}, Counselor: {data.get('assignedCounselor')}")

    # 5. Test Live Webhook Endpoint (POST)
    print("\n[5] Testing Universal Live Webhook Endpoint (/api/integrations/live-webhook)...")
    live_payload = {
        "fullName": "Kyaw Swar Live Webhook Test",
        "contactHandle": "+959778899001",
        "preferredContact": "VIBER",
        "interestedPathway": "Ausbildung",
        "germanLevel": "B2",
        "notes": "Direct live webhook from Zapier Facebook Leads bridge"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/integrations/live-webhook",
        data=json.dumps(live_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 201, f"Expected 201, got {res.status}"
        data = json.loads(res.read().decode('utf-8'))
        assert data.get("success") is True
        assert "leadId" in data
        live_lead_id = data["leadId"]
        print(f"  ✓ Live Universal Webhook Ingested: ID {live_lead_id}")

    # 6. Test Ingestion Logs Query
    print("\n[6] Testing Real-Time Ingestion Logs Feed (/api/integrations/logs)...")
    req = urllib.request.Request(f"{BASE_URL}/api/integrations/logs")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        data = json.loads(res.read().decode('utf-8'))
        assert "logs" in data
        assert "stats" in data
        print(f"  ✓ Ingestion Logs Returned: {len(data['logs'])} entries")
        print(f"  ✓ Metrics by Channel: {data['stats']}")
        assert data.get("totalCount", 0) >= 4, "Expected at least 4 ingestion events recorded"

    # 7. Verify Lead Channels in CRM (Authenticated)
    print("\n[7] Verifying Ingested Lead Channels in CRM (/api/leads)...")
    # First authenticate as Admin THN
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

    req = urllib.request.Request(
        f"{BASE_URL}/api/leads",
        headers={'Cookie': auth_cookie} if auth_cookie else {}
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        leads = json.loads(res.read().decode('utf-8'))
        by_channel = {}
        for l in leads:
            c = l.get("channel", "WEB")
            by_channel[c] = by_channel.get(c, 0) + 1
        print(f"  ✓ CRM Leads by Channel: {by_channel}")
        assert by_channel.get("GOOGLE_FORM", 0) >= 1, "Expected GOOGLE_FORM lead in CRM"
        assert by_channel.get("FACEBOOK", 0) >= 1, "Expected FACEBOOK lead in CRM"
        assert by_channel.get("TIKTOK", 0) >= 1, "Expected TIKTOK lead in CRM"
        assert by_channel.get("LIVE_WEBHOOK", 0) >= 1, "Expected LIVE_WEBHOOK lead in CRM"

    print("\n=======================================================")
    print("🎉 ALL MULTI-CHANNEL LIVE INGESTION TESTS PASSED 100%! 🎉")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
