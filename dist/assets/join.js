/* Krishi Ratna League · farmer enrolment front end.
   Map first: tap a district, see the team, enrol in about ten short questions by touch or voice.
   KRL_CONFIG.demo = true: no network calls; the OTP and submit steps are simulated. */
(function () {
  'use strict';
  const D = window.KRL_DATA;
  if (!D) return;
  const CFG = window.KRL_CONFIG || {};
  const T = {}; D.teams.forEach(t => { T[t.id] = t; });
  const DI = {}; D.districts.forEach(d => { DI[d.slug] = d; });
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const MOTION = root.classList.contains('motion');

  /* ---------- storage (can throw in private mode) ---------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------- language ---------- */
  let lang = store.get('krl-lang') === 'en' ? 'en' : 'bn';
  const S = {
    brand: ['কৃষিরত্ন লিগ', 'Krishi Ratna League'],
    skip: ['মূল অংশে যান', 'Skip to content'],
    demo: ['ডেমো সংস্করণ · আপনার তথ্য কোথাও পাঠানো হচ্ছে না', 'Demo version · your details are not sent anywhere'],
    offline: ['নেটওয়ার্ক নেই — উত্তর সেভ আছে', 'No network — your answers are saved'],
    eyebrow: ['পশ্চিমবঙ্গ · ১৫টি দল', 'West Bengal · 15 teams'],
    heroTitle: ['আপনার জেলার দলে যোগ দিন', "Join your district's team"],
    heroSub: ['ম্যাপে আপনার জেলা ছুঁয়ে দেখুন আপনার দল কোনটি। নাম লেখানো বিনামূল্যে।', 'Tap your district on the map to see your team. Joining is free.'],
    resumeText: ['আপনার উত্তর সেভ করা আছে — এখান থেকেই শুরু করুন', 'Your answers are saved — carry on from here'],
    resumeBtn: ['চালিয়ে যান', 'Continue'],
    findArea: ['আমার এলাকা খুঁজুন', 'Find my area'],
    fromList: ['তালিকা থেকে বাছুন', 'Choose from a list'],
    abc: ['অ-হ', 'A-Z'],
    tsPick: ['আপনার জেলা বেছে নিয়ে যোগ দিন', 'Choose your district to join'],
    tsMap: ['ম্যাপে দেখুন', 'See on the map'],
    anthemFail: ['গানটি এখন চালানো যাচ্ছে না', 'The anthem cannot play right now'],
    speak: ['বাংলায় বলুন', 'Speak'],
    nudgeTap: ['আপনার জেলায় আঙুল রাখুন 👆', 'Put your finger on your district 👆'],
    nudgeVoice: ['ম্যাপ চিনতে অসুবিধা? 🎤 বলুন, কোন গ্রাম থেকে', 'Map hard to read? 🎤 Tell us your village'],
    nudgeList: ['ম্যাপ চিনতে অসুবিধা? তালিকা থেকে বাছুন', 'Map hard to read? Choose from the list'],
    gpsLooking: ['আপনার জেলা খুঁজছি… লোকেশন শুধু জেলা জানতে লাগবে, কোথাও রাখা হবে না।', 'Finding your district… your location is only used to find the district and is not kept.'],
    gpsFail: ['এলাকা পাওয়া গেল না, তালিকা থেকে বাছুন', "Couldn't find your area, choose from the list"],
    gpsFound: ['মনে হচ্ছে আপনি {d} জেলায়। ভুল হলে অন্য জেলা ছুঁয়ে দিন।', 'Looks like you are in {d}. If not, tap another district.'],
    district: ['জেলা', 'District'],
    yourTeam: ['আপনার দল', 'Your team'],
    teamNo: ['দল {n}', 'Team {n}'],
    seats: ['{n}টি বিধানসভা', '{n} constituencies'],
    joinTeam: ['এই দলে যোগ দিন', 'Join this team'],
    splitTitle: ['আপনার জেলা দুটি দলে ভাগ', 'Your district is split between two teams'],
    goOn: ['এগিয়ে চলুন', 'Continue'],
    joined: ['{d} থেকে {n} জন কৃষক যোগ দিয়েছেন', '{n} farmers from {d} have joined'],
    close: ['বন্ধ করুন', 'Close'],
    listTitle: ['আপনার জেলা বাছুন', 'Choose your district'],
    howEyebrow: ['খুব সহজ', 'Very simple'],
    howTitle: ['৩ ধাপে যোগ দিন', 'Join in 3 steps'],
    s1t: ['জেলা ছুঁয়ে দিন', 'Tap your district'],
    s1p: ['ম্যাপে বা তালিকায় নিজের জেলা বাছুন। আপনার দল নিজে থেকেই ঠিক হয়ে যাবে।', 'Pick your district on the map or the list. Your team is set automatically.'],
    s2t: ['কয়েকটা ছোট প্রশ্ন', 'A few short questions'],
    s2p: ['নাম, বয়স, মোবাইল, জমি আর জল। আঙুল ছুঁয়ে বা মুখে বলে। প্রায় ২ মিনিট।', 'Name, age, mobile, land and water. By touch or by voice. About 2 minutes.'],
    s3t: ['আপনি দলের সদস্য', 'You are in the team'],
    s3p: ['SMS-এ নথি নম্বর পাবেন। তারপর পাশের চাষি বন্ধুদের নিয়ে খামার দল গড়ুন।', 'You get a reference number by SMS. Then form a farm team with farmer friends nearby.'],
    statTeams: ['দল', 'teams'],
    statDistricts: ['জেলা', 'districts'],
    statSeats: ['বিধানসভা', 'constituencies'],
    teamsEyebrow: ['আপনার জেলা, আপনার দল', 'Your district, your team'],
    teamsTitle: ['বাংলার ১৫টি দল', "Bengal's 15 teams"],
    teamsSub: ['যে কোনো দলে ছুঁয়ে দিন, ম্যাপে দেখবেন কোন কোন জেলা সেই দলে।', 'Tap any team to see its districts light up on the map.'],
    whyEyebrow: ['কেন যোগ দেবেন', 'Why join'],
    whyTitle: ['যোগ দিলে কী পাবেন', 'What you get'],
    p1t: ['বিনামূল্যে', 'Free'],
    p1p: ['নাম লেখাতে কোনো টাকা লাগে না।', 'Joining costs nothing.'],
    p2t: ['প্রশিক্ষণ', 'Training'],
    p2p: ['আধুনিক চাষ, নতুন প্রযুক্তি আর খামার চালানোর শিক্ষা।', 'Modern farming, new technology and farm management.'],
    p3t: ['বড় বাজার', 'Bigger markets'],
    p3p: ['দেশ-বিদেশের বাজারের সঙ্গে যোগাযোগের সুযোগ।', 'A chance to connect with markets in India and abroad.'],
    p4t: ['পুরস্কার ও সম্মান', 'Prizes and honour'],
    p4p: ['সেরা খামার আর সেরা দলের জন্য বড় পুরস্কার।', 'Big prizes for the best farm and the best team.'],
    p5t: ['কাগজ লাগবে না', 'No paperwork'],
    p5p: ['শুধু একটা মোবাইল নম্বর। আধার বা ব্যাংকের তথ্য চাওয়া হবে না।', 'Just a mobile number. No Aadhaar or bank details are asked.'],
    moreLeague: ['লিগ সম্পর্কে বিস্তারিত পড়ুন →', 'Read more about the league →'],
    moreLeague2: ['লিগ সম্পর্কে বিস্তারিত', 'More about the league'],
    voiceEyebrow: ['সাথী · আপনার সহায়ক', 'Sathi · your helper'],
    voiceTitle: ['লিখতে না চাইলে, মুখে বলুন', "Don't want to type? Just say it"],
    voiceSub: ['গোলাপি মাইক টিপে বাংলায় বলুন। সাথী শুনে স্ক্রিনের ঘরে লিখে দেবে। সব দেখে নিয়ে জমা দেবেন আপনি নিজে।', 'Tap the pink microphone and speak. Sathi fills the boxes on the screen. You check everything and submit yourself.'],
    v1: ['প্রতিটি প্রশ্ন শুনতেও পারবেন 🔊', 'You can listen to every question 🔊'],
    v2: ['সাথী কখনো আধার, ব্যাংক বা OTP চাইবে না', 'Sathi never asks for Aadhaar, bank details or the OTP'],
    v3: ['বলে ভরা ঘর গোলাপি থাকে, যতক্ষণ না আপনি দেখে নেন', 'Boxes filled by voice stay pink until you check them'],
    sample: ['নমুনা', 'Sample'],
    c1: ['নমস্কার! আমি সাথী। আপনি কোন গ্রাম বা এলাকা থেকে বলছেন?', "Hello! I'm Sathi. Which village or area are you speaking from?"],
    c2: ['হরিণঘাটার কাছে, মোহনপুর গ্রাম।', 'Near Haringhata, Mohanpur village.'],
    c3: ['আপনি নদিয়া জেলার, তাই আপনার দল চৈতন্যের নদিয়া। আপনার নামটা বলবেন?', 'You are from Nadia, so your team is Chaitanyer Nadia. May I have your name?'],
    c4: ['মিতালী ঘোষ।', 'Mitali Ghosh.'],
    c5: ['ধন্যবাদ! স্ক্রিনে আপনার নাম লিখে দিলাম। ঠিক আছে তো?', "Thank you! I've written your name on the screen. Is it right?"],
    nextEyebrow: ['তারপর কী?', 'What next?'],
    nextTitle: ['৫ জন মিলে খামার দল', 'Five make a farm team'],
    nextSub: ['নাম লেখানোর পর পাশের চাষি বন্ধুদের নিয়ে ৫ বা তার বেশি জনের খামার দল গড়ুন। খামার দলই লিগে খেলবে।', 'After joining, form a farm team of 5 or more with farmer friends nearby. Farm teams play in the league.'],
    nextRule: ['দলে অন্তত একজন মহিলা আর একজন ২৫ বছরের কম সদস্য চাই।', 'A farm team needs at least one woman and one member under 25.'],
    faqTitle: ['প্রশ্ন ও উত্তর', 'Questions and answers'],
    finalTitle: ['আপনার দল অপেক্ষা করছে', 'Your team is waiting'],
    finalBtn: ['নাম লেখান', 'Join now'],
    dockBtn: ['নাম লেখান', 'Join now'],
    organisers: ['কর্মযোগ ফর দ্য ২১স্ট সেঞ্চুরি ও ভারতীয় কৃষক সমাজের যৌথ উদ্যোগ', 'A joint initiative of Karmyog for the 21st Century and Bharatiya Krishak Samaj'],
    privacy: ['আপনার ফোন নম্বর ও সঠিক লোকেশন কখনো প্রকাশ্যে দেখানো হয় না।', 'Your phone number and exact location are never shown publicly.'],
    pickFirst: ['আগে ম্যাপে আপনার জেলা ছুঁয়ে দিন', 'First tap your district on the map'],
    teamDists: ['{t}: {d}', '{t}: {d}'],
    invite: ['আচার্যের কোড {c} দিয়ে আপনাকে আমন্ত্রণ জানানো হয়েছে', 'You have been invited with Acharya code {c}'],
    enrolledBanner: ['আপনি এখন {t} দলের সদস্য ✓', 'You are now a member of {t} ✓'],
    inviteFriends: ['বন্ধুদের ডাকুন', 'Invite friends'],
    /* flow */
    steps: [['এলাকা', 'আপনি', 'চাষ', 'দল', 'জমা'], ['Area', 'You', 'Farm', 'Team', 'Submit']],
    back: ['পিছনে', 'Back'],
    closeSaved: ['বন্ধ করুন (উত্তর সেভ থাকবে)', 'Close (answers are saved)'],
    nextQ: ['পরের প্রশ্ন', 'Next question'],
    youAreFrom: ['আপনি <b>{d}</b> জেলার কৃষক। আপনার দল —', 'You farm in <b>{d}</b>. Your team —'],
    free: ['বিনামূল্যে', 'Free'],
    tenQ: ['১০টির মতো ছোট প্রশ্ন', 'About 10 short questions'],
    twoMin: ['প্রায় ২ মিনিট', 'About 2 minutes'],
    otherDist: ['অন্য জেলা বাছুন', 'Choose another district'],
    splitQ: ['আপনার এলাকা কোন দলে?', 'Which team is your area in?'],
    splitSub: ['<b>{d}</b>-র কিছু এলাকা উর্বর ২৪ পরগনা দলে, আর সুন্দরবনের এলাকা বাঘা সুন্দরবন দলে।', 'Parts of <b>{d}</b> are in Urbar 24 Parganas; the Sundarban areas are in Bagha Sundarban.'],
    places8: ['বারাসাত, বনগাঁ, ব্যারাকপুর, ডায়মন্ড হারবার…', 'Barasat, Bongaon, Barrackpore, Diamond Harbour…'],
    places9: ['বসিরহাট, হিঙ্গলগঞ্জ, গোসাবা, ক্যানিং…', 'Basirhat, Hingalganj, Gosaba, Canning…'],
    unsure: ['নিশ্চিত নই — বিধানসভা দেখে ঠিক হোক', "Not sure — decide from my constituency"],
    acQ: ['আপনার বিধানসভা কেন্দ্র', 'Your assembly constituency'],
    acPick: ['বেছে নিন…', 'Choose…'],
    acNote: ['জেলার তালিকা ২০১১ সালের জেলা ভাগ অনুযায়ী।', 'The list follows the 2011 district boundaries.'],
    teamSwitched: ['আপনার বিধানসভা অনুযায়ী আপনার দল: {t}', 'By your constituency, your team is: {t}'],
    villageQ: ['আপনার গ্রাম', 'Your village'],
    villagePh: ['যেমন: মোহনপুর', 'e.g. Mohanpur'],
    villageSub: ['পোস্ট অফিস ও থানা পরে জানালেও চলবে।', 'Post office and police station can come later.'],
    nameQ: ['আপনার নাম', 'Your name'],
    namePh: ['পুরো নাম লিখুন', 'Your full name'],
    genderQ: ['আপনি', 'You are'],
    female: ['মহিলা', 'Woman'],
    male: ['পুরুষ', 'Man'],
    otherG: ['অন্য / বলতে চাই না', 'Other / prefer not to say'],
    ageQ: ['আপনার বয়স', 'Your age'],
    agePh: ['বছর', 'years'],
    phoneQ: ['আপনার মোবাইল নম্বর', 'Your mobile number'],
    phoneSub: ['এই নম্বরেই লিগের সব খবর আসবে। নম্বর কখনো প্রকাশ্যে দেখানো হয় না।', 'All league news comes to this number. It is never shown publicly.'],
    sendCode: ['কোড পাঠান', 'Send code'],
    otpQ: ['ফোনে একটা কোড গেছে', 'A code has been sent to your phone'],
    otpSub: ['কোডটি নিজে থেকেই বসে যাবে। না বসলে এখানে লিখুন।', 'The code fills in by itself. If not, type it here.'],
    otpDemo: ['ডেমো: যেকোনো ৪টি সংখ্যা লিখুন', 'Demo: type any 4 digits'],
    otpWait: ['কোড আসেনি? {n} সেকেন্ড পরে আবার পাঠান', 'No code? Resend in {n} seconds'],
    resend: ['আবার কোড পাঠান', 'Resend code'],
    callCode: ['কল করে কোড শুনুন', 'Get the code by phone call'],
    resent: ['আবার কোড পাঠানো হয়েছে', 'Code sent again'],
    verify: ['যাচাই করুন', 'Verify'],
    savedNote: ['আপনার উত্তর সেভ করা আছে। নেট চলে গেলেও হারাবে না।', 'Your answers are saved. They will not be lost if the network goes.'],
    landQ: ['কত বিঘা জমিতে চাষ করেন?', 'How many bigha do you farm?'],
    bigha: ['বিঘা', 'bigha'],
    kathaNote: ['২০ কাঠা = ১ বিঘা', '20 katha = 1 bigha'],
    less: ['কমান', 'Less'],
    more: ['বাড়ান', 'More'],
    tenureQ: ['জমি কার?', 'Whose land is it?'],
    own: ['নিজের', 'Own'],
    lease: ['লিজ / ভাগ', 'Leased / shared'],
    waterQ: ['জল কোথা থেকে পান?', 'Where do you get water?'],
    manyOk: ['একাধিক বাছতে পারেন', 'You can choose more than one'],
    pond: ['পুকুর', 'Pond'], tube: ['টিউবওয়েল', 'Tube-well'], canal: ['খাল / নদী', 'Canal / river'], rain: ['শুধু বৃষ্টি', 'Rain only'],
    cropsQ: ['কী কী চাষ করেন?', 'What do you grow or raise?'],
    rice: ['ধান', 'Rice'], veg: ['সবজি', 'Vegetables'], potato: ['আলু', 'Potato'], jute: ['পাট', 'Jute'],
    fruit: ['ফল', 'Fruit'], oil: ['সর্ষে / ডাল', 'Mustard / pulses'], fish: ['মাছ', 'Fish'], animal: ['গরু, ছাগল, হাঁস', 'Cattle, goats, poultry'],
    twoLeft: ['আর মাত্র ২টি প্রশ্ন', 'Only 2 questions left'],
    groupQ: ['খামার দলে থাকতে চান?', 'Do you want to be in a farm team?'],
    groupSub: ['লিগে খেলে ৫ বা তার বেশি জনের খামার দল। পরে ঠিক করলেও চলবে।', 'Farm teams of 5 or more play in the league. You can decide later.'],
    gCreate: ['নতুন দল গড়ব', 'I will start a new team'], gCreateS: ['আমি দলের প্রধান যোগাযোগ', 'I am the main contact'],
    gJoin: ['কোড দিয়ে দলে যোগ দেব', 'I will join with a code'], gJoinS: ['কেউ আমাকে কোড পাঠিয়েছেন', 'Someone sent me a code'],
    gMatch: ['কাছাকাছি চাষিদের সঙ্গে মিলিয়ে দিন', 'Match me with farmers nearby'],
    gLater: ['পরে ঠিক করব', 'I will decide later'],
    teamCodeQ: ['খামার দলের কোড', 'Farm team code'],
    codeQ: ['আচার্যের কোড (থাকলে)', "Acharya's code (if any)"],
    codePh: ['যেমন ND-07', 'e.g. ND-07'],
    codeLocked: ['আচার্যের লিংক থেকে বসানো হয়েছে', "Filled from the Acharya's link"],
    seeAll: ['দেখে নিন', 'Review'],
    reviewQ: ['একবার মিলিয়ে নিন', 'Check once'],
    reviewSub: ['ভুল থাকলে "বদলান" টিপুন।', 'Tap "Change" to fix anything.'],
    change: ['বদলান', 'Change'],
    voicedTag: ['🎤 বলে ভরা — দেখে নিন', '🎤 Filled by voice — please check'],
    rTeam: ['দল', 'Team'], rDist: ['জেলা', 'District'], rAc: ['বিধানসভা', 'Constituency'], rVillage: ['গ্রাম', 'Village'],
    rName: ['নাম', 'Name'], rGender: ['লিঙ্গ', 'Gender'], rAge: ['বয়স', 'Age'], rPhone: ['মোবাইল', 'Mobile'],
    rLand: ['জমি', 'Land'], rWater: ['জল', 'Water'], rCrops: ['চাষ', 'Farming'], rGroup: ['খামার দল', 'Farm team'], rCode: ['আচার্য কোড', 'Acharya code'],
    none: ['নেই', 'None'],
    consent: ['আমি রাজি: আমার তথ্য শুধু কৃষিরত্ন লিগের কাজে ব্যবহার হবে, আর SMS ও WhatsApp-এ লিগের খবর পাব।', 'I agree: my details are used only for the Krishi Ratna League, and I will get league news by SMS and WhatsApp.'],
    consentNeed: ['জমা দিতে আগে রাজি থাকার ঘরে টিক দিন', 'Tick the agreement box to submit'],
    submit: ['জমা দিন', 'Submit'],
    queued: ['নেট নেই। নেট ফিরলেই নিজে থেকে পাঠানো হবে।', 'No network. It will be sent as soon as the network is back.'],
    welcome: ['স্বাগতম, {n}!', 'Welcome, {n}!'],
    nowMember: ['আপনি এখন {t} দলের সদস্য', 'You are now a member of {t}'],
    refNo: ['নথি নং', 'Reference no.'],
    smsFrom: ['SMS · KRL', 'SMS · KRL'],
    smsText: ['KRL: {n}, আপনি এখন {t} দলের সদস্য। নথি নং {r}।', 'KRL: {n}, you are now a member of {t}. Reference {r}.'],
    callFriends: ['<b>পাশের চাষি বন্ধুদের WhatsApp-এ ডাকুন</b> — ৫ জন হলে খামার দল', '<b>Invite farmer friends on WhatsApp</b> — 5 make a farm team'],
    waShare: ['WhatsApp-এ শেয়ার করুন', 'Share on WhatsApp'],
    waText: ['আমি কৃষিরত্ন লিগে {t} দলে যোগ দিয়েছি! আপনিও আপনার জেলার দলে যোগ দিন, বিনামূল্যে: {u}', 'I have joined {t} in the Krishi Ratna League! Join your district team too, it is free: {u}'],
    cardShare: ['আমার দলের ছবি শেয়ার করুন', 'Share my team card'],
    cardJoined: ['যোগ দিয়েছেন', 'has joined'],
    farmTeam: ['খামার দল গড়ুন / যোগ দিন', 'Start or join a farm team'],
    farmTeamSoon: ['খামার দল গড়ার সুবিধা শিগগিরই আসছে। আমরা SMS-এ জানাব।', 'Farm teams are coming soon. We will tell you by SMS.'],
    another: ['আরেকজন কৃষকের নাম লেখান', 'Enrol another farmer'],
    home: ['হোমে ফিরুন', 'Back to home'],
    demoTag: ['ডেমো', 'Demo'],
    /* errors */
    eAc: ['আপনার বিধানসভা বেছে নিন', 'Choose your constituency'],
    eVillage: ['গ্রামের নাম লিখুন', 'Write your village name'],
    eName: ['আপনার নাম লিখুন', 'Write your name'],
    eGender: ['একটা বেছে নিন', 'Choose one'],
    eAge: ['বয়স ১৫ থেকে ১০০-র মধ্যে লিখুন', 'Enter an age from 15 to 100'],
    ePhone: ['১০ সংখ্যার মোবাইল নম্বর লিখুন', 'Enter a 10-digit mobile number'],
    eOtp: ['৪টি সংখ্যার কোড লিখুন', 'Enter the 4-digit code'],
    eTenure: ['জমি নিজের না লিজ, বেছে নিন', 'Choose own or leased'],
    eMulti: ['অন্তত একটা বেছে নিন', 'Choose at least one'],
    eTeam: ['একটা দল বেছে নিন', 'Choose a team'],
    /* nudges */
    typeHard: ['লিখতে অসুবিধা? 🎤 বলে দিন', 'Hard to type? 🎤 Just say it'],
    sayIt: ['বলুন', 'Speak'],
    /* voice guide */
    sathi: ['সাথী', 'Sathi'],
    stListening: ['শুনছি…', 'Listening…'],
    stThinking: ['ভাবছি…', 'Thinking…'],
    stSpeaking: ['বলছি…', 'Speaking…'],
    stIdle: ['মাইক টিপে বলুন', 'Tap the mic and speak'],
    vOpen: ['নমস্কার! আমি সাথী। আপনি কোন গ্রাম, ব্লক বা জেলা থেকে বলছেন?', "Hello! I'm Sathi. Which village, block or district are you speaking from?"],
    vFoundAc: ['আপনি {d} জেলার, {a} বিধানসভা। তাই আপনার দল {t}।', 'You are in {d} district, {a} constituency. So your team is {t}.'],
    vFoundD: ['আপনি {d} জেলার, তাই আপনার দল {t}।', 'You are from {d}, so your team is {t}.'],
    vFoundSplit: ['{d} জেলা দুটি দলে ভাগ। আপনার বিধানসভা দেখে দল ঠিক হবে।', '{d} is split between two teams. Your constituency will decide.'],
    vPick: ['কোনটা আপনার এলাকা? ছুঁয়ে দিন।', 'Which one is your area? Tap it.'],
    vNotFound: ['খুঁজে পেলাম না। তালিকা থেকে জেলা বেছে নিন, বা আবার বলুন।', "I couldn't find that. Choose your district from the list, or say it again."],
    vNoHear: ['শুনতে পেলাম না। মাইক টিপে আবার বলুন।', "I didn't hear that. Tap the mic and say it again."],
    vGiveUp: ['বলা যাচ্ছে না? কোনো অসুবিধা নেই — আঙুল ছুঁয়ে বা লিখে দিন। উত্তর সেভ আছে।', "Voice isn't working? No problem — tap or type instead. Your answers are saved."],
    vDenied: ['মাইক চালুর অনুমতি নেই। আঙুল ছুঁয়ে বা লিখে দিন।', 'No microphone permission. Please tap or type instead.'],
    vNet: ['নেট নেই, তাই এখন বলা যাচ্ছে না। আঙুল ছুঁয়ে করুন।', "There's no network, so voice can't work now. Please tap instead."],
    vUnsupported: ['এই ফোনের ব্রাউজারে বলার সুবিধা নেই। Chrome-এ খুললে বলতে পারবেন। এখন আঙুল ছুঁয়েই করুন — খুব সহজ।', "This phone's browser can't take voice. Open in Chrome to speak. For now, just tap — it's easy."],
    vWrote: ['লিখলাম: {v}। ঠিক থাকলে নিচের বোতাম টিপুন।', 'I wrote: {v}. If it is right, tap the button below.'],
    vNoMatch: ['বুঝতে পারিনি। স্ক্রিনে ছুঁয়ে বেছে নিন।', "I didn't understand. Please tap your choice on the screen."],
    vNoNum: ['সংখ্যাটা বুঝতে পারিনি, লিখে দিন।', "I didn't catch the number, please type it."],
    vOtp: ['কোডটি মুখে বলবেন না। নিজে থেকে বসবে, না বসলে লিখে দিন।', "Please don't say the code aloud. It fills in by itself, or type it."],
    vTeamGo: ['যোগ দিতে নিচের বোতাম টিপুন।', 'Tap the button below to join.'],
    vReview: ['জমা আমি দিই না। সব দেখে সবুজ "জমা দিন" বোতাম আপনি টিপুন।', 'I never submit. Check everything, then tap the green "Submit" button yourself.'],
    vAskQ: ['{q} — বলুন।', '{q} — please say it.'],
    micOff: ['মাইক বন্ধ: {r}', 'Microphone off: {r}'],
    ok: ['ঠিক আছে', 'OK'],
    tryAgain: ['আবার বলুন', 'Say it again'],
    labels: ['ম্যাপের লেখা', 'Map labels']
  };
  const t = (k, v) => {
    const e = S[k];
    let s = e ? e[lang === 'bn' ? 0 : 1] : k;
    if (v) Object.keys(v).forEach(x => { s = s.split('{' + x + '}').join(v[x]); });
    return s;
  };
  const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  const num = n => lang === 'bn' ? String(n).replace(/\d/g, c => BN_DIGITS[c]) : String(n);
  const toAscii = s => String(s || '').replace(/[০-৯]/g, c => String(BN_DIGITS.indexOf(c)));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /* ---------- team helpers ---------- */
  const CREST = { 1: ['কো', 'CB'], 2: ['ত', 'TE'], 3: ['হি', 'HI'], 4: ['দি', 'DI'], 5: ['মা', 'MA'], 6: ['মু', 'MU'], 7: ['ন', 'NA'], 8: ['২৪', '24'], 9: ['সু', 'SU'], 10: ['ক', 'KO'], 11: ['হু', 'HO'], 12: ['মে', 'ME'], 13: ['বাঁ', 'BA'], 14: ['ব', 'BD'], 15: ['বী', 'BI'] };
  const teamsOf = d => Array.isArray(d.team) ? d.team : [d.team];
  // "(নাম বাকি)" / "(name open)" is an internal open point [O-1], not for farmers.
  const tName = tm => (lang === 'bn' ? tm.bn : tm.en).replace(/\s*\(.*?\)\s*/g, '').trim();
  const dName = d => lang === 'bn' ? d.bn : d.en;
  const crest = tm => CREST[tm.id][lang === 'bn' ? 0 : 1];
  function lum(hex) {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  // White text only where it passes 4.5:1, otherwise navy.
  const inkOn = hex => (1.05 / (lum(hex) + 0.05)) >= 4.5 ? '#ffffff' : '#0a1730';
  const teamVars = tm => tm ? '--team:' + tm.color + ';--team-ink:' + inkOn(tm.color) : '';

  /* ---------- small UI helpers ---------- */
  const ICON = {
    spk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'
  };
  const listenBtn = text => '<button type="button" class="listen" data-say="' + esc(text) + '" aria-label="' + esc(lang === 'bn' ? 'প্রশ্নটি শুনুন' : 'Listen to the question') + '">' + ICON.spk + '</button>';
  let toastTimer = null;
  function toast(msg, ms) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms || 3200);
  }

  /* ---------- text to speech (listen buttons) ---------- */
  const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  if (!TTS) root.classList.add('no-tts');
  let ttsBtn = null;
  function speak(text, btn) {
    return new Promise(resolve => {
      if (!TTS || !text) { resolve(); return; }
      try {
        speechSynthesis.cancel();
        if (ttsBtn) ttsBtn.classList.remove('playing');
        const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ''));
        const want = lang === 'bn' ? 'bn' : 'en';
        const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().indexOf(want) === 0);
        if (v) u.voice = v;
        u.lang = lang === 'bn' ? 'bn-IN' : 'en-IN';
        u.rate = 0.92;
        ttsBtn = btn || null;
        if (btn) btn.classList.add('playing');
        let done = false;
        const fin = () => { if (done) return; done = true; if (btn) btn.classList.remove('playing'); resolve(); };
        u.onend = fin; u.onerror = fin;
        setTimeout(fin, Math.min(15000, 1500 + text.length * 110));
        speechSynthesis.speak(u);
      } catch (e) { resolve(); }
    });
  }
  if (TTS && speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = () => {};
  document.addEventListener('click', e => {
    const b = e.target.closest('.listen');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    speak(b.dataset.say, b);
  });

  /* ---------- map ---------- */
  const svg = $('#map');
  const els = {};
  let labelGroup = null;
  let labMode = lang;
  function buildMap() {
    svg.setAttribute('viewBox', D.viewBox);
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="' + T[8].color + '"/><rect width="6" height="12" fill="' + T[9].color + '"/></pattern>';
    svg.appendChild(defs);
    const g = document.createElementNS(NS, 'g');
    svg.appendChild(g);
    D.districts.forEach(d => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d.d);
      p.setAttribute('fill', Array.isArray(d.team) ? 'url(#hatch)' : T[d.team].color);
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.style.setProperty('--i', teamsOf(d)[0]);
      p.dataset.slug = d.slug;
      p.addEventListener('click', () => selectDistrict(d.slug));
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDistrict(d.slug); } });
      g.appendChild(p);
      els[d.slug] = p;
    });
    labelGroup = document.createElementNS(NS, 'g');
    svg.appendChild(labelGroup);
    const NUDGE = { kolkata: [16, -4], howrah: [-6, 4], 'north-24-parganas': [0, -18], 'south-24-parganas': [-6, 10], kalimpong: [0, -2], 'dakshin-dinajpur': [0, 4], jhargram: [-10, 16], 'paschim-medinipur': [-4, -14] };
    D.districts.forEach(d => {
      const b = els[d.slug].getBBox();
      const n = NUDGE[d.slug] || [0, 0];
      const tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', (b.x + b.width / 2 + n[0]).toFixed(1));
      tx.setAttribute('y', (b.y + b.height / 2 + 3 + n[1]).toFixed(1));
      tx.dataset.slug = d.slug;
      labelGroup.appendChild(tx);
    });
    if (MOTION) {
      svg.classList.add('intro');
      setTimeout(() => svg.classList.remove('intro'), 2000);
    }
    mapLabels();
  }
  function mapLabels() {
    $$('text', labelGroup).forEach(tx => { const d = DI[tx.dataset.slug]; tx.textContent = labMode === 'en' ? d.en : d.bn; });
    D.districts.forEach(d => els[d.slug].setAttribute('aria-label', dName(d) + ': ' + teamsOf(d).map(id => tName(T[id])).join(' / ')));
    svg.setAttribute('aria-label', lang === 'bn' ? 'পশ্চিমবঙ্গের জেলা ম্যাপ' : 'Map of West Bengal districts');
    $$('.map-labels-toggle button').forEach(b => b.classList.toggle('on', b.dataset.lab === labMode));
  }
  $$('.map-labels-toggle button').forEach(b => b.addEventListener('click', () => { labMode = b.dataset.lab; mapLabels(); }));

  let selSlug = null;
  function clearMap() {
    svg.classList.remove('has-sel', 'has-hl');
    $$('path', svg).forEach(p => p.classList.remove('sel', 'hl'));
  }
  function selectDistrict(slug, opts) {
    opts = opts || {};
    const d = DI[slug];
    if (!d) return;
    mapTouched();
    clearMap();
    selSlug = slug;
    svg.classList.add('has-sel');
    els[slug].classList.add('sel');
    els[slug].parentNode.appendChild(els[slug]);
    // Keep an existing draft's later answers only if the district did not change.
    if (st.dist !== slug) { st.dist = slug; st.ac = null; st.team = Array.isArray(d.team) ? null : d.team; }
    if (opts.ac) { st.ac = opts.ac; st.team = D.acs[opts.ac][3]; }
    saveDraft();
    if (!opts.quiet) showCard();
  }
  function highlightTeam(id) {
    mapTouched();
    hideCard();
    clearMap();
    svg.classList.add('has-hl');
    D.districts.forEach(d => { if (teamsOf(d).indexOf(id) > -1) els[d.slug].classList.add('hl'); });
    const tm = T[id];
    $('#gpsHint').textContent = t('teamDists', { t: tName(tm), d: D.districts.filter(d => teamsOf(d).indexOf(id) > -1).map(dName).join(', ') });
    $('#mapSection').scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'start' });
  }

  /* District card */
  const card = $('#dcard');
  function showCard() {
    const d = DI[selSlug];
    if (!d) return;
    const ids = teamsOf(d);
    let h = '<p class="dc-dist">' + t('district') + ': <b>' + esc(dName(d)) + '</b></p>';
    const count = CFG.counts && CFG.counts[d.slug];
    if (ids.length === 1) {
      const tm = T[ids[0]];
      card.setAttribute('style', teamVars(tm));
      h += '<h2 id="dcardTitle" style="font-size:18px;margin:8px 0 0">' + t('yourTeam') + '</h2>' +
        '<div class="dc-team">' + crestHTML(tm) + '<div><h3>' + esc(tName(tm)) + '</h3><small>' + t('teamNo', { n: num(tm.id) }) + ' · ' + t('seats', { n: num(tm.seats) }) + '</small></div></div>';
      // Live counts only when real and above ~50 (brief, section 3).
      if (count && count >= 50) h += '<p class="dc-count">🤝 ' + t('joined', { d: esc(dName(d)), n: num(count.toLocaleString('en-IN')) }) + '</p>';
      h += '<button type="button" class="btn big" data-join style="background:var(--team);color:var(--team-ink)">' + t('joinTeam') + '</button>';
    } else {
      card.setAttribute('style', '');
      h += '<h2 id="dcardTitle" style="font-size:20px;margin:8px 0 0">' + t('splitTitle') + '</h2><div class="dc-split">' +
        ids.map(id => '<div class="dc-team" style="' + teamVars(T[id]) + '">' + crestHTML(T[id], 'sm') + '<div><h3>' + esc(tName(T[id])) + '</h3><small>' + t('places' + id) + '</small></div></div>').join('') +
        '</div><button type="button" class="btn big" data-join>' + t('goOn') + '</button>';
    }
    $('#dcardBody').innerHTML = h;
    card.hidden = false;
    if (MOTION) { card.classList.add('out'); requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('out'))); }
    setDock();
    // Keep the chosen district visible above the card.
    const r = els[selSlug].getBoundingClientRect();
    const free = innerHeight - card.offsetHeight - 16;
    if (r.bottom > free) scrollBy({ top: Math.min(r.bottom - free, r.top - 70), behavior: MOTION ? 'smooth' : 'auto' });
  }
  function hideCard() { card.hidden = true; setDock(); }
  $('#dcardClose').addEventListener('click', () => { hideCard(); clearMap(); selSlug = null; });
  card.addEventListener('click', e => {
    if (e.target.closest('[data-join]')) startFlow();
  });

  /* Idle nudges on the map: 5 s pulse, 12 s offer voice (brief, section 6). */
  let touched = false, n1 = null, n2 = null;
  function mapTouched() {
    touched = true;
    clearTimeout(n1); clearTimeout(n2);
    $('#mapNudge').hidden = true;
    svg.classList.remove('pulse');
  }
  function armNudges() {
    n1 = setTimeout(() => {
      if (touched || flowOpen) return;
      showNudge('tap');
    }, 5000);
    n2 = setTimeout(() => {
      if (touched || flowOpen) return;
      showNudge('voice');
    }, 12000);
  }
  let nudgeKind = null;
  function showNudge(kind) {
    nudgeKind = kind;
    const nb = $('#mapNudge');
    if (kind === 'tap') {
      nb.textContent = t('nudgeTap');
      svg.classList.add('pulse');
    } else {
      nb.innerHTML = esc(SR ? t('nudgeVoice') : t('nudgeList')) + '<br><button type="button" class="btn small ' + (SR ? '' : 'gold') + '" id="nudgeAct" style="' + (SR ? 'background:var(--pink)' : '') + '">' + (SR ? t('speak') : t('fromList')) + '</button>';
      $('#nudgeAct').addEventListener('click', () => { mapTouched(); if (SR) openVoice('map'); else openList(); });
    }
    nb.hidden = false;
  }

  /* District list */
  const listSheet = $('#listSheet');
  function openList() {
    mapTouched();
    renderList();
    openSheet(listSheet);
  }
  function renderList() {
    const ds = D.districts.slice().sort((a, b) => dName(a).localeCompare(dName(b), lang === 'bn' ? 'bn' : 'en'));
    $('#dlist').innerHTML = ds.map(d => {
      const ids = teamsOf(d);
      const dot = ids.length > 1 ? 'background:linear-gradient(135deg,' + T[ids[0]].color + ' 50%,' + T[ids[1]].color + ' 50%)' : 'background:' + T[ids[0]].color;
      return '<li><button type="button" data-slug="' + d.slug + '"><i style="' + dot + '"></i><span>' + esc(dName(d)) + '</span><small>' + ids.map(id => esc(tName(T[id]))).join(' / ') + '</small></button></li>';
    }).join('');
  }
  $('#dlist').addEventListener('click', e => {
    const b = e.target.closest('button[data-slug]');
    if (!b) return;
    closeSheet(listSheet);
    selectDistrict(b.dataset.slug);
    $('#mapSection').scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'start' });
  });
  $('#listBtn').addEventListener('click', openList);

  let lastFocus = null;
  function openSheet(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    root.classList.add('lock');
    const f = $('.x', el);
    if (f) f.focus();
  }
  function closeSheet(el) {
    el.hidden = true;
    if (!flowOpen) root.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('.sheet').forEach(sh => {
    sh.addEventListener('click', e => {
      if (e.target === sh || e.target.closest('[data-close]')) { if (sh.id === 'voiceSheet') stopVoice(); closeSheet(sh); }
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = $$('.sheet').find(s => !s.hidden);
    if (open) { if (open.id === 'voiceSheet') stopVoice(); closeSheet(open); return; }
    if (!card.hidden) { hideCard(); return; }
  });

  /* GPS → district. The outlines are equirectangular over West Bengal's extent,
     so a linear map from lon/lat to SVG units is close enough to pick a district. */
  const GEO = { lon0: 85.82, lon1: 89.88, lat0: 21.5, lat1: 27.22, x0: 15.6, x1: 404.4, y0: 18.1, y1: 621.8 };
  function districtAt(lat, lon) {
    const x = GEO.x0 + (lon - GEO.lon0) / (GEO.lon1 - GEO.lon0) * (GEO.x1 - GEO.x0);
    const y = GEO.y0 + (GEO.lat1 - lat) / (GEO.lat1 - GEO.lat0) * (GEO.y1 - GEO.y0);
    let hit = null;
    if (window.DOMPoint && els.nadia.isPointInFill) {
      const pt = new DOMPoint(x, y);
      hit = D.districts.find(d => { try { return els[d.slug].isPointInFill(pt); } catch (e) { return false; } });
    }
    if (hit) return hit.slug;
    // Near a border or the coast: take the closest district centre within ~25 units.
    let best = null, bd = 25;
    D.districts.forEach(d => {
      const b = els[d.slug].getBBox();
      const dist = Math.hypot(b.x + b.width / 2 - x, b.y + b.height / 2 - y) - Math.min(b.width, b.height) / 2;
      if (dist < bd) { bd = dist; best = d.slug; }
    });
    return best;
  }
  $('#gpsBtn').addEventListener('click', () => {
    mapTouched();
    const hint = $('#gpsHint');
    if (!navigator.geolocation) { hint.textContent = t('gpsFail'); openList(); return; }
    hint.textContent = t('gpsLooking');
    navigator.geolocation.getCurrentPosition(pos => {
      const slug = districtAt(pos.coords.latitude, pos.coords.longitude);
      if (!slug) { hint.textContent = t('gpsFail'); openList(); return; }
      hint.textContent = t('gpsFound', { d: dName(DI[slug]) });
      selectDistrict(slug);
    }, () => { hint.textContent = t('gpsFail'); openList(); }, { timeout: 12000, maximumAge: 600000, enableHighAccuracy: false });
  });

  /* ---------- team identities: badges and chants ----------
     Badge art is the existing crest set (it still carries the old team names [O-2]).
     Kallolini Kolkata has no badge yet, so it shows a lettered crest. */
  const TEAMX = {
    1: { img: 'cooch-behar-royals', chant: ['রাজার জেলার চাষী আমরা, জিততে ভালোবাসি', 'Farmers of the royal district — we love to win'] },
    2: { img: 'sundari-terai', chant: ['বাঘের মতো লড়াই করব, ফসলে আজ ঘর ভরব', 'We fight like tigers and fill our homes with harvest'] },
    3: { img: 'pahadi-sur', chant: ['পাহাড় ভালোবাসি, ফসল ফলাবো রাশি রাশি', 'We love the hills, we grow harvests in heaps'] },
    4: { img: 'dinajpur-defenders', chant: ['দিনাজপুর এগিয়ে থাকে, দেখি কে হারায় কাকে', 'Dinajpur stays ahead — let us see who beats whom'] },
    5: { img: 'malda-joddha', chant: ['ফলের রাজা আমের দেশে, মালদাই জয়ী হবে শেষে', 'In the land of the mango, king of fruits, Malda wins in the end'] },
    6: { img: 'murshidabad-maati', chant: ['নবাবের মাটি নবাবের দেশ, নবাবেরই মতো জেতা অভ্যেস', 'Land of the Nawabs — winning like Nawabs is our habit'] },
    7: { img: 'nadia-nayak', chant: ['নদীয়ার মাটি হবে নাকো ব্যর্থ, আমরাই জিতব — এটাই সত্য', 'Nadia’s soil will never fail — we will win, that is the truth'] },
    8: { img: 'chobbish-paraganar-poli-maati', chant: ['গঙ্গা দিয়ে বইছে জল, আনন্দে আজ ফলাই ফসল', 'The Ganga flows on — joyfully we grow our crops'] },
    9: { img: 'sundarbaner-baagh', chant: ['বনবিবির শপথ নিয়ে, বলছি যাবো ট্রফি নিয়ে', 'By Bonbibi’s oath, we will carry home the trophy'] },
    10: { img: 'pragatisheel-shilpa-taluk' },
    11: { img: 'harit-hooghly', chant: ['হুগলির হাসি হুগলির মজা, আমরাই হবো যুদ্ধের রাজা', 'Hooghly’s smile, Hooghly’s joy — we will be kings of the contest'] },
    12: { img: 'medinipur-agniban', chant: ['মাটির জেলা মেদিনীপুরে, ফলাব ফসল গোলা ভরে', 'In Medinipur, land of rich soil, we will fill the granaries'] },
    13: { img: 'bankura-ghoda', img2: 'purulia-panthers', chant: ['শক্ত মাটি কম জল, তবুও ফলাই জেতার ফসল', 'Hard soil, little water — still we grow a winning crop'], chant2: ['পুরুলিয়াকে রুক্ষ ভাবো? দেখো সবাইকে হারিয়ে দেবো', 'Think Purulia is barren? Watch us beat everyone'] },
    14: { img: 'sufala-bardhaman', chant: ['আমরা চাষী বর্ধমানের, দৌড়াবো আজ সমুখপানে', 'We are Bardhaman’s farmers — today we race ahead'] },
    15: { img: 'birbhum-ravi', chant: ['লাল মাটির দাপটে, ফলবে ফসল মাঠে মাঠে', 'With the might of red soil, crops will grow in every field'] }
  };
  function crestHTML(tm, cls) {
    const x = TEAMX[tm.id] || {};
    if (x.img) return '<img class="crest-img ' + (cls || '') + '" src="assets/teams/' + x.img + '-' + lang + '.webp" width="640" height="800" alt="" loading="lazy" decoding="async">';
    return '<span class="crest ' + (cls || '') + '" aria-hidden="true">' + crest(tm) + '</span>';
  }
  const chantOf = (tm, k) => { const c = (TEAMX[tm.id] || {})[k || 'chant']; return c ? c[lang === 'bn' ? 0 : 1] : ''; };
  const teamDistricts = id => D.districts.filter(d => teamsOf(d).indexOf(id) > -1);

  function buildTeams() {
    const grid = $('#teamGrid');
    if (!grid) return;
    grid.innerHTML = D.teams.map((tm, i) => {
      const ch = chantOf(tm);
      return '<button type="button" class="tcard reveal' + (grid.dataset.built ? ' in' : '') + '" data-team="' + tm.id + '" style="--tc:' + tm.color + ';--ti:' + inkOn(tm.color) + ';--d:' + (i % 4) * 0.08 + 's">' +
        '<span class="tc-art">' + crestHTML(tm) + '<span class="num" aria-hidden="true">' + num(tm.id) + '</span></span>' +
        '<span class="tc-body"><b>' + esc(tName(tm)) + '</b><small>' + esc(teamDistricts(tm.id).map(dName).join(', ')) + '</small>' +
        (ch ? '<em>“' + esc(ch) + '”</em>' : '') + '</span></button>';
    }).join('');
    grid.dataset.built = '1';
    $$('.tcard', grid).forEach(observe);
  }
  if ($('#teamGrid')) $('#teamGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-team]');
    if (b) openTeam(+b.dataset.team);
  });

  /* Team sheet: badge, chant, districts. Picking a district starts enrolment in that team. */
  const teamSheet = $('#teamSheet');
  let openTeamId = null;
  function openTeam(id) {
    openTeamId = id;
    renderTeamSheet();
    openSheet(teamSheet);
  }
  function renderTeamSheet() {
    const tm = T[openTeamId], x = TEAMX[tm.id] || {};
    const art = crestHTML(tm, 'big') + (x.img2 ? '<img class="crest-img big" src="assets/teams/' + x.img2 + '.jpg" width="256" height="320" alt="" decoding="async">' : '');
    const chant = x.chant ? '<blockquote class="ts-chant"><div><p>“' + esc(chantOf(tm)) + '”</p>' + (x.chant2 ? '<p>“' + esc(chantOf(tm, 'chant2')) + '”</p>' : '') + '</div>' + listenBtn(chantOf(tm) + ' ' + chantOf(tm, 'chant2')) + '</blockquote>' : '';
    $('#teamSheetPanel').innerHTML =
      '<button type="button" class="x" data-close aria-label="' + t('close') + '">×</button>' +
      '<div class="ts-hero" style="' + teamVars(tm) + '"><div class="ts-crests">' + art + '</div>' +
      '<h2 id="tsTitle">' + esc(tName(tm)) + '</h2><p>' + t('teamNo', { n: num(tm.id) }) + ' · ' + t('seats', { n: num(tm.seats) }) + '</p></div>' + chant +
      '<h3 class="ts-h">' + t('tsPick') + '</h3><div class="ts-dists">' +
      teamDistricts(tm.id).map(d => '<button type="button" class="btn ghost" data-tsd="' + d.slug + '"><i class="dot" style="background:' + tm.color + '"></i><span>' + esc(dName(d)) + '</span><span class="go" aria-hidden="true">→</span></button>').join('') +
      '</div><button type="button" class="linkbtn" data-tsmap>🗺 ' + t('tsMap') + '</button>';
  }
  teamSheet.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.classList.contains('listen')) return;
    const id = openTeamId;
    if (b.dataset.tsd) { closeSheet(teamSheet); joinTeamDistrict(b.dataset.tsd, id); }
    else if (b.hasAttribute('data-tsmap')) { closeSheet(teamSheet); highlightTeam(id); }
  });
  function joinTeamDistrict(slug, teamId) {
    selectDistrict(slug, { quiet: true });
    if (Array.isArray(DI[slug].team)) {
      st.team = teamId; st.unsure = false; st.teamNote = '';
      if (st.ac && D.acs[st.ac][3] !== teamId) st.ac = null;
    }
    saveDraft();
    startFlow('team');
  }

  /* ---------- FAQ with search ---------- */
  const FAQ = [
    ['কৃষিরত্ন লিগ কী?', 'What is the Krishi Ratna League?', 'এক বছরের কৃষি লিগ, যেখানে প্রত্যেক অংশগ্রহণকারীর খামারই খেলার মাঠ। কৃষকেরা খামার উন্নত করবেন, নিজের দলের স্কোরে অবদান রাখবেন আর স্বীকৃতি ও পুরস্কারের জন্য খেলবেন।', 'A year-long agricultural league where each participant’s farm is the playing field. Farmers improve their farms, add to their team’s score and compete for recognition and prizes.'],
    ['নাম লেখাতে কত টাকা লাগে?', 'How much does it cost to join?', 'কিছুই না। নাম লেখানো সম্পূর্ণ বিনামূল্যে।', 'Nothing. Joining is completely free.'],
    ['কারা যোগ দিতে পারেন? বয়সের সীমা আছে?', 'Who can join? Is there an age limit?', 'পশ্চিমবঙ্গের যে কোনো কৃষক বা কৃষিতে আগ্রহী মানুষ। মহাচার্যজির মতে ‘যুব’ মানে উদ্যম, নির্দিষ্ট বয়স নয় — ৫০ বা ৮০ বছরেও যোগ দেওয়া যায়। একজন কৃষক, স্বামী-স্ত্রী বা ভাইবোন মিলে একটি খামার হতে পারেন।', 'Any farmer or farming enthusiast in West Bengal. MahacharyaJi defines ‘youth’ by energy, not age — you can join at 50 or 80. A farm can be one farmer, a couple or siblings.'],
    ['বড় জমি লাগবে কি?', 'Do I need a big farm?', 'না। এক বিঘা, দুই বিঘা বা দশ বিঘা — যা জমি আছে তা দিয়েই শুরু। নিজের হোক বা লিজ।', 'No. One, two or ten bigha — start with the land you have, owned or leased.'],
    ['কী কী লাগবে?', 'What do I need?', 'শুধু একটা মোবাইল নম্বর। আধার, ব্যাংকের তথ্য বা OTP কেউ মুখে চাইবে না।', 'Only a mobile number. Nobody will ask for Aadhaar, bank details or the OTP.'],
    ['আমার দল কীভাবে ঠিক হয়?', 'How is my team decided?', 'আপনার জেলা দিয়ে। উত্তর ও দক্ষিণ ২৪ পরগনায় আপনার বিধানসভা দিয়ে।', 'By your district. In North and South 24 Parganas, by your constituency.'],
    ['দলগুলি কীভাবে খেলবে?', 'How will the teams work?', '২৯৪টি বিধানসভা কেন্দ্র মিলে ১৫টি দল, প্রতিটিতে প্রায় ৩০০ থেকে ৪০০টি খামার। প্রতিটি খামারের স্কোর যোগ হয়ে দলের স্কোর হবে, তাই প্রতিবেশীরা একে অপরকে সাহায্য করবেন।', '294 constituencies form 15 teams of roughly 300 to 400 farms each. Every farm’s score adds to the team score, so neighbours help each other.'],
    ['নির্বাচিত কৃষকেরা কী সহায়তা পাবেন?', 'What support will selected farmers get?', 'আধুনিক প্রযুক্তি, স্মার্ট ও সমন্বিত চাষ, খামার পরিচালনা, বিক্রি, রপ্তানির প্রস্তুতি আর দেশ-বিদেশের বাজারের সঙ্গে যোগাযোগ।', 'Modern technology, smart and integrated farming, farm management, sales, export readiness and links to markets in India and abroad.'],
    ['কী পুরস্কার ঘোষণা হয়েছে?', 'What prizes have been announced?', 'প্রথম মরসুমের জন্য ₹৩ কোটির পুরস্কার তহবিল, যার ₹১ কোটির বেশি সেরা দল ও সেরা কৃষকদের জন্য। চূড়ান্ত বিভাগ ও বিচারের নিয়ম লিগের নিয়মাবলিতে জানানো হবে।', 'A ₹3 crore prize pool for season one, with more than ₹1 crore for the winning team and the best farmers. Final categories and judging rules will come in the league rulebook.'],
    ['কী আর্থিক সহায়তা ঘোষণা হয়েছে?', 'What financial support has been announced?', 'পরিকল্পনা অনুযায়ী ৫,০০০ নির্বাচিত খামারের প্রত্যেকটি একজন সহযোগীর কাছ থেকে ₹১ লক্ষ পাবে, বছরে পাঁচটি ₹২০,০০০ কিস্তিতে — মোট লক্ষ্য ₹৫০ কোটি। এটি পরিকল্পনা; চূড়ান্ত শর্ত নিয়মাবলিতে জানানো হবে।', 'The plan pairs each of 5,000 selected farms with a sponsor giving ₹1 lakh in five ₹20,000 instalments over the year — a ₹50 crore target. This is a plan; final terms will come in the rulebook.'],
    ['খামারের স্কোর কীভাবে হবে?', 'How are farms scored?', 'প্রতিটি খামার ১০০-এর মধ্যে স্কোর পাবে, আর তা যোগ হবে দলের স্কোরে। নির্দিষ্ট মানদণ্ড ও বিচারপদ্ধতি এখনও প্রকাশিত হয়নি।', 'Each farm gets a score out of 100, which adds to the team score. The exact criteria and judging method are not yet published.'],
    ['ভিটেমাটি সহযোগিতা কী?', 'What is Bhite Mati sponsorship?', 'বাইরে প্রতিষ্ঠিত একজন বাঙালি তাঁর পূর্বপুরুষের এলাকার একজন নির্বাচিত কৃষকের পাশে দাঁড়াবেন। এটা শুধু দান নয় — নিজের ভিটেমাটির সঙ্গে এক সেতু।', 'A Bengali settled elsewhere stands beside a selected farmer in their ancestral area. It is not just charity — it is a bridge back to their home soil.'],
    ['আমি কি এখনই কাউকে সহযোগিতা করতে পারি?', 'Can I sponsor someone now?', 'এই ওয়েবসাইটে এখনও নয়। আয়োজকেরা যাচাই করা পদ্ধতি প্রকাশ না করা পর্যন্ত অপেক্ষা করুন। যাচাই না করা অনুরোধে টাকা পাঠাবেন না।', 'Not through this website yet. Wait until the organisers publish a verified process. Never send money to an unverified request.'],
    ['মাঝপথে নেট চলে গেলে?', 'What if the network drops midway?', 'আপনার উত্তর ফোনেই সেভ থাকে। নেট ফিরলে যেখানে ছিলেন সেখান থেকেই শুরু করবেন।', 'Your answers stay saved on the phone. When the network returns, you carry on from where you were.'],
    ['আচার্য কারা?', 'Who are the Acharyas?', 'এলাকার দায়িত্বপ্রাপ্ত প্রধান। তাঁরা কৃষকদের নাম লেখাতে পাশে বসে সাহায্য করেন।', 'Zonal heads who sit with farmers and help them enrol.'],
    ['কারা আয়োজন করছে?', 'Who organises the league?', 'কর্মযোগ ফর দ্য ২১স্ট সেঞ্চুরি ও ভারতীয় কৃষক সমাজের যৌথ উদ্যোগ।', 'A joint initiative of Karmyog for the 21st Century and Bharatiya Krishak Samaj.']
  ];
  function buildFaq() {
    if (!$('#faqList')) return;
    const i = lang === 'bn' ? 0 : 1;
    $('#faqList').innerHTML = FAQ.map(f => '<details><summary>' + esc(f[i]) + '</summary><div class="ans"><p>' + esc(f[i + 2]) + '</p>' + listenBtn(f[i] + ' ' + f[i + 2]) + '</div></details>').join('');
    filterFaq();
  }
  function filterFaq() {
    if (!$('#faqSearch')) return;
    const q = ($('#faqSearch').value || '').trim().toLowerCase();
    let shown = 0;
    $$('#faqList details').forEach(d => { const ok = !q || d.textContent.toLowerCase().indexOf(q) > -1; d.hidden = !ok; if (ok) shown++; });
    $('#faqEmpty').hidden = shown > 0;
  }
  if ($('#faqSearch')) $('#faqSearch').addEventListener('input', filterFaq);

  /* ---------- reveal on scroll + counters ---------- */
  let io = null;
  function observe(el) {
    if (!MOTION || !io) { el.classList.add('in'); return; }
    io.observe(el);
  }
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        const tl = en.target.closest('.timeline');
        if (tl) tl.classList.add('drawn');
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  }
  const fmtCount = (el, v) => (el.dataset.prefix || '') + num(v >= 1000 ? v.toLocaleString('en-IN') : v);
  function countUp(el) {
    const end = +el.dataset.count;
    if (!MOTION) { el.textContent = fmtCount(el, end); el.dataset.done = '1'; return; }
    const t0 = performance.now(), dur = 1300;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmtCount(el, Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step); else el.dataset.done = '1';
    };
    requestAnimationFrame(step);
  }

  /* ---------- header, menu, scroll-linked effects, dock ---------- */
  const bar = $('.scrollbar span'), header = $('.top'), steps = $('#steps'), dock = $('#dock');
  const heroFilm = $('#hero'), heroInner = $('.hero-film-inner');
  const nav = $('#nav'), menuBtn = $('#menuBtn');
  let menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    onScroll();
  }
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  let ticking = false;
  function onScroll() {
    ticking = false;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--sp', h > 0 ? (scrollY / h).toFixed(4) : 0);
    const hb = heroFilm ? heroFilm.offsetHeight : 0;
    header.classList.toggle('on-dark', scrollY < hb - 70 && !menuOpen);
    header.classList.toggle('scrolled', scrollY > 8);
    if (MOTION && scrollY < hb) {
      heroInner.style.transform = 'translateY(' + (scrollY * 0.28).toFixed(1) + 'px)';
      heroInner.style.opacity = Math.max(0, 1 - scrollY / (hb * 0.85)).toFixed(3);
    }
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
    steps.style.setProperty('--sp', p.toFixed(3));
    setDock();
  }
  function setDock() {
    const m = $('#mapSection').getBoundingClientRect();
    const mapInView = m.top < innerHeight * 0.55 && m.bottom > 140;
    const show = scrollY > (heroFilm ? heroFilm.offsetHeight : 0) * 0.6 && !mapInView && card.hidden && !flowOpen;
    dock.classList.toggle('show', show);
    dock.setAttribute('aria-hidden', show ? 'false' : 'true');
    $$('button', dock).forEach(b => { b.tabIndex = show ? 0 : -1; });
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  function joinFromAnywhere() {
    if (st.dist) { startFlow(); return; }
    $('#mapSection').scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'start' });
    toast(t('pickFirst'));
    touched = false; clearTimeout(n1); clearTimeout(n2);
    setTimeout(() => { if (!touched) showNudge('tap'); }, 700);
  }
  $('#finalBtn').addEventListener('click', joinFromAnywhere);
  $('#dockBtn').addEventListener('click', joinFromAnywhere);

  /* ---------- hero film: only on fast connections, never on 2G/3G or data saver ---------- */
  const vid = $('#heroVideo'), vt = $('#videoToggle');
  function setVt(paused) {
    const l = $('.vt-label', vt);
    l.dataset.bn = paused ? 'ভিডিও চালান' : 'ভিডিও থামান';
    l.dataset.en = paused ? 'Play film' : 'Pause film';
    l.textContent = l.dataset[lang];
    $('.vt-ic', vt).textContent = paused ? '▶' : 'Ⅱ';
  }
  if (vid && vt) (function () {
    const c = navigator.connection || {};
    const wide = matchMedia('(min-width: 900px)').matches;
    if (wide) vid.poster = 'assets/krl-farm-hero.jpg';
    const slow = c.saveData || /2g|3g/.test(c.effectiveType || '');
    if (!MOTION || slow || (!wide && c.effectiveType !== '4g')) return;
    vid.src = vid.dataset.src;
    vid.preload = 'auto';
    const pr = vid.play();
    if (pr && pr.then) pr.then(() => { vt.hidden = false; setVt(false); }).catch(() => {});
  })();
  if (vt) vt.addEventListener('click', () => {
    if (vid.paused) { vid.play().catch(() => {}); setVt(false); } else { vid.pause(); setVt(true); }
  });

  /* ---------- league anthem ---------- */
  const audio = $('#anthemAudio'), anthemBox = $('#anthem'), aBtn = $('#anthemToggle'), seek = $('#anthemSeek'), aTime = $('#anthemTime');
  let seeking = false;
  const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return num(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')); };
  const aClock = () => { if (!audio) return; aTime.textContent = mmss(audio.currentTime) + ' / ' + mmss(isFinite(audio.duration) ? audio.duration : 196); };
  function aSync() {
    if (!audio) return;
    const playing = !audio.paused;
    anthemBox.classList.toggle('playing', playing);
    $('span', aBtn).textContent = playing ? 'Ⅱ' : '▶';
    aBtn.dataset.ariaBn = playing ? 'লিগের গান থামান' : 'লিগের গান চালান';
    aBtn.dataset.ariaEn = playing ? 'Pause the league anthem' : 'Play the league anthem';
    aBtn.setAttribute('aria-label', lang === 'bn' ? aBtn.dataset.ariaBn : aBtn.dataset.ariaEn);
    $$('[data-anthem-play]').forEach(b => {
      $('.play-ic', b).textContent = playing ? 'Ⅱ' : '▶';
      const l = b.lastElementChild;
      l.dataset.bn = playing ? 'গান থামান' : 'লিগের গান শুনুন';
      l.dataset.en = playing ? 'Pause the anthem' : 'Hear the league anthem';
      l.textContent = l.dataset[lang];
    });
    aClock();
  }
  function anthemToggle() {
    if (audio.paused) audio.play().catch(() => toast(t('anthemFail'))); else audio.pause();
  }
  if (audio) {
  aBtn.addEventListener('click', anthemToggle);
  $$('[data-anthem-play]').forEach(b => b.addEventListener('click', anthemToggle));
  ['play', 'pause', 'ended'].forEach(ev => audio.addEventListener(ev, aSync));
  audio.addEventListener('loadedmetadata', () => { seek.max = Math.floor(audio.duration) || 196; aClock(); });
  audio.addEventListener('timeupdate', () => { if (!seeking) seek.value = Math.floor(audio.currentTime); aClock(); });
  seek.addEventListener('input', () => { seeking = true; try { audio.currentTime = +seek.value; } catch (e) { /* not loaded yet */ } aClock(); });
  seek.addEventListener('change', () => { seeking = false; });
  }

  /* ---------- model farm tabs ---------- */
  const mtabs = $$('.model-tab');
  function selectTab(tab) {
    mtabs.forEach(x => {
      const on = x === tab;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  mtabs.forEach((tb, i) => {
    tb.addEventListener('click', () => selectTab(tb));
    tb.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = mtabs[(i + (e.key === 'ArrowRight' ? 1 : mtabs.length - 1)) % mtabs.length];
      selectTab(n); n.focus();
    });
  });

  /* ---------- network ---------- */
  function netState() { $('#netBanner').hidden = navigator.onLine !== false; }
  addEventListener('online', netState);
  addEventListener('offline', netState);

  /* ---------- enrolment state ---------- */
  const params = new URLSearchParams(location.search);
  const refRaw = (params.get('ref') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const REF = /^[A-Z]{2}-?\d{1,4}$/.test(refRaw) ? refRaw : '';
  const ASSISTED = REF && params.get('mode') === 'acharya';
  const blank = () => ({ dist: null, team: null, ac: null, village: '', name: '', gender: null, age: '', phone: '', otpOk: false, bigha: 1, tenure: null, water: [], crops: [], interest: null, teamCode: '', code: REF, consent: false, voiced: {}, screen: null });
  let st = Object.assign(blank(), store.get('krl-draft') || {});
  if (REF) st.code = REF;
  st.voiced = st.voiced || {};
  let saveT = null;
  function saveDraft() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      const copy = Object.assign({}, st);
      delete copy.otpOk;
      store.set('krl-draft', copy);
    }, 150);
  }

  /* ---------- enrolment flow ---------- */
  const flow = $('#flow'), body = $('#flowBody'), nextBtn = $('#flowNext');
  const STEP = { team: 0, split: 0, where: 0, name: 1, about: 1, phone: 1, otp: 1, land: 2, water: 2, crops: 2, group: 3, review: 4 };
  let flowOpen = false, hist = [], closing = false, editing = false;

  const team = () => st.team ? T[st.team] : null;
  const acsFor = () => {
    const d = DI[st.dist];
    if (!d) return [];
    const split = Array.isArray(d.team);
    return Object.keys(D.acs).map(Number).filter(n => D.acs[n][2] === d.acgroup && (!split || !st.team || st.unsure || D.acs[n][3] === st.team));
  };
  const acLabel = n => num(n) + ' · ' + (lang === 'bn' ? D.acs[n][0] : D.acs[n][1]);
  function opt(key, val, icon, label, on, sub, multi) {
    return '<button type="button" class="opt' + (st.voiced[key + ':' + val] ? ' voiced' : '') + '" data-k="' + key + '" data-v="' + val + '" ' +
      (multi ? 'aria-pressed="' + !!on + '"' : 'role="radio" aria-checked="' + !!on + '"') + '>' +
      '<span class="ic" aria-hidden="true">' + icon + '</span><span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';
  }
  const qh = (text, id) => '<div class="q"><h2' + (id ? ' id="flowQ" tabindex="-1"' : '') + '>' + text + '</h2>' + listenBtn(text) + '</div>';
  const ql = (text, forId) => '<div class="q"><label for="' + forId + '">' + text + '</label>' + listenBtn(text) + '</div>';
  const vtag = k => st.voiced[k] ? '<span class="voice-tag">' + t('voicedTag') + '</span>' : '';
  const WATER = [['pond', '🐟'], ['tube', '🚰'], ['canal', '〰️'], ['rain', '🌧️']];
  const CROPS = [['rice', '🌾'], ['veg', '🥬'], ['potato', '🥔'], ['jute', '🌿'], ['fruit', '🥭'], ['oil', '🌼'], ['fish', '🐟'], ['animal', '🐄']];

  const V = {
    team() {
      const tm = team(), d = DI[st.dist];
      return {
        cta: t('joinTeam'), q: t('yourTeam') + ': ' + tName(tm),
        html: '<p style="font-size:18px" id="flowQ" tabindex="-1">' + t('youAreFrom', { d: esc(dName(d)) }) + '</p>' +
          '<div class="teamhero pop" style="margin-top:12px">' + crestHTML(tm) + '<h2>' + esc(tName(tm)) + '</h2><p>' + t('teamNo', { n: num(tm.id) }) + ' · ' + t('seats', { n: num(tm.seats) }) + '</p></div>' +
          '<div class="facts"><span>✓ ' + t('free') + '</span><span>✓ ' + t('tenQ') + '</span><span>✓ ' + t('twoMin') + '</span></div>' +
          '<button type="button" class="linkbtn" data-act="otherDist">↺ ' + t('otherDist') + '</button>'
      };
    },
    split() {
      const d = DI[st.dist];
      return {
        cta: t('goOn'), q: t('splitQ'),
        html: qh(t('splitQ'), 1) + '<p class="sub">' + t('splitSub', { d: esc(dName(d)) }) + '</p><div class="opts" role="radiogroup">' +
          [8, 9].map(id => opt('team', id, '<i class="dot" style="background:' + T[id].color + '"></i>', '<b>' + esc(tName(T[id])) + '</b>', st.team === id && !st.unsure, t('places' + id))).join('') +
          opt('team', 'unsure', '📍', t('unsure'), !!st.unsure) + '</div><p class="err" id="err"></p>'
      };
    },
    where() {
      const list = acsFor();
      const note = st.teamNote ? '<p class="saved" style="background:var(--gold-soft);color:var(--gold-ink)">' + esc(st.teamNote) + '</p>' : '';
      return {
        cta: t('nextQ'), q: t('acQ'),
        html: ql(t('acQ'), 'acSel').replace('<label', '<label id="flowQ" tabindex="-1"') +
          '<select class="inp' + (st.voiced.ac ? ' voiced' : '') + '" id="acSel"><option value="">' + t('acPick') + '</option>' +
          list.map(n => '<option value="' + n + '"' + (n === st.ac ? ' selected' : '') + '>' + esc(acLabel(n)) + '</option>').join('') + '</select>' + vtag('ac') +
          note + ql(t('villageQ'), 'village') +
          '<input class="inp' + (st.voiced.village ? ' voiced' : '') + '" id="village" autocomplete="address-level3" placeholder="' + t('villagePh') + '" value="' + esc(st.village) + '">' + vtag('village') +
          '<p class="sub" style="margin-top:8px">' + t('villageSub') + '</p><p class="err" id="err"></p>'
      };
    },
    name() {
      return {
        cta: t('nextQ'), q: t('nameQ'),
        html: ql(t('nameQ'), 'nm').replace('<label', '<label id="flowQ" tabindex="-1"') +
          '<input class="inp' + (st.voiced.name ? ' voiced' : '') + '" id="nm" autocomplete="name" placeholder="' + t('namePh') + '" value="' + esc(st.name) + '">' + vtag('name') + '<p class="err" id="err"></p>'
      };
    },
    about() {
      return {
        cta: t('nextQ'), q: t('genderQ') + '. ' + t('ageQ'),
        html: qh(t('genderQ'), 1) + '<div class="opts" role="radiogroup"><div class="opts two">' +
          opt('gender', 'f', '👩', t('female'), st.gender === 'f') + opt('gender', 'm', '👨', t('male'), st.gender === 'm') + '</div>' +
          opt('gender', 'o', '🧑', t('otherG'), st.gender === 'o') + '</div>' +
          ql(t('ageQ'), 'age') + '<input class="inp' + (st.voiced.age ? ' voiced' : '') + '" id="age" inputmode="numeric" pattern="[0-9০-৯]*" maxlength="3" placeholder="' + t('agePh') + '" value="' + esc(num(st.age)) + '">' + vtag('age') + '<p class="err" id="err"></p>'
      };
    },
    phone() {
      return {
        cta: t('sendCode'), q: t('phoneQ'),
        html: ql(t('phoneQ'), 'ph').replace('<label', '<label id="flowQ" tabindex="-1"') +
          '<input class="inp' + (st.voiced.phone ? ' voiced' : '') + '" id="ph" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="14" placeholder="98300 00000" value="' + esc(num(st.phone)) + '" style="letter-spacing:.06em">' + vtag('phone') +
          '<p class="sub" style="margin-top:8px">' + t('phoneSub') + '</p><p class="err" id="err"></p>'
      };
    },
    otp() {
      return {
        cta: t('verify'), q: t('otpQ') + '. ' + t('otpSub'),
        html: qh(t('otpQ'), 1) + '<p class="sub">' + t('otpSub') + '</p>' +
          '<div class="otp" role="group" aria-label="OTP">' + [0, 1, 2, 3].map(i => '<input inputmode="numeric" maxlength="1" aria-label="' + (i + 1) + '"' + (i === 0 ? ' autocomplete="one-time-code"' : '') + '>').join('') + '</div>' +
          (CFG.demo ? '<p class="center sub">' + t('otpDemo') + '</p>' : '') +
          '<p class="center" id="resendBox" style="font-size:15px;color:var(--muted)"></p><p class="err center" id="err"></p>' +
          '<p class="saved"><span aria-hidden="true">💾</span><span>' + t('savedNote') + '</span></p>'
      };
    },
    land() {
      return {
        cta: t('nextQ'), q: t('landQ'),
        html: qh(t('landQ'), 1) +
          '<div class="stepper' + (st.voiced.bigha ? ' voiced' : '') + '"><button type="button" data-act="bm" aria-label="' + t('less') + '">−</button><output id="bighaOut" aria-live="polite">' + num(st.bigha) + ' ' + t('bigha') + '<small>' + t('kathaNote') + '</small></output><button type="button" data-act="bp" aria-label="' + t('more') + '">+</button></div>' + vtag('bigha') +
          qh(t('tenureQ')) + '<div class="opts two" role="radiogroup">' + opt('tenure', 'own', '🏡', t('own'), st.tenure === 'own') + opt('tenure', 'lease', '📄', t('lease'), st.tenure === 'lease') + '</div><p class="err" id="err"></p>'
      };
    },
    water() {
      return {
        cta: t('nextQ'), q: t('waterQ'),
        html: qh(t('waterQ'), 1) + '<p class="sub">' + t('manyOk') + '</p><div class="opts two">' + WATER.map(w => opt('water', w[0], w[1], t(w[0]), st.water.indexOf(w[0]) > -1, '', true)).join('') + '</div><p class="err" id="err"></p>'
      };
    },
    crops() {
      return {
        cta: t('nextQ'), q: t('cropsQ'), nudge: '⏱ ' + t('twoLeft'),
        html: qh(t('cropsQ'), 1) + '<p class="sub">' + t('manyOk') + '</p><div class="opts two">' + CROPS.map(c => opt('crops', c[0], c[1], t(c[0]), st.crops.indexOf(c[0]) > -1, '', true)).join('') + '</div><p class="err" id="err"></p>'
      };
    },
    group() {
      return {
        cta: t('seeAll'), q: t('groupQ') + ' ' + t('groupSub'),
        html: qh(t('groupQ'), 1) + '<p class="sub">' + t('groupSub') + '</p><div class="opts" role="radiogroup">' +
          opt('interest', 'create', '＋', '<b>' + t('gCreate') + '</b>', st.interest === 'create', t('gCreateS')) +
          opt('interest', 'join', '#', '<b>' + t('gJoin') + '</b>', st.interest === 'join', t('gJoinS')) +
          opt('interest', 'match', '⇄', '<b>' + t('gMatch') + '</b>', st.interest === 'match') +
          opt('interest', 'later', '⏳', t('gLater'), st.interest === 'later') + '</div>' +
          (st.interest === 'join' ? ql(t('teamCodeQ'), 'tcode') + '<input class="inp" id="tcode" autocapitalize="characters" value="' + esc(st.teamCode) + '">' : '') +
          ql(t('codeQ'), 'acode') + '<input class="inp" id="acode" autocapitalize="characters" placeholder="' + t('codePh') + '" value="' + esc(st.code) + '"' + (REF ? ' readonly' : '') + '>' +
          (REF ? '<p class="sub" style="margin-top:6px">✓ ' + t('codeLocked') + '</p>' : '')
      };
    },
    review() {
      const tm = team(), d = DI[st.dist];
      const g = { f: t('female'), m: t('male'), o: t('otherG') }[st.gender] || '';
      const gi = { create: t('gCreate'), join: t('gJoin') + (st.teamCode ? ' · ' + st.teamCode : ''), match: t('gMatch'), later: t('gLater') }[st.interest] || t('gLater');
      const rows = [
        ['rTeam', tName(tm), null, null], ['rDist', dName(d), null, null],
        ['rAc', st.ac ? acLabel(st.ac) : '', 'where', 'ac'], ['rVillage', st.village, 'where', 'village'],
        ['rName', st.name, 'name', 'name'], ['rGender', g, 'about', 'gender'], ['rAge', num(st.age), 'about', 'age'],
        ['rPhone', num(st.phone) + ' ✓', 'phone', 'phone'],
        ['rLand', num(st.bigha) + ' ' + t('bigha') + ', ' + (st.tenure === 'own' ? t('own') : t('lease')), 'land', 'bigha'],
        ['rWater', st.water.map(w => t(w)).join(', '), 'water', 'water'], ['rCrops', st.crops.map(c => t(c)).join(', '), 'crops', 'crops'],
        ['rGroup', gi, 'group', 'interest'], ['rCode', st.code || t('none'), REF ? null : 'group', null]
      ];
      const anyVoiced = k => k && Object.keys(st.voiced).some(x => x === k || x.indexOf(k + ':') === 0);
      return {
        cta: t('submit'), ok: true, q: t('reviewQ'),
        html: qh(t('reviewQ'), 1) + '<p class="sub">' + t('reviewSub') + '</p>' +
          rows.map(r => '<div class="rv' + (anyVoiced(r[3]) ? ' voiced' : '') + '"><span>' + t(r[0]) + '</span><b>' + esc(r[1]) + (anyVoiced(r[3]) ? '<br><span class="voice-tag">' + t('voicedTag') + '</span>' : '') + '</b>' +
            (r[2] ? '<button type="button" data-edit="' + r[2] + '">' + t('change') + '</button>' : '') + '</div>').join('') +
          '<label class="consent"><input type="checkbox" id="consent"' + (st.consent ? ' checked' : '') + '><span>' + t('consent') + '</span>' + listenBtn(t('consent')) + '</label><p class="err" id="err"></p>'
      };
    },
    done() {
      const tm = team(), first = (st.name || '').trim().split(/\s+/)[0] || '';
      const sms = t('smsText', { n: esc(first), t: esc(tName(tm)), r: esc(st.ref) });
      return {
        cta: null, q: t('nowMember', { t: tName(tm) }),
        html: '<div class="done-hero"><div class="teamhero pop">' + crestHTML(tm) + '<p style="font-size:18px">' + t('welcome', { n: esc(first) }) + '</p><h2 id="flowQ" tabindex="-1">' + t('nowMember', { t: esc(tName(tm)) }) + '</h2></div>' +
          '<p style="margin-top:14px">' + t('refNo') + ' <b>' + esc(st.ref) + '</b> ' + (CFG.demo ? '<span class="sample">' + t('demoTag') + '</span>' : '') + '</p></div>' +
          '<div class="sms"><b>' + t('smsFrom') + '</b>' + sms + '</div>' +
          '<p class="saved" style="background:var(--gold-soft);color:var(--gold-ink)"><span aria-hidden="true">📣</span><span>' + t('callFriends') + '</span></p>' +
          '<div class="share"><a class="btn big wa" id="waBtn" target="_blank" rel="noopener">' + t('waShare') + '</a>' +
          '<button type="button" class="btn big ghost" data-act="card" style="justify-content:center">' + t('cardShare') + '</button>' +
          '<button type="button" class="btn big ghost" data-act="farmteam" style="justify-content:center">' + t('farmTeam') + '</button>' +
          (ASSISTED ? '<button type="button" class="btn big gold" data-act="another">' + t('another') + '</button>' : '') +
          '<button type="button" class="linkbtn" data-act="home" style="justify-self:center">' + t('home') + '</button></div>'
      };
    }
  };

  let otpTimer = null, resendCount = 0;
  function render(id, dir) {
    st.screen = id;
    saveDraft();
    clearTimeout(typeT);
    clearInterval(otpTimer);
    const tm = team();
    flow.setAttribute('style', teamVars(tm) || '--team:#0a1730;--team-ink:#ffffff');
    const v = V[id]();
    body.innerHTML = v.html;
    body.classList.remove('enter', 'backward');
    if (MOTION) { void body.offsetWidth; body.classList.add('enter'); if (dir === 'back') body.classList.add('backward'); }
    body.scrollTop = 0;
    // progress
    const k = STEP[id];
    $('#prog').innerHTML = id === 'done' ? '' : t('steps').map((s, i) => '<span class="' + (i < k ? 'done' : i === k ? 'cur' : '') + '">' + s + '</span>').join('');
    // footer
    $('#flowFoot').hidden = !v.cta;
    if (v.cta) {
      nextBtn.textContent = v.cta;
      nextBtn.classList.toggle('ok', !!v.ok);
    }
    const nudge = $('#flowNudge');
    nudge.hidden = !v.nudge;
    if (v.nudge) nudge.textContent = v.nudge;
    $('#flowBack').setAttribute('aria-label', t('back'));
    $('#flowClose').setAttribute('aria-label', t('closeSaved'));
    wire(id);
    const h = $('#flowQ', body);
    if (h) h.focus({ preventScroll: true });
  }

  function wire(id) {
    const err = $('#err', body);
    const sel = $('#acSel', body);
    if (sel) sel.addEventListener('change', () => {
      st.ac = +sel.value || null;
      delete st.voiced.ac; sel.classList.remove('voiced');
      if (st.ac) {
        const tid = D.acs[st.ac][3];
        if (tid !== st.team) {
          const wasSet = !!st.team;
          st.team = tid;
          st.teamNote = (wasSet || st.unsure) ? t('teamSwitched', { t: tName(T[tid]) }) : '';
          render('where');
          return;
        }
      }
      saveDraft();
    });
    bindText('village', 'village');
    bindText('nm', 'name');
    bindText('age', 'age', v => toAscii(v).replace(/\D/g, ''));
    bindText('ph', 'phone', v => toAscii(v).replace(/\D/g, ''));
    bindText('tcode', 'teamCode', v => v.toUpperCase());
    if (!REF) bindText('acode', 'code', v => v.toUpperCase());
    const consent = $('#consent', body);
    if (consent) {
      consent.addEventListener('change', () => { st.consent = consent.checked; saveDraft(); const er = $('#err', body); if (er && consent.checked) er.textContent = ''; });
    }
    if (id === 'otp') wireOtp();
    if (id === 'done') {
      const a = $('#waBtn', body);
      const url = location.origin + location.pathname;
      a.href = 'https://wa.me/?text=' + encodeURIComponent(t('waText', { t: tName(team()), u: url }));
      confetti();
    }
    if (err) err.textContent = '';
  }

  /* Text fields: save as typed; manual edits clear the voice flag; nudge to voice when typing is hard. */
  let typeT = null;
  function bindText(elId, key, clean) {
    const el = $('#' + elId, body);
    if (!el) return;
    let dels = 0;
    const armIdle = () => {
      clearTimeout(typeT);
      if (!SR || micDenied) return;
      typeT = setTimeout(typingNudge, 20000);
    };
    el.addEventListener('focus', armIdle);
    el.addEventListener('input', e => {
      st[key] = clean ? clean(el.value) : el.value;
      if (st.voiced[key]) { delete st.voiced[key]; el.classList.remove('voiced'); const tag = el.nextElementSibling; if (tag && tag.classList.contains('voice-tag')) tag.remove(); }
      if (e.inputType && e.inputType.indexOf('delete') === 0) { dels++; if (dels === 6) typingNudge(); }
      armIdle();
      saveDraft();
    });
    el.addEventListener('blur', () => clearTimeout(typeT));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); next(); } });
  }
  function typingNudge() {
    if (!SR || micDenied || !flowOpen) return;
    const n = $('#flowNudge');
    n.innerHTML = '<span>' + esc(t('typeHard')) + '</span><button type="button" class="btn small" style="background:var(--pink)" id="nudgeMic">' + t('sayIt') + '</button>';
    n.hidden = false;
    $('#nudgeMic').addEventListener('click', () => { n.hidden = true; openVoice(st.screen); });
  }

  function wireOtp() {
    const ins = $$('.otp input', body);
    const fill = s => { const d = toAscii(s).replace(/\D/g, '').slice(0, 4); ins.forEach((x, i) => { x.value = d[i] ? num(d[i]) : ''; }); return d; };
    ins.forEach((x, i) => {
      x.addEventListener('input', () => {
        const d = toAscii(x.value).replace(/\D/g, '');
        if (d.length > 1) { const all = fill(d); if (all.length === 4) next(); return; }
        x.value = d ? num(d) : '';
        if (d && i < 3) ins[i + 1].focus();
        if (ins.every(y => y.value)) next();
      });
      x.addEventListener('keydown', e => { if (e.key === 'Backspace' && !x.value && i > 0) ins[i - 1].focus(); });
      x.addEventListener('paste', e => { e.preventDefault(); fill((e.clipboardData || window.clipboardData).getData('text')); });
    });
    // Web OTP: Android reads the SMS by itself once a real SMS gateway is connected.
    if (!CFG.demo && 'OTPCredential' in window) {
      navigator.credentials.get({ otp: { transport: ['sms'] } }).then(c => { if (c && c.code) { fill(c.code); next(); } }).catch(() => {});
    }
    resendTimer();
  }

  function confetti() {
    if (!MOTION) return;
    const box = document.createElement('div');
    box.className = 'confetti';
    const cols = [team().color, '#E0A11B', '#0a1730', '#ffffff', '#C2477A'];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cols[i % cols.length];
      c.style.animationDelay = (Math.random() * 0.6) + 's';
      c.style.animationDuration = (2 + Math.random() * 1.4) + 's';
      box.appendChild(c);
    }
    flow.appendChild(box);
    setTimeout(() => box.remove(), 4000);
  }

  function showErr(msg, focusSel) {
    const err = $('#err', body);
    if (err) err.textContent = msg;
    const f = focusSel && $(focusSel, body);
    if (f) f.focus();
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { /* ignore */ }
  }

  /* Validate the current screen; return the next screen id or null. */
  function nextOf(id) {
    switch (id) {
      case 'team': return 'where';
      case 'split':
        if (!st.team && !st.unsure) { showErr(t('eTeam')); return null; }
        return 'where';
      case 'where':
        if (!st.ac) { showErr(t('eAc'), '#acSel'); return null; }
        if ((st.village || '').trim().length < 2) { showErr(t('eVillage'), '#village'); return null; }
        return 'name';
      case 'name':
        if ((st.name || '').trim().length < 2) { showErr(t('eName'), '#nm'); return null; }
        return 'about';
      case 'about': {
        if (!st.gender) { showErr(t('eGender')); return null; }
        const a = +st.age;
        if (!(a >= 15 && a <= 100)) { showErr(t('eAge'), '#age'); return null; }
        return 'phone';
      }
      case 'phone': {
        let p = String(st.phone || '');
        if (p.length === 12 && p.indexOf('91') === 0) p = p.slice(2);
        if (p.length === 11 && p[0] === '0') p = p.slice(1);
        if (!/^[6-9]\d{9}$/.test(p)) { showErr(t('ePhone'), '#ph'); return null; }
        st.phone = p;
        return 'otp';
      }
      case 'otp': {
        const code = $$('.otp input', body).map(x => toAscii(x.value)).join('');
        if (!/^\d{4}$/.test(code)) { showErr(t('eOtp'), '.otp input'); return null; }
        st.otpOk = true;
        return 'land';
      }
      case 'land':
        if (!st.tenure) { showErr(t('eTenure')); return null; }
        return 'water';
      case 'water':
        if (!st.water.length) { showErr(t('eMulti')); return null; }
        return 'crops';
      case 'crops':
        if (!st.crops.length) { showErr(t('eMulti')); return null; }
        return 'group';
      case 'group': return 'review';
      case 'review': return 'done';
    }
    return null;
  }

  function next() {
    const id = st.screen;
    let to = nextOf(id);
    if (!to) return;
    if (id === 'review') { submit(); return; }
    // Editing from review: come straight back, except a new phone must be verified first.
    if (editing && to !== 'otp' && id !== 'team' && id !== 'split') { editing = false; to = 'review'; }
    forward(to);
  }

  function submit() {
    if (!st.consent) { showErr(t('consentNeed'), '#consent'); return; }
    st.voiced = {}; // the farmer has now seen and confirmed every field
    st.ref = 'KRL-' + String(st.team).padStart(2, '0') + '-' + String(Math.floor(100000 + Math.random() * 900000));
    if (!CFG.demo && navigator.onLine === false) {
      const box = store.get('krl-outbox') || [];
      box.push(Object.assign({}, st));
      store.set('krl-outbox', box);
      toast(t('queued'), 4500);
    }
    store.set('krl-enrolled', { team: st.team, ref: st.ref, first: (st.name || '').trim().split(/\s+/)[0] });
    store.del('krl-draft');
    forward('done');
  }

  function forward(id) {
    hist.push(id);
    history.pushState({ krlFlow: hist.length }, '');
    render(id, 'fwd');
  }
  function startFlow(at) {
    if (!st.dist) { joinFromAnywhere(); return; }
    hideCard();
    const d = DI[st.dist];
    const first = at || (Array.isArray(d.team) && !st.team ? 'split' : 'team');
    flowOpen = true;
    flow.hidden = false;
    root.classList.add('lock');
    setDock();
    hist = [first];
    history.pushState({ krlFlow: 1 }, '');
    render(first, 'fwd');
  }
  function hideFlow() {
    flowOpen = false;
    flow.hidden = true;
    root.classList.remove('lock');
    clearInterval(otpTimer);
    clearTimeout(typeT);
    hist = [];
    editing = false;
    if (st.screen === 'done') { clearTimeout(saveT); const keep = st.code; st = blank(); st.code = keep; store.del('krl-draft'); }
    clearMap();
    selSlug = null;
    if (TTS) speechSynthesis.cancel();
    refreshHeroBanners();
    setDock();
  }
  function closeFlow() {
    saveDraft();
    if (!hist.length) { hideFlow(); return; }
    closing = true;
    history.go(-hist.length);
  }
  addEventListener('popstate', () => {
    if (!flowOpen) return;
    if (closing) { closing = false; hideFlow(); return; }
    if (st.screen === 'done') {
      const rest = hist.length - 1;
      if (rest > 0) { hist = [hist[0]]; closing = true; history.go(-rest); } else hideFlow();
      return;
    }
    if (hist.length > 1) { hist.pop(); render(hist[hist.length - 1], 'back'); } else hideFlow();
  });
  $('#flowBack').addEventListener('click', () => {
    if (st.screen === 'done') { closeFlow(); return; }
    history.back();
  });
  $('#flowClose').addEventListener('click', closeFlow);
  nextBtn.addEventListener('click', next);

  body.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.classList.contains('listen')) return;
    const act = b.dataset.act;
    if (b.dataset.edit) { editing = true; forward(b.dataset.edit); return; }
    if (act === 'otherDist') { closeFlow(); setTimeout(() => { $('#mapSection').scrollIntoView({ block: 'start' }); clearMap(); }, 60); return; }
    if (act === 'bm' || act === 'bp') {
      st.bigha = Math.round(Math.min(200, Math.max(0.5, st.bigha + (act === 'bp' ? 0.5 : -0.5))) * 2) / 2;
      delete st.voiced.bigha;
      $('#bighaOut', body).innerHTML = num(st.bigha) + ' ' + t('bigha') + '<small>' + t('kathaNote') + '</small>';
      $('.stepper', body).classList.remove('voiced');
      saveDraft();
      return;
    }
    if (act === 'resend') { resendCount++; toast(t('resent')); resendTimer(); return; }
    if (act === 'card') { shareCard(); return; }
    if (act === 'farmteam') { toast(t('farmTeamSoon'), 4500); return; }
    if (act === 'another') { const keep = st.code; st = blank(); st.code = keep; store.del('krl-draft'); closeFlow(); setTimeout(() => { clearMap(); $('#mapSection').scrollIntoView({ block: 'start' }); }, 60); return; }
    if (act === 'home') { closeFlow(); return; }
    if (b.dataset.k) choose(b.dataset.k, b.dataset.v);
  });
  function resendTimer() {
    clearInterval(otpTimer);
    let left = 30;
    const box = $('#resendBox', body);
    const tick = () => {
      if (left > 0) { box.textContent = t('otpWait', { n: num(left) }); left--; return; }
      clearInterval(otpTimer);
      box.innerHTML = '<button type="button" class="linkbtn" data-act="resend">' + (resendCount ? t('callCode') : t('resend')) + '</button>';
    };
    tick();
    otpTimer = setInterval(tick, 1000);
  }

  function choose(k, v, fromVoice) {
    if (k === 'water' || k === 'crops') {
      const arr = st[k];
      const i = arr.indexOf(v);
      if (fromVoice) { if (i < 0) arr.push(v); } else if (i > -1) arr.splice(i, 1); else arr.push(v);
    } else if (k === 'team') {
      if (v === 'unsure') { st.unsure = true; st.team = null; } else { st.unsure = false; st.team = +v; }
      st.ac = null; st.teamNote = '';
    } else st[k] = v;
    if (fromVoice) st.voiced[k + ':' + v] = true; else delete st.voiced[k + ':' + v];
    saveDraft();
    const y = body.scrollTop;
    render(st.screen);
    body.classList.remove('enter');
    body.scrollTop = y;
    const again = $('[data-k="' + k + '"][data-v="' + v + '"]', body);
    if (again && !fromVoice) again.focus({ preventScroll: true });
  }

  /* Share card for WhatsApp Status / Instagram */
  function shareCard() {
    const tm = team(), first = (st.name || '').trim().split(/\s+/)[0] || '';
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 1080;
    const x = c.getContext('2d');
    const ink = inkOn(tm.color);
    const x0 = TEAMX[tm.id] || {};
    let art = null;
    const draw = () => {
      x.fillStyle = tm.color; x.fillRect(0, 0, 1080, 1080);
      x.fillStyle = 'rgba(255,255,255,.12)';
      x.beginPath(); x.arc(940, 140, 260, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(120, 980, 200, 0, Math.PI * 2); x.fill();
      x.fillStyle = ink; x.textAlign = 'center';
      x.font = '600 46px "Hind Siliguri", sans-serif';
      x.fillText(t('brand'), 540, 150);
      if (art) {
        x.fillStyle = '#ffffff';
        x.beginPath(); x.arc(540, 380, 175, 0, Math.PI * 2); x.fill();
        x.drawImage(art, 540 - 112, 380 - 140, 224, 280);
        x.fillStyle = ink;
      } else {
        x.lineWidth = 12; x.strokeStyle = ink;
        x.beginPath(); x.arc(540, 380, 130, 0, Math.PI * 2); x.stroke();
        x.font = '700 120px "Hind Siliguri", sans-serif';
        x.fillText(crest(tm), 540, 425);
      }
      x.font = '600 64px "Hind Siliguri", sans-serif';
      x.fillText(first + ' ' + t('cardJoined'), 540, 640);
      x.font = '700 92px "Hind Siliguri", sans-serif';
      x.fillText(tName(tm), 540, 770);
      x.font = '500 40px "Hind Siliguri", sans-serif';
      x.fillText(t('teamNo', { n: num(tm.id) }) + ' · ' + (lang === 'bn' ? 'পশ্চিমবঙ্গ' : 'West Bengal'), 540, 860);
      c.toBlob(blob => {
        if (!blob) return;
        const file = new File([blob], 'krl-team-' + tm.id + '.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], text: t('waText', { t: tName(tm), u: location.origin + location.pathname }) }).catch(() => {});
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = file.name;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        }
      }, 'image/png');
    };
    const go = () => { if (document.fonts && document.fonts.load) document.fonts.load('700 92px "Hind Siliguri"').then(draw, draw); else draw(); };
    if (!x0.img) { go(); return; }
    const im = new Image();
    im.onload = () => { art = im; go(); };
    im.onerror = go;
    im.src = 'assets/teams/' + x0.img + '.jpg';
  }

  /* ---------- voice guide (Sathi) ----------
     Browser speech recognition fills the visible form; it never submits.
     A full conversational guide (Gemini Live / Sarvam) can replace handleHeard later. */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let micDenied = false, rec = null, vctx = null, vfails = 0;
  const vSheet = $('#voiceSheet');
  function setVState(s) {
    $('#vsState').textContent = t({ listening: 'stListening', thinking: 'stThinking', speaking: 'stSpeaking', idle: 'stIdle' }[s]);
    vSheet.classList.toggle('listening', s === 'listening');
    $('#vsMic').classList.toggle('listening', s === 'listening');
  }
  function say(text, then) {
    $('#vsSay').textContent = text;
    setVState('speaking');
    return speak(text).then(() => { if (then) then(); else setVState('idle'); });
  }
  function markMicsOff(reason) {
    micDenied = true;
    $$('.mic').forEach(m => { m.classList.add('off'); m.setAttribute('aria-label', t('micOff', { r: reason })); });
  }
  function micClick(ctx) {
    if (!SR || micDenied) {
      toast(!SR ? t('vUnsupported') : t('vDenied'), 5000);
      if (ctx === 'map') openList();
      return;
    }
    openVoice(ctx);
  }
  function voicePrompt(ctx) {
    if (ctx === 'map') return t('vOpen');
    if (ctx === 'otp') return t('vOtp');
    if (ctx === 'review') return t('vReview');
    if (ctx === 'team' && team()) return t('yourTeam') + ': ' + tName(team()) + '। ' + t('vTeamGo');
    const v = V[ctx] ? V[ctx]() : null;
    return t('vAskQ', { q: v ? v.q : '' });
  }
  function openVoice(ctx) {
    if (!SR || micDenied) { micClick(ctx); return; }
    vctx = ctx; vfails = 0;
    $('#vsHeard').textContent = '';
    $('#vsOpts').innerHTML = '';
    openSheet(vSheet);
    const p = voicePrompt(ctx);
    if (ctx === 'otp' || ctx === 'review' || ctx === 'done' || ctx === 'team') { say(p); return; }
    say(p, listen);
  }
  function stopVoice() {
    if (rec) { try { rec.abort(); } catch (e) { /* ignore */ } rec = null; }
    if (TTS) speechSynthesis.cancel();
  }
  function listen() {
    if (vctx === 'otp' || vctx === 'review') { say(voicePrompt(vctx)); return; }
    stopVoice();
    if (navigator.onLine === false) { say(t('vNet')); return; }
    const r = new SR();
    rec = r;
    r.lang = lang === 'bn' ? 'bn-IN' : 'en-IN';
    r.interimResults = true;
    r.maxAlternatives = 3;
    r.continuous = false;
    let got = false, errored = false;
    r.onresult = e => {
      const res = e.results[e.results.length - 1];
      $('#vsHeard').textContent = '“' + res[0].transcript + '”';
      if (res.isFinal && !got) {
        got = true;
        setVState('thinking');
        const alts = Array.from(res).map(a => a.transcript);
        setTimeout(() => handleHeard(alts), 250);
      }
    };
    r.onerror = e => {
      errored = true;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { markMicsOff(t('vDenied')); say(t('vDenied')); return; }
      if (e.error === 'network') { say(t('vNet')); return; }
      if (e.error !== 'aborted') failed();
    };
    r.onend = () => { clearTimeout(guard); if (rec === r) rec = null; if (!got && !errored) failed(); };
    // Silence must never look like a crash (brief, section 7).
    const guard = setTimeout(() => { if (rec === r && !got) { errored = true; try { r.abort(); } catch (e) { /* ignore */ } failed(); } }, 12000);
    try { r.start(); setVState('listening'); } catch (e) { clearTimeout(guard); failed(); }
  }
  function failed() {
    vfails++;
    if (vfails >= 2) {
      say(t('vGiveUp'));
      if (vctx === 'map') $('#vsOpts').innerHTML = '<button type="button" class="btn ghost" data-vlist>' + t('fromList') + '</button>';
      return;
    }
    say(t('vNoHear'));
  }
  $('#vsMic').addEventListener('click', () => { $('#vsOpts').innerHTML = ''; $('#vsHeard').textContent = ''; listen(); });
  $('#vsOpts').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-vlist')) { stopVoice(); closeSheet(vSheet); openList(); return; }
    if (b.dataset.ac) { pickPlace({ type: 'ac', id: +b.dataset.ac }); return; }
    if (b.dataset.slug) pickPlace({ type: 'dist', id: b.dataset.slug });
  });
  $('#micHero').addEventListener('click', () => { mapTouched(); micClick('map'); });
  $('#dockMic').addEventListener('click', () => micClick('map'));
  $('#flowMic').addEventListener('click', () => micClick(st.screen));

  /* Place finding: a local stand-in for find_constituency(place). */
  const norm = s => toAscii(String(s || '').normalize('NFC').toLowerCase())
    .replace(/\((sc|st)\)/g, '').replace(/[ণ]/g, 'ন').replace(/[শষ]/g, 'স').replace(/ী/g, 'ি').replace(/ূ/g, 'ু').replace(/[ঁ]/g, '')
    .replace(/[।,.?!'"“”‘’-]/g, ' ').replace(/\s+/g, ' ').trim();
  const ALIAS = {
    'north-24-parganas': ['উত্তর চব্বিশ পরগনা', 'north twenty four parganas'],
    'south-24-parganas': ['দক্ষিণ চব্বিশ পরগনা', 'south twenty four parganas'],
    'purba-bardhaman': ['বর্ধমান', 'burdwan', 'bardhaman'],
    'paschim-medinipur': ['মেদিনীপুর', 'midnapore'],
    'purba-medinipur': ['মেদিনীপুর', 'midnapore', 'তমলুক', 'tamluk'],
    kolkata: ['calcutta', 'কলিকাতা'],
    'cooch-behar': ['কুচবিহার', 'coochbehar'],
    malda: ['মালদহ', 'maldah'],
    'uttar-dinajpur': ['দিনাজপুর', 'dinajpur'],
    'dakshin-dinajpur': ['দিনাজপুর', 'dinajpur']
  };
  let PLACES = null;
  function places() {
    if (PLACES) return PLACES;
    PLACES = [];
    D.districts.forEach(d => [d.bn, d.en].concat(ALIAS[d.slug] || []).forEach(n => PLACES.push({ type: 'dist', id: d.slug, n: norm(n) })));
    Object.keys(D.acs).forEach(k => { const a = D.acs[k]; [a[0], a[1]].forEach(n => PLACES.push({ type: 'ac', id: +k, n: norm(n) })); });
    return PLACES;
  }
  function findPlace(texts, onlyAcs) {
    const score = {};
    texts.forEach(tx => {
      const h = ' ' + norm(tx) + ' ';
      places().forEach(p => {
        if (p.n.length < 3) return;
        if (onlyAcs && (p.type !== 'ac' || onlyAcs.indexOf(p.id) < 0)) return;
        if (h.indexOf(p.n) > -1) {
          const key = p.type + ':' + p.id;
          score[key] = Math.max(score[key] || 0, p.n.length + (p.type === 'ac' ? 2 : 0));
        }
      });
    });
    let hits = Object.keys(score).sort((a, b) => score[b] - score[a]).map(k => { const i = k.indexOf(':'); return { type: k.slice(0, i), id: k.slice(0, i) === 'ac' ? +k.slice(i + 1) : k.slice(i + 1) }; });
    // A constituency inside a matched district wins over the district itself.
    const acHits = hits.filter(h => h.type === 'ac');
    if (acHits.length) hits = hits.filter(h => h.type === 'ac' || !acHits.some(a => D.acs[a.id][2] === DI[h.id].acgroup));
    return hits.slice(0, 3);
  }
  const distOfAc = n => D.districts.find(d => d.acgroup === D.acs[n][2]);
  function placeLabel(h) {
    if (h.type === 'ac') { const d = distOfAc(h.id); return acLabel(h.id) + ' · ' + dName(d); }
    return dName(DI[h.id]);
  }
  function pickPlace(h) {
    if (h.type === 'ac') {
      const d = distOfAc(h.id);
      if (st.dist !== d.slug) { st.dist = d.slug; st.ac = null; }
      st.voiced.ac = true;
      selectDistrict(d.slug, { ac: h.id });
      say(t('vFoundAc', { d: dName(d), a: lang === 'bn' ? D.acs[h.id][0] : D.acs[h.id][1], t: tName(T[D.acs[h.id][3]]) }), () => closeSheet(vSheet));
    } else {
      const d = DI[h.id];
      selectDistrict(d.slug);
      const msg = Array.isArray(d.team) ? t('vFoundSplit', { d: dName(d) }) : t('vFoundD', { d: dName(d), t: tName(T[d.team]) });
      say(msg, () => closeSheet(vSheet));
    }
  }

  const WORDS = { 'শূন্য': 0, 'জিরো': 0, 'এক': 1, 'দুই': 2, 'দু': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5, 'পাচ': 5, 'ছয়': 6, 'ছয়': 6, 'ছ': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'নয়': 9, 'zero': 0, 'oh': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'দশ': 10, 'ten': 10 };
  const digitsIn = s => toAscii(s).split(/[\s,.-]+/).map(w => /^\d+$/.test(w) ? w : (w in WORDS && WORDS[w] < 10 ? String(WORDS[w]) : '')).join('');
  function bighaFrom(s) {
    const x = toAscii(s.normalize('NFC'));
    let v = null;
    const m = x.match(/\d+(\.\d+)?/);
    if (/আড়াই|আড়াই|two and a half/.test(x)) v = 2.5;
    else if (/দেড়|দেড়|one and a half/.test(x)) v = 1.5;
    else if (/আধা|আধ |half/.test(x)) v = 0.5;
    else if (m) v = parseFloat(m[0]);
    else Object.keys(WORDS).some(w => { if (x.indexOf(w) > -1 && WORDS[w] > 0) { v = WORDS[w]; return true; } return false; });
    if (v != null && /সাড়ে|সাড়ে/.test(x)) v += 0.5;
    if (v != null && /কাঠা|katha/.test(x)) v = v / 20;
    return v;
  }
  const KEYS = {
    gender: { f: ['মহিলা', 'মেয়ে', 'মেয়ে', 'নারী', 'woman', 'female', 'lady'], m: ['পুরুষ', 'ছেলে', 'male', ' man'], o: ['অন্য', 'বলতে চাই না', 'other'] },
    tenure: { own: ['নিজের', 'নিজস্ব', 'own'], lease: ['লিজ', 'ভাগ', 'বর্গা', 'lease', 'rent', 'share'] },
    water: { pond: ['পুকুর', 'pond'], tube: ['টিউবওয়েল', 'টিউবয়েল', 'টিউবওয়েল', 'নলকূপ', 'কল', 'tube', 'well', 'pump'], canal: ['খাল', 'নদী', 'canal', 'river'], rain: ['বৃষ্টি', 'rain'] },
    crops: { rice: ['ধান', 'চাল', 'rice', 'paddy'], veg: ['সবজি', 'সব্জি', 'vegetable'], potato: ['আলু', 'potato'], jute: ['পাট', 'jute'], fruit: ['ফল', 'আম', 'কলা', 'fruit', 'mango', 'banana'], oil: ['সর্ষে', 'সরষে', 'ডাল', 'তিল', 'mustard', 'pulse', 'lentil'], fish: ['মাছ', 'fish'], animal: ['গরু', 'ছাগল', 'হাঁস', 'মুরগি', 'cow', 'goat', 'duck', 'chicken', 'poultry', 'cattle'] },
    interest: { create: ['নতুন', 'গড়ব', 'গড়ব', 'create', 'new', 'start'], join: ['কোড', 'join', 'code'], match: ['মিলিয়ে', 'মিলিয়ে', 'কাছাকাছি', 'match', 'nearby'], later: ['পরে', 'later'] }
  };
  function matchKeys(field, text) {
    const h = ' ' + text.normalize('NFC').toLowerCase() + ' ';
    const out = [];
    Object.keys(KEYS[field]).forEach(v => { if (KEYS[field][v].some(w => h.indexOf(w.normalize('NFC')) > -1)) out.push(v); });
    if (field === 'gender' && out.indexOf('f') > -1) return ['f'];
    return out;
  }
  const clean = s => s.replace(/^(আমার নাম|আমি|my name is|i am|i'm)\s*/i, '').replace(/\s*(বলছি|থেকে বলছি|থেকে|গ্রাম|village)\s*$/i, '').replace(/[।.!?]+$/, '').trim();

  function handleHeard(alts) {
    const text = alts[0] || '';
    if (vctx === 'map') {
      const hits = findPlace(alts);
      if (hits.length === 1) { pickPlace(hits[0]); return; }
      if (hits.length > 1) {
        $('#vsOpts').innerHTML = hits.map(h => '<button type="button" class="btn ghost" ' + (h.type === 'ac' ? 'data-ac="' + h.id + '"' : 'data-slug="' + h.id + '"') + '>' + esc(placeLabel(h)) + '</button>').join('');
        say(t('vPick'));
        return;
      }
      $('#vsOpts').innerHTML = '<button type="button" class="btn ghost" data-vlist>' + t('fromList') + '</button>';
      say(t('vNotFound'));
      return;
    }
    const id = vctx;
    let wrote = null;
    if (id === 'where') {
      const hit = findPlace(alts, acsFor())[0];
      if (hit) {
        st.ac = hit.id; st.voiced.ac = true; wrote = acLabel(hit.id);
        if (D.acs[hit.id][3] !== st.team) { st.teamNote = st.team || st.unsure ? t('teamSwitched', { t: tName(T[D.acs[hit.id][3]]) }) : ''; st.team = D.acs[hit.id][3]; }
      }
      else { st.village = clean(text); st.voiced.village = true; wrote = st.village; }
    } else if (id === 'name' || id === 'team' || id === 'split') {
      if (id === 'name') { st.name = clean(text); st.voiced.name = true; wrote = st.name; }
      else if (id === 'split') {
        const hit = findPlace(alts, acsFor())[0];
        if (hit) { st.unsure = false; st.team = D.acs[hit.id][3]; st.ac = hit.id; st.voiced.ac = true; wrote = tName(T[st.team]); }
      }
    } else if (id === 'about') {
      const g = matchKeys('gender', text)[0];
      const a = (toAscii(text).match(/\d{2,3}/) || [])[0];
      if (g) { st.gender = g; st.voiced['gender:' + g] = true; }
      if (a) { st.age = a; st.voiced.age = true; }
      if (g || a) wrote = [g ? t({ f: 'female', m: 'male', o: 'otherG' }[g]) : '', a ? num(a) : ''].filter(Boolean).join(', ');
    } else if (id === 'phone') {
      let d = digitsIn(text);
      if (d.length > 10) d = d.slice(-10);
      if (d.length >= 6) { st.phone = d; st.voiced.phone = true; wrote = num(d.split('').join('-')); }
    } else if (id === 'land') {
      const b = bighaFrom(text);
      const tn = matchKeys('tenure', text)[0];
      if (b) { st.bigha = Math.max(0.5, Math.round(b * 2) / 2); st.voiced.bigha = true; }
      if (tn) { st.tenure = tn; st.voiced['tenure:' + tn] = true; }
      if (b || tn) wrote = [b ? num(st.bigha) + ' ' + t('bigha') : '', tn ? t(tn) : ''].filter(Boolean).join(', ');
    } else if (id === 'water' || id === 'crops' || id === 'interest' || id === 'group') {
      const field = id === 'group' ? 'interest' : id;
      const vs = matchKeys(field, text);
      if (vs.length) {
        if (field === 'interest') { st.interest = vs[0]; st.voiced['interest:' + vs[0]] = true; }
        else vs.forEach(v => { if (st[field].indexOf(v) < 0) st[field].push(v); st.voiced[field + ':' + v] = true; });
        wrote = vs.map(v => t(field === 'interest' ? { create: 'gCreate', join: 'gJoin', match: 'gMatch', later: 'gLater' }[v] : v)).join(', ');
      }
    }
    if (!wrote) {
      if (vctx === 'about' || vctx === 'phone' || vctx === 'land') say(t('vNoNum'));
      else say(t('vNoMatch'));
      return;
    }
    saveDraft();
    render(st.screen);
    say(t('vWrote', { v: wrote }), () => setTimeout(() => closeSheet(vSheet), 600));
  }

  /* ---------- hero banners: resume a draft, Acharya invite, already enrolled ---------- */
  function refreshHeroBanners() {
    const draft = store.get('krl-draft');
    const done = store.get('krl-enrolled');
    const res = $('#resume');
    if (draft && draft.dist && draft.screen && draft.screen !== 'done' && draft.screen !== 'team' && draft.screen !== 'split') {
      res.innerHTML = '<span aria-hidden="true">💾</span><p>' + t('resumeText') + '</p><button type="button" class="btn small" id="resumeBtn">' + t('resumeBtn') + '</button>';
      res.hidden = false;
      $('#resumeBtn').addEventListener('click', () => {
        st = Object.assign(blank(), store.get('krl-draft') || {});
        if (REF) st.code = REF;
        st.voiced = st.voiced || {};
        // An unverified phone goes back through the OTP step.
        const to = ['land', 'water', 'crops', 'group', 'review'].indexOf(st.screen) > -1 ? 'otp' : st.screen;
        selectDistrict(st.dist);
        startFlow(to === 'otp' && !st.phone ? 'phone' : to);
      });
    } else if (done && T[done.team] && !REF) {
      res.innerHTML = '<span aria-hidden="true">✅</span><p>' + esc(t('enrolledBanner', { t: tName(T[done.team]) })) + '</p><a class="btn small" style="background:#1f8f4a" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(t('waText', { t: tName(T[done.team]), u: location.origin + location.pathname })) + '">' + t('inviteFriends') + '</a>';
      res.hidden = false;
    } else res.hidden = true;
    const inv = $('#invite');
    if (REF) { inv.textContent = '🤝 ' + t('invite', { c: REF }); inv.hidden = false; } else inv.hidden = true;
  }

  /* ---------- language switch ---------- */
  function applyLang() {
    root.lang = lang;
    $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    $$('[data-bn][data-en]').forEach(el => { el.textContent = el.dataset[lang]; });
    $$('[data-aria-bn]').forEach(el => el.setAttribute('aria-label', lang === 'bn' ? el.dataset.ariaBn : el.dataset.ariaEn));
    $$('[data-alt-bn]').forEach(el => el.setAttribute('alt', lang === 'bn' ? el.dataset.altBn : el.dataset.altEn));
    $$('[data-ph-bn]').forEach(el => el.setAttribute('placeholder', lang === 'bn' ? el.dataset.phBn : el.dataset.phEn));
    $$('[data-num]').forEach(el => { el.textContent = num(el.dataset.num); });
    $$('[data-count]').forEach(el => { if (el.dataset.done || !MOTION || !io) el.textContent = fmtCount(el, +el.dataset.count); });
    aClock();
    const lb = $('#langBtn');
    lb.textContent = lang === 'bn' ? 'English' : 'বাংলা';
    lb.setAttribute('aria-label', lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন');
    lb.setAttribute('lang', lang === 'bn' ? 'en' : 'bn');
    document.title = lang === 'bn' ? 'কৃষিরত্ন লিগ · বাংলা' : 'Krishi Ratna League · Bengal';
    $$('.mic').forEach(m => { if (!micDenied) m.setAttribute('aria-label', t('speak')); });
    $$('.x').forEach(x => x.setAttribute('aria-label', t('close')));
    $('.map-labels-toggle').setAttribute('aria-label', t('labels'));
    labMode = lang;
    mapLabels();
    buildTeams();
    buildFaq();
    refreshHeroBanners();
    if (!card.hidden) showCard();
    if (!teamSheet.hidden) renderTeamSheet();
    if (!$('#mapNudge').hidden && nudgeKind) showNudge(nudgeKind);
    if (!listSheet.hidden) renderList();
    if (flowOpen) render(st.screen);
  }
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'bn' ? 'en' : 'bn';
    store.set('krl-lang', lang);
    applyLang();
  });

  /* ---------- boot ---------- */
  $('#demoRibbon').hidden = !CFG.demo;
  if (!SR) $$('.mic').forEach(m => m.classList.add('off'));
  buildMap();
  applyLang();
  $$('.reveal').forEach(observe);
  $$('.chat, .farmteam').forEach(el => { if (io && MOTION) io.observe(el); else el.classList.add('in'); });
  $$('[data-count]').forEach(el => { if (MOTION && io) { el.textContent = fmtCount(el, 0); io.observe(el); } else countUp(el); });
  const intro = $('div.intro');
  if (intro) { if (!MOTION || root.classList.contains('intro-seen')) intro.remove(); else setTimeout(() => intro.remove(), 2400); }
  netState();
  onScroll();
  armNudges();
  if (st.dist && DI[st.dist] && !store.get('krl-enrolled')) { /* keep the map calm; the resume banner offers the way back */ }
  addEventListener('pagehide', saveDraft);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveDraft(); });
})();
