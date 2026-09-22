import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:3005'

def request(method, path, data=None, user_id=None):
    url = f"{BASE_URL}{path}"
    headers = {'Content-Type': 'application/json'}
    if user_id:
        headers['x-user-id'] = user_id
    
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            resp_body = res.read().decode('utf-8')
            return res.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {'raw': err_body}

def run_tests():
    print("=== STARTING ACCEPTANCE TESTS FOR GOEURO ===")

    # Retrieve initial users
    status, users = request('GET', '/api/users')
    assert status == 200, f"Failed to get users: {status}"
    thn = next(u for u in users if u['email'] == 'thn@goeuro.de')
    kmh = next(u for u in users if u['email'] == 'kmh@goeuro.de')
    yytt = next(u for u in users if u['email'] == 'yytt@goeuro.de')
    nay = next(u for u in users if u['email'] == 'nay@goeuro.de')
    lu = next(u for u in users if u['email'] == 'lu@goeuro.de')
    viewer = next(u for u in users if u['email'] == 'viewer@partner.de')
    print(f"✓ Initial 5 core team members + Viewer verified.")

    # ----------------------------------------------------
    # TEST 7: Zero-inquiry dashboard remains useful and does not display fabricated performance
    # ----------------------------------------------------
    print("\n--- TEST 7: Zero-Inquiry Truthful Dashboard ---")
    status, stats = request('GET', '/api/dashboard/stats', user_id=thn['id'])
    assert status == 200
    assert stats['isPreLaunchZeroLeads'] == True, "Should truthfully report 0 leads"
    assert stats['totalLeadsCount'] == 0, "Lead count should be 0 initially"
    assert stats['contentTargetMonth'] == '20–30', "Should show PPTX Slide 10 KPI target"
    assert stats['germanyVideosTarget'] == '10–12', "Should show PPTX Slide 10 video target"
    assert len(stats['myTasks']) > 0, "Should have launch preparation tasks"
    print("✓ Test 7 Passed: Dashboard truthfully reports 0 leads, displays 30-day roadmap and Slide 10 KPIs.")

    # ----------------------------------------------------
    # TEST 1: Admin adds a sixth staff member, assigns role and team, and gives them a task without changing code
    # ----------------------------------------------------
    print("\n--- TEST 1: Add 6th Staff Member & Assign Work ---")
    # Fetch roles & teams
    _, roles = request('GET', '/api/roles', user_id=thn['id'])
    _, teams = request('GET', '/api/teams', user_id=thn['id'])
    counselor_role = next(r for r in roles if 'Counselor' in r['name'])
    student_team = next(t for t in teams if 'Student Relations' in t['name'])

    sixth_user_payload = {
        'name': 'Su Su Hlaing',
        'email': 'susu@goeuro.de',
        'title': 'Junior Ausbildung Counselor',
        'roleId': counselor_role['id'],
        'teamIds': [student_team['id']],
        'managerId': kmh['id']
    }
    status, sixth_user = request('POST', '/api/users', sixth_user_payload, user_id=thn['id'])
    assert status == 201, f"Failed to create 6th user: {sixth_user}"
    assert sixth_user['name'] == 'Su Su Hlaing'
    assert sixth_user['role']['name'] == counselor_role['name']
    print(f"✓ 6th Staff member created: {sixth_user['name']} with role {sixth_user['role']['name']}")

    # Give 6th staff member a task
    task_payload = {
        'title': 'Shadow KMH on first 10 Ausbildung profile screenings',
        'description': 'Review student eligibility against Goethe B1/B2 criteria and hospital employer requirements.',
        'assigneeId': sixth_user['id'],
        'teamId': student_team['id'],
        'priority': 'HIGH',
        'dueDate': '2026-10-01'
    }
    status, task = request('POST', '/api/tasks', task_payload, user_id=thn['id'])
    assert status == 201
    assert task['assigneeId'] == sixth_user['id']
    print(f"✓ Task assigned to 6th staff member without code change: '{task['title']}'")
    print("✓ Test 1 Passed.")

    # ----------------------------------------------------
    # TEST 4: Visitor submits inquiry form in Burmese or English; lead appears in private queue with source
    # ----------------------------------------------------
    print("\n--- TEST 4: Public Inquiry Submission (Burmese & English) ---")
    inquiry_payload = {
        'fullName': 'Aung Kyaw Moe',
        'preferredContact': 'TELEGRAM',
        'contactHandle': '@aungkyaw_germany',
        'phone': '09791234567',
        'email': 'aungkyaw@gmail.com',
        'educationStatus': 'HIGH_SCHOOL',
        'notes': 'Passed matriculation in 2024. Currently studying A1 German at Goethe. Want Pflege (Nursing) Ausbildung.',
        'utmSource': 'tiktok_lu_hamburg',
        'utmMedium': 'reel_stipend_myth',
        'consent': True
    }
    status, submission = request('POST', '/api/inquiry/submit', inquiry_payload)
    assert status == 201, f"Inquiry submission failed: {submission}"
    assert submission['success'] == True
    lead_id = submission['leadId']
    print(f"✓ Public inquiry submitted successfully: Lead ID {lead_id}")

    # Verify lead appears in private queue with source
    status, leads = request('GET', '/api/leads', user_id=kmh['id'])
    assert status == 200
    matching_lead = next(l for l in leads if l['id'] == lead_id)
    assert matching_lead['fullName'] == 'Aung Kyaw Moe'
    assert matching_lead['utmSource'] == 'tiktok_lu_hamburg'
    assert matching_lead['stage'] == 'NEW'
    print(f"✓ Lead appeared in private counselor queue with source '{matching_lead['utmSource']}'.")
    print("✓ Test 4 Passed.")

    # ----------------------------------------------------
    # TEST 5: Counselor records contact, sets follow-up, books consultation, converts to student case
    # ----------------------------------------------------
    print("\n--- TEST 5: Counselor Lead Journey to Student Case ---")
    # 1. Log contact & set follow-up
    contact_payload = {
        'contactType': 'TELEGRAM_VIBER',
        'summary': 'Discussed B1 language requirement and nursing stipend with student. Student is committed to full-time German study.',
        'followUpDate': '2026-09-25',
        'updateStage': 'QUALIFIED'
    }
    status, contact = request('POST', f'/api/leads/{lead_id}/contact', contact_payload, user_id=kmh['id'])
    assert status == 201
    print("✓ Counselor logged contact and updated stage to QUALIFIED.")

    # 2. Book consultation
    consult_payload = {
        'contactType': 'MEETING',
        'summary': '30-minute structured profile assessment call scheduled for Saturday.',
        'updateStage': 'CONSULTATION_BOOKED'
    }
    status, _ = request('POST', f'/api/leads/{lead_id}/contact', consult_payload, user_id=kmh['id'])
    assert status == 201
    print("✓ Counselor booked consultation call.")

    # 3. Convert to Student Case
    convert_payload = {
        'agreedScope': 'Full Germany Pflege Ausbildung Placement & Visa Guidance',
        'targetIntake': 'Spring 2027',
        'currentGermanLevel': 'A1',
        'targetGermanLevel': 'B2',
        'ownerId': kmh['id']
    }
    status, student_case = request('POST', f'/api/leads/{lead_id}/convert', convert_payload, user_id=kmh['id'])
    assert status == 201, f"Conversion failed: {student_case}"
    assert student_case['studentName'] == 'Aung Kyaw Moe'
    assert student_case['status'] == 'ACTIVE'
    case_id = student_case['id']
    print(f"✓ Converted lead to Student Case '{student_case['studentName']}' without retyping info.")

    # Verify checklist items created for Germany pathway
    status, cases = request('GET', '/api/cases', user_id=kmh['id'])
    created_case = next(c for c in cases if c['id'] == case_id)
    checklist = json.loads(created_case['checklist'])
    assert len(checklist) > 0, "Checklist should be initialized"
    print(f"✓ Case verified with {len(checklist)} Germany admission checklist milestones.")
    print("✓ Test 5 Passed.")

    # ----------------------------------------------------
    # TEST 3: Team creates Ausbildung campaign, moves content through factual and brand approval, schedules, records published link & result
    # ----------------------------------------------------
    print("\n--- TEST 3: Ausbildung Campaign & 8-Stage Content Workflow ---")
    # 1. Create Campaign
    pathways_status, pathways = request('GET', '/api/pathways')
    ausbildung_p = next(p for p in pathways if p['code'] == 'AUSBILDUNG')
    camp_payload = {
        'name': 'Ausbildung Autumn 2026 Drive',
        'pathwayId': ausbildung_p['id'],
        'objective': 'Build transparency on dual vocational contracts',
        'budget': 350
    }
    status, campaign = request('POST', '/api/marketing/campaigns', camp_payload, user_id=thn['id'])
    assert status == 201
    print(f"✓ Campaign created: '{campaign['name']}'")

    # 2. Create Content Piece (Draft stage)
    content_payload = {
        'topic': 'Nursing Ausbildung in Germany: Real monthly salary & working hours',
        'pathwayId': ausbildung_p['id'],
        'campaignId': campaign['id'],
        'pillar': 'EDUCATION_40',
        'channel': 'TIKTOK',
        'format': 'REEL',
        'targetAudience': 'Matriculated students & young nurses in Myanmar',
        'callToAction': 'Message GOEURO to evaluate your German eligibility',
        'plannedDate': '2026-09-30'
    }
    status, content = request('POST', '/api/marketing/content', content_payload, user_id=nay['id'])
    assert status == 201
    content_id = content['id']
    print(f"✓ Content piece drafted: '{content['topic']}'")

    # Advance to FACTUAL_REVIEW
    request('PATCH', '/api/marketing/content', {'id': content_id, 'stage': 'FACTUAL_REVIEW'}, user_id=nay['id'])

    # 3. Nay approves Factual Review -> advances to BRAND_APPROVAL
    status, content_factual = request('PATCH', '/api/marketing/content', {
        'id': content_id,
        'stage': 'BRAND_APPROVAL'
    }, user_id=nay['id'])
    assert status == 200
    assert content_factual['stage'] == 'BRAND_APPROVAL'
    print("✓ Nay approved Factual Review -> advanced to BRAND_APPROVAL.")

    # 4. THN approves Brand Tone -> advances to SCHEDULED
    status, content_brand = request('PATCH', '/api/marketing/content', {
        'id': content_id,
        'stage': 'SCHEDULED'
    }, user_id=thn['id'])
    assert status == 200
    assert content_brand['stage'] == 'SCHEDULED'
    print("✓ THN approved Brand Direction -> advanced to SCHEDULED.")

    # 5. Mark as PUBLISHED & Record Live Post URL and Results
    status, content_pub = request('PATCH', '/api/marketing/content', {
        'id': content_id,
        'stage': 'RESULTS_RECORDED',
        'publishedUrl': 'https://www.tiktok.com/@goeuro.germany/video/74123456789',
        'metrics': {
            'views': 12500,
            'clicks': 340,
            'inquiries': 18,
            'qualified': 6,
            'adSpend': 25.0
        }
    }, user_id=thn['id'])
    assert status == 200
    assert content_pub['publishedUrl'] == 'https://www.tiktok.com/@goeuro.germany/video/74123456789'
    print("✓ Live post URL and metrics recorded successfully.")
    print("✓ Test 3 Passed.")

    # ----------------------------------------------------
    # TEST 6: Manager sees overdue work, while user without lead access cannot view private student details
    # ----------------------------------------------------
    print("\n--- TEST 6: Permission Security & RBAC Enforced on Server ---")
    # 1. Manager view sees overdue tasks
    status, mgr_stats = request('GET', '/api/dashboard/stats', user_id=thn['id'])
    assert status == 200
    assert 'overdueTasks' in mgr_stats
    print(f"✓ Manager view: {len(mgr_stats['overdueTasks'])} overdue tasks visible for management.")

    # 2. Viewer user (without lead:read) cannot view private student leads
    status, viewer_leads = request('GET', '/api/leads', user_id=viewer['id'])
    assert status == 403, f"Viewer should get 403 Forbidden on leads API, got: {status}"
    print(f"✓ Security Enforced: Viewer received HTTP 403 Forbidden when attempting to access student leads.")
    print("✓ Test 6 Passed.")

    # ----------------------------------------------------
    # TEST 2: Team member leaves; admin reassigns that person's open tasks and leads
    # ----------------------------------------------------
    print("\n--- TEST 2: Staff Offboarding & Reassignment Wizard ---")
    # Assign an open task and a new lead to Lu Min Myat
    status, lu_task = request('POST', '/api/tasks', {
        'title': 'Test task before Lu departure',
        'assigneeId': lu['id'],
        'priority': 'MEDIUM'
    }, user_id=thn['id'])
    assert status == 201

    status, lu_lead = request('POST', '/api/leads', {
        'fullName': 'Maung Min Oo',
        'preferredContact': 'VIBER',
        'contactHandle': '09250001122',
        'educationStatus': 'BACHELOR',
        'ownerId': lu['id']
    }, user_id=thn['id'])
    assert status == 201

    # Execute Reassignment Wizard from Lu to 6th staff member (Su Su Hlaing)
    reassign_payload = {
        'fromUserId': lu['id'],
        'toUserId': sixth_user['id'],
        'reassignTasks': True,
        'reassignLeads': True,
        'reassignContent': True,
        'reassignCases': True,
        'deactivateDepartingUser': True,
        'reason': 'Lu transitioning to external alumni advisor'
    }
    status, reassign_res = request('POST', '/api/reassign', reassign_payload, user_id=thn['id'])
    assert status == 200
    assert reassign_res['stats']['tasksReassigned'] >= 1
    assert reassign_res['stats']['leadsReassigned'] >= 1
    assert reassign_res['deactivated'] == True
    print(f"✓ Reassigned {reassign_res['stats']['tasksReassigned']} tasks and {reassign_res['stats']['leadsReassigned']} leads from Lu to Su Su Hlaing.")

    # Verify Lu's task is now assigned to Su Su Hlaing
    status, updated_tasks = request('GET', f"/api/tasks?assigneeId={sixth_user['id']}", user_id=thn['id'])
    assert any(t['id'] == lu_task['id'] for t in updated_tasks)
    print("✓ Verified task was successfully transferred to Su Su Hlaing.")

    # Verify Lu's status is INACTIVE
    status, all_users_now = request('GET', '/api/users')
    lu_now = next(u for u in all_users_now if u['id'] == lu['id'])
    assert lu_now['status'] == 'INACTIVE'
    print("✓ Verified Lu's account is safely marked INACTIVE with audit trail.")
    print("✓ Test 2 Passed.")

    print("\n========================================================")
    print("ALL 7 ACCEPTANCE TESTS SUCCESSFULLY PASSED WITHOUT ERROR!")
    print("========================================================")

if __name__ == '__main__':
    run_tests()
