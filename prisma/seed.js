const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

const DEFAULT_PASSWORD_HASH = hashPassword('Goeuro2026!');

async function main() {
  console.log('Seeding GOEURO database...');

  // 0. Clean previous data for idempotent repeat seeding
  await prisma.caseHandover.deleteMany({});
  await prisma.caseMilestone.deleteMany({});
  await prisma.caseDocument.deleteMany({});
  await prisma.studentCase.deleteMany({});
  await prisma.leadContactHistory.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.contentItem.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.knowledgeItem.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.ingestionLog.deleteMany({});
  await prisma.userTeam.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.pathway.deleteMany({});

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'goeuro' },
    update: {},
    create: {
      name: 'GOEURO Education Agency',
      slug: 'goeuro',
      settings: JSON.stringify({
        defaultLanguage: 'en',
        preLaunchMode: true,
        supportedLanguages: ['en', 'my'],
        currency: 'EUR',
      }),
    },
  });

  console.log('Organization created:', org.name);

  // 2. Create Roles (The 3 Governance Profiles)
  const founderRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: 'Founder',
      description: 'Supreme Executive & Visionary Governance with unrestricted access',
      isSystem: true,
      permissions: JSON.stringify(['*']),
    },
  });

  const superAdminRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: 'Super Admin',
      description: 'System Administrator with full platform controls, security, and team management',
      isSystem: true,
      permissions: JSON.stringify(['*']),
    },
  });

  const consultantRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: 'Consultant & Management',
      description: 'Educational Counselors, Case Managers & Department Coordinators handling student admissions and consultations',
      isSystem: true,
      permissions: JSON.stringify([
        'task:read', 'task:write', 'task:assign',
        'content:read', 'content:write', 'content:factual_review', 'content:brand_approve',
        'lead:read', 'lead:write',
        'case:read', 'case:write',
        'knowledge:read', 'knowledge:write',
        'report:view', 'team:manage'
      ]),
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: 'Viewer (Restricted)',
      description: 'Read-only access to general tasks and knowledge. Cannot view private leads or student cases',
      isSystem: true,
      permissions: JSON.stringify([
        'task:read',
        'knowledge:read'
      ]),
    },
  });

  const marketingRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: 'Marketing Member',
      description: 'Content creator, videographer, and community manager',
      isSystem: true,
      permissions: JSON.stringify([
        'task:read', 'task:write',
        'content:read', 'content:write',
        'knowledge:read'
      ]),
    },
  });

  // 3. Create Pathways
  const ausbildungPathway = await prisma.pathway.create({
    data: {
      orgId: org.id,
      name: 'Germany Ausbildung (Vocational Training)',
      code: 'AUSBILDUNG',
      description: 'Dual vocational education program in Germany with paid monthly stipend and job contract.',
      checklists: JSON.stringify([
        { id: 'c1', label: 'B1 / B2 German Language Certificate (Goethe/ÖSD/telc)', category: 'LANGUAGE' },
        { id: 'c2', label: 'High School / Matriculation Certificate & Translation', category: 'ACADEMIC_DOCS' },
        { id: 'c3', label: 'German Format Tabellarischer Lebenslauf (CV)', category: 'ACADEMIC_DOCS' },
        { id: 'c4', label: 'Anschreiben (German Motivation Letter)', category: 'ACADEMIC_DOCS' },
        { id: 'c5', label: 'Signed Ausbildung Training Contract (Ausbildungsvertrag)', category: 'CONTRACT' },
        { id: 'c6', label: 'German Health Insurance & Visa Application', category: 'VISA' },
      ]),
    },
  });

  const uniPathway = await prisma.pathway.create({
    data: {
      orgId: org.id,
      name: 'Germany Public University (Bachelor / Master)',
      code: 'PUBLIC_UNIVERSITY',
      description: 'Tuition-free higher education at state-recognized German universities.',
      checklists: JSON.stringify([
        { id: 'u1', label: 'Academic Transcripts & Degree Verification', category: 'ACADEMIC_DOCS' },
        { id: 'u2', label: 'Language Proficiency (German TestDaF/DSH or English IELTS)', category: 'LANGUAGE' },
        { id: 'u3', label: 'APS Certificate (if applicable)', category: 'ACADEMIC_DOCS' },
        { id: 'u4', label: 'uni-assist VPD / University Direct Application', category: 'APPLICATION' },
        { id: 'u5', label: 'University Admission Letter (Zulassungsbescheid)', category: 'APPLICATION' },
        { id: 'u6', label: 'Sperrkonto (Blocked Account) & Student Visa', category: 'VISA' },
      ]),
    },
  });

  // 4. Create Users (3 Profile Tiers: Founder, Super Admin, Consultant & Management)
  const thn = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Thet Htoo Naing',
      email: 'thn@goeuro.de',
      title: 'Founder and Growth Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleId: founderRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'System Admin',
      email: 'admin@goeuro.de',
      title: 'Super Administrator & IT Systems',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      roleId: superAdminRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
    },
  });

  const kmh = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Kaung Myat Htine',
      email: 'kmh@goeuro.de',
      title: 'Student Journey and Case Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      roleId: consultantRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
      managerId: thn.id,
    },
  });

  const yytt = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Ye Yint Tun Thant',
      email: 'yytt@goeuro.de',
      title: 'Campaign Operations Coordinator',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      roleId: consultantRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
      managerId: thn.id,
    },
  });

  const nay = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Nay Myo Thiha',
      email: 'nay@goeuro.de',
      title: 'Ausbildung Pathway Specialist',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      roleId: consultantRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
      managerId: thn.id,
    },
  });

  const lu = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Lu Min Myat',
      email: 'lu@goeuro.de',
      title: 'Germany Experience and Content Lead',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      roleId: consultantRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
      managerId: yytt.id,
    },
  });

  const susu = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Su Su Hlaing',
      email: 'susu@goeuro.de',
      title: 'Admissions Counselor & Student Advisor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      roleId: consultantRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
      managerId: thn.id,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'External Observer',
      email: 'viewer@partner.de',
      title: 'External Advisory Viewer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      roleId: viewerRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
    },
  });

  // 5. Create Teams
  const marketingTeam = await prisma.team.create({
    data: {
      orgId: org.id,
      name: 'Marketing & Growth',
      description: 'Brand direction, video production, paid distribution, hooks, and growth analytics.',
      managerId: thn.id,
    },
  });

  const studentRelationsTeam = await prisma.team.create({
    data: {
      orgId: org.id,
      name: 'Student Relations & Admissions',
      description: 'Inquiry response, qualification screening, 1-on-1 consultations, and student case progression.',
      managerId: kmh.id,
    },
  });

  const operationsTeam = await prisma.team.create({
    data: {
      orgId: org.id,
      name: 'Operations & Coordination',
      description: 'Content calendar management, deadline enforcement, SOPs, and cross-team coordination.',
      managerId: yytt.id,
    },
  });

  const pathwayTeam = await prisma.team.create({
    data: {
      orgId: org.id,
      name: 'Pathway Specialists',
      description: 'Eligibility verification, German school/employer requirements, and academic fact-checking.',
      managerId: nay.id,
    },
  });

  // Assign Users to Teams (Users can belong to multiple teams)
  await prisma.userTeam.createMany({
    data: [
      { userId: thn.id, teamId: marketingTeam.id },
      { userId: thn.id, teamId: operationsTeam.id },
      { userId: kmh.id, teamId: studentRelationsTeam.id },
      { userId: yytt.id, teamId: operationsTeam.id },
      { userId: yytt.id, teamId: marketingTeam.id },
      { userId: nay.id, teamId: pathwayTeam.id },
      { userId: nay.id, teamId: marketingTeam.id },
      { userId: lu.id, teamId: marketingTeam.id },
    ],
  });

  // 6. Create Campaigns
  const ausbildungCamp = await prisma.campaign.create({
    data: {
      orgId: org.id,
      name: 'Ausbildung 2026 Awareness & Trust Launch',
      pathwayId: ausbildungPathway.id,
      objective: 'Establish GOEURO as the transparent authority on Germany dual vocational training in Myanmar.',
      budget: 350,
      status: 'ACTIVE',
    },
  });

  const uniCamp = await prisma.campaign.create({
    data: {
      orgId: org.id,
      name: 'Public University Summer 2026 Drive',
      pathwayId: uniPathway.id,
      objective: 'Showcase tuition-free Hamburg student reality and recruit qualified Bachelor/Master applicants.',
      budget: 250,
      status: 'ACTIVE',
    },
  });

  // 7. Create Pre-Launch Launch Tasks (From PPTX Slide 9 & 12)
  await prisma.task.createMany({
    data: [
      {
        orgId: org.id,
        title: 'Finalize Ausbildung & Public University FAQ & Service Scope',
        description: 'Complete official offer descriptions, criteria, and consultation boundaries without overpromising.',
        assigneeId: kmh.id,
        teamId: studentRelationsTeam.id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: org.id,
        title: 'Build first Ausbildung topic bank (15–20 researched topics)',
        description: 'Fact-checked occupations, stipend rates, B1/B2 expectations, and common agency scams to expose.',
        assigneeId: nay.id,
        teamId: pathwayTeam.id,
        priority: 'HIGH',
        status: 'DONE',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
      {
        orgId: org.id,
        title: 'Film first 5 authentic Hamburg short videos',
        description: 'On-camera reels: Hamburg university campus tour, living cost reality, public transport, myth busting.',
        assigneeId: lu.id,
        teamId: marketingTeam.id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: org.id,
        title: 'Set up weekly content rhythm & deadline tracking sheet',
        description: 'Ensure Monday to Sunday publishing schedule runs seamlessly with clear owner handover.',
        assigneeId: yytt.id,
        teamId: operationsTeam.id,
        priority: 'HIGH',
        status: 'DONE',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
      {
        orgId: org.id,
        title: 'Set up Meta & TikTok Ads Manager tracking and test boost strategy',
        description: 'Prepare custom audiences, retargeting pixels, and test budget allocation for top performing organic posts.',
        assigneeId: thn.id,
        teamId: marketingTeam.id,
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: org.id,
        title: 'Weekly team execution & bottleneck review meeting',
        description: 'Review weekly output: 20-30 content pieces target, 10-12 Germany videos target, inquiry pipeline readiness.',
        assigneeId: yytt.id,
        teamId: operationsTeam.id,
        priority: 'MEDIUM',
        status: 'TODO',
        isRecurring: true,
        recurringRule: 'WEEKLY',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 8. Create Marketing Content Items in the 8-Stage Workflow
  // Workflow: Idea -> Research -> Draft -> Factual Review -> Brand Approval -> Scheduled -> Published -> Results Recorded
  await prisma.contentItem.create({
    data: {
      orgId: org.id,
      campaignId: ausbildungCamp.id,
      pathwayId: ausbildungPathway.id,
      topic: 'German Ausbildung: Why you get PAID to study (Stipend Breakdown)',
      pillar: 'EDUCATION_40',
      channel: 'TIKTOK',
      format: 'REEL',
      ownerId: nay.id,
      factualReviewerId: nay.id,
      brandApproverId: thn.id,
      sourceLinks: JSON.stringify(['https://www.make-it-in-germany.com/en/study-vocational-training/training-in-germany']),
      assetUrl: 'https://drive.google.com/sample-footage-01',
      callToAction: 'Message GOEURO to evaluate if your German level matches Ausbildung criteria.',
      plannedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      stage: 'FACTUAL_REVIEW',
    },
  });

  await prisma.contentItem.create({
    data: {
      orgId: org.id,
      campaignId: uniCamp.id,
      pathwayId: uniPathway.id,
      topic: 'How I study at a Public University in Hamburg with ZERO tuition fees',
      pillar: 'GERMANY_LIFE_20',
      channel: 'FACEBOOK',
      format: 'REEL',
      ownerId: lu.id,
      factualReviewerId: nay.id,
      brandApproverId: thn.id,
      sourceLinks: JSON.stringify(['https://www.uni-hamburg.de/en/campuscenter/bewerbung.html']),
      assetUrl: 'https://drive.google.com/sample-lu-hamburg-cam',
      callToAction: 'Comment PUBLIC for our 2026 intake checklist.',
      plannedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      stage: 'BRAND_APPROVAL',
    },
  });

  await prisma.contentItem.create({
    data: {
      orgId: org.id,
      campaignId: ausbildungCamp.id,
      pathwayId: ausbildungPathway.id,
      topic: 'Ausbildung vs University: Which German pathway is right for you?',
      pillar: 'EDUCATION_40',
      channel: 'FACEBOOK',
      format: 'CAROUSEL',
      ownerId: yytt.id,
      factualReviewerId: nay.id,
      brandApproverId: thn.id,
      callToAction: 'Take our free 3-minute profile assessment via link.',
      stage: 'IDEA',
    },
  });

  // 9. Create Knowledge Base Items (Bilingual Burmese & English)
  await prisma.knowledgeItem.createMany({
    data: [
      {
        orgId: org.id,
        category: 'FAQ',
        title: 'Ausbildung German Language Level Requirements',
        contentEn: 'Applicants require a verified B1 or B2 German certificate (Goethe-Institut, telc, or ÖSD). B2 is strongly recommended for healthcare, nursing, and technical professions to pass the vocational school (Berufsschule) exams.',
        contentMm: 'ဂျာမနီနိုင်ငံတွင် Ausbildung တက်ရောက်ရန် အနည်းဆုံး Goethe, telc သို့မဟုတ် ÖSD မှ အသိအမှတ်ပြု B1 သို့မဟုတ် B2 ဂျာမန်ဘာသာစကားလက်မှတ် လိုအပ်ပါသည်။ သူနာပြု (Pflege) နှင့် အင်ဂျင်နီယာ နည်းပညာပိုင်းဆိုင်ရာများအတွက် B2 ရရှိထားရန် အထူးအကြံပြုပါသည်။',
        pathwayId: ausbildungPathway.id,
        ownerName: 'Nay Myo Thiha',
        reviewerName: 'Thet Htoo Naing',
        status: 'APPROVED',
      },
      {
        orgId: org.id,
        category: 'FAQ',
        title: 'Public Universities in Germany Tuition Fees & Semester Contribution',
        contentEn: 'Most public universities in 15 out of 16 German states charge €0 tuition fees. Students only pay a semester ticket contribution (Semesterbeitrag) of approx. €250–€380 every 6 months, which covers unlimited regional public transit and campus student services.',
        contentMm: 'ဂျာမနီနိုင်ငံရှိ ပြည်နယ် ၁၅ ခုမှ အစိုးရတက္ကသိုလ်အများစုတွင် ကျောင်းလခ (Tuition Fee) လုံးဝပေးဆောင်ရန် မလိုပါ။ ကျောင်းသားများသည် ၆ လတစ်ကြိမ် Semesterbeitrag ဟုခေါ်သော ကျောင်းတွင်းဝန်ဆောင်ခနှင့် ရထား/ဘတ်စ်ကား အကန့်အသတ်မဲ့စီးခွင့်ကတ်အတွက် ခန့်မှန်းခြေ €250 မှ €380 သာ ကျသင့်ပါသည်။',
        pathwayId: uniPathway.id,
        ownerName: 'Lu Min Myat',
        reviewerName: 'Nay Myo Thiha',
        status: 'APPROVED',
      },
      {
        orgId: org.id,
        category: 'SOP',
        title: 'Student Inquiry Qualification & Assessment SOP',
        contentEn: '1. Respond within 2 hours during business hours.\n2. Ask for: Education background, current German level (A0/A1/A2/B1), age, budget for initial visa setup/flight.\n3. Do NOT promise guaranteed visas or jobs.\n4. If qualified, offer a 30-minute structured 1-on-1 consultation.',
        contentMm: '၁။ ရုံးချိန်အတွင်း ၂ နာရီအတွင်း အကြောင်းပြန်ရန်။\n၂။ ပညာအရည်အချင်း၊ လက်ရှိဂျာမန်စကားအဆင့် (A0/A1/B1)၊ အသက်နှင့် ကနဦးဗီဇာပြင်ဆင်စရိတ်ကို မေးမြန်းစစ်ဆေးရန်။\n၃။ ဗီဇာနှင့် အလုပ်အာမခံချက် အလွန်အကျွံကတိများ မပေးရ။\n၄။ သတ်မှတ်ချက်ကိုက်ညီပါက မိနစ် ၃၀ ဆွေးနွေးပွဲ (Consultation) စာရင်းသွင်းပေးရန်။',
        ownerName: 'Kaung Myat Hein',
        reviewerName: 'Thet Htoo Naing',
        status: 'APPROVED',
      },
      {
        orgId: org.id,
        category: 'BRAND_ASSET',
        title: 'GOEURO Brand Promise & Ethical Boundaries',
        contentEn: 'Brand Pillars:\n• Clear pathways, not vague promises.\n• Real Germany perspective directly from Hamburg.\n• Transparent profile assessment.\n• Structured ethical support.',
        contentMm: 'GOEURO ၏ ကတိကဝတ်များ -\n• ရှင်းလင်းတိကျသော လမ်းကြောင်းများ၊ ဖြစ်နိုင်ချေမရှိသော ကတိအတုများ မပေးခြင်း။\n• ဟမ်းဘတ်မြို့မှ ကျောင်းသားဘဝ လက်တွေ့အမြင်ကို ဖော်ပြခြင်း။\n• ပွင့်လင်းမြင်သာသော အရည်အချင်းစိစစ်ခြင်း။\n• စနစ်ကျပြီး ရိုးသားသော ဝန်ဆောင်မှု။',
        ownerName: 'Thet Htoo Naing',
        reviewerName: 'Ye Yint Tun Thant',
        status: 'APPROVED',
      },
    ],
  });

  // 10. Audit Log Initial Entry
  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      userId: thn.id,
      entityType: 'ORGANIZATION',
      entityId: org.id,
      action: 'INITIALIZE',
      details: JSON.stringify({ message: 'GOEURO pre-launch management workspace initialized with core 5 team members.' }),
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
