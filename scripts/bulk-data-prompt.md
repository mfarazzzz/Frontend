# Bulk Data Generation Prompt for Rampur News Microsite

Use this prompt with Claude, GPT-4, or Gemini to generate data in CSV format for bulk import.

---

## MASTER PROMPT (Copy-paste this to any AI)

---

### PROMPT START

You are a local directory data researcher for a Hindi news portal covering **Rampur, Bareilly, Moradabad, Rudrapur, and Haldwani** districts in Uttar Pradesh and Uttarakhand, India.

Generate data in **CSV format** (comma-separated, with headers). Use **real or realistic** names, addresses, and details. For Hindi fields, use Devanagari script. Each entry must be unique.

I need **5 separate CSV files** with the following categories and counts:

---

## FILE 1: institutions.csv (250+ entries)

**Target Distribution:**
- Colleges (Degree/PG): 40 entries (8 per district)
- Coaching Institutes: 50 entries (10 per district)  
- Schools (CBSE/ICSE/State Board): 50 entries (10 per district)
- Government Colleges/Institutes: 30 entries (6 per district)
- Polytechnics/ITI: 30 entries (6 per district)
- Private Universities/Deemed: 20 entries (4 per district)
- B.Ed/D.El.Ed Colleges: 15 entries (3 per district)
- Engineering Colleges: 15 entries (3 per district)

**CSV Headers:**
```
name,nameHindi,type,address,addressHindi,city,district,state,pincode,phone,email,website,establishedYear,affiliation,affiliationHindi,courses,fees,admissionProcess,admissionProcessHindi,examsAccepted,facilities,rating,description,descriptionHindi,isVerified,isFeatured
```

**Field Details:**
| Field | Values/Format |
|-------|---------------|
| name | English name of institution |
| nameHindi | Hindi name (Devanagari) |
| type | One of: `college`, `school`, `university`, `coaching`, `vocational`, `iti` |
| address | Full street address in English |
| addressHindi | Full address in Hindi |
| city | City name: Rampur / Bareilly / Moradabad / Rudrapur / Haldwani |
| district | District name: Rampur / Bareilly / Moradabad / Udham Singh Nagar / Nainital |
| state | Uttar Pradesh OR Uttarakhand |
| pincode | Valid 6-digit PIN code for that area |
| phone | 10-digit mobile or STD number (e.g., 0595-2XXXXXX or 98XXXXXXXX) |
| email | Realistic email (info@institutename.edu.in) |
| website | Realistic URL |
| establishedYear | Year between 1900-2023 |
| affiliation | CBSE / ICSE / UP Board / AKTU / MJP Rohilkhand University / Kumaun University / UTU / AICTE / UGC |
| affiliationHindi | Hindi version of affiliation |
| courses | Semicolon-separated list (e.g., B.Tech;MBA;BCA) |
| fees | Range like "₹15,000 - ₹50,000 per year" |
| admissionProcess | Brief English description |
| admissionProcessHindi | Brief Hindi description |
| examsAccepted | Semicolon-separated (JEE;CUET;UP State Entrance) |
| facilities | Semicolon-separated (Library;Computer Lab;Sports Ground;Hostel;WiFi;Cafeteria) |
| rating | 1.0 to 5.0 |
| description | 1-2 sentence English description |
| descriptionHindi | 1-2 sentence Hindi description |
| isVerified | true/false |
| isFeatured | true/false (only 10-15% should be true) |

**Districts & Cities to cover:**
- Rampur (UP) - PIN: 244901-244921
- Bareilly (UP) - PIN: 243001-243502
- Moradabad (UP) - PIN: 244001-244601
- Rudrapur, Udham Singh Nagar (Uttarakhand) - PIN: 263148-263153
- Haldwani, Nainital (Uttarakhand) - PIN: 263139-263152

---

## FILE 2: restaurants.csv (100+ entries)

**Target Distribution:**
- Restaurants: 30 entries (6 per district)
- Cafes: 15 entries (3 per district)
- Street Food stalls: 20 entries (4 per district)
- Sweet Shops (Mithai): 15 entries (3 per district)
- Dhabas: 10 entries (2 per district)
- Fine Dining: 10 entries (2 per district)

**CSV Headers:**
```
name,nameHindi,type,cuisine,address,addressHindi,city,district,phone,priceRange,rating,reviews,openingHours,specialties,specialtiesHindi,description,descriptionHindi,isVeg,hasDelivery,isFeatured,mapLink
```

**Field Details:**
| Field | Values/Format |
|-------|---------------|
| name | English name |
| nameHindi | Hindi name (Devanagari) |
| type | One of: `restaurant`, `cafe`, `street-food`, `sweet-shop`, `dhaba`, `fine-dining` |
| cuisine | Semicolon-separated (North Indian;Mughlai;Chinese;South Indian;Fast Food;Italian) |
| address | Street address English |
| addressHindi | Street address Hindi |
| city | Rampur / Bareilly / Moradabad / Rudrapur / Haldwani |
| district | Rampur / Bareilly / Moradabad / Udham Singh Nagar / Nainital |
| phone | 10-digit phone |
| priceRange | One of: `budget`, `moderate`, `premium`, `expensive`, `luxury` |
| rating | 2.5 to 5.0 |
| reviews | Number between 10-2000 |
| openingHours | e.g., "10:00 AM - 11:00 PM" |
| specialties | Semicolon-separated (Biryani;Kebabs;Butter Chicken;Chole Bhature) |
| specialtiesHindi | Hindi semicolon-separated |
| description | 1-2 sentence English |
| descriptionHindi | 1-2 sentence Hindi |
| isVeg | true/false |
| hasDelivery | true/false |
| isFeatured | true/false |
| mapLink | Google Maps link format (https://maps.google.com/?q=lat,lng) |

---

## FILE 3: shopping.csv (80+ entries)

**Target Distribution:**
- Malls: 10 entries (2 per district)
- Markets/Bazaars: 30 entries (6 per district)
- Shopping Complexes: 20 entries (4 per district)
- Plazas: 20 entries (4 per district)

**CSV Headers:**
```
name,nameHindi,type,address,addressHindi,city,district,phone,openingHours,storeCount,amenities,amenitiesHindi,parkingAvailable,description,descriptionHindi,isFeatured,mapLink
```

**Field Details:**
| Field | Values/Format |
|-------|---------------|
| name | English name |
| nameHindi | Hindi name (Devanagari) |
| type | One of: `mall`, `market`, `bazaar`, `complex`, `plaza` |
| address | Street address English |
| addressHindi | Street address Hindi |
| city | Rampur / Bareilly / Moradabad / Rudrapur / Haldwani |
| district | Rampur / Bareilly / Moradabad / Udham Singh Nagar / Nainital |
| phone | 10-digit phone (optional, use empty for bazaars) |
| openingHours | e.g., "10:00 AM - 9:00 PM" |
| storeCount | Number of shops (10-500) |
| amenities | Semicolon-separated (Parking;Food Court;ATM;Elevator;AC;Restrooms;WiFi) |
| amenitiesHindi | Hindi semicolon-separated |
| parkingAvailable | true/false |
| description | 1-2 sentence English |
| descriptionHindi | 1-2 sentence Hindi |
| isFeatured | true/false |
| mapLink | Google Maps URL |

---

## FILE 4: fashion-stores.csv (50+ entries)

**Target Distribution:**
- Clothing stores: 20 entries (4 per district)
- Jewelry shops: 10 entries (2 per district)
- Footwear stores: 10 entries (2 per district)
- Boutiques: 10 entries (2 per district)

**CSV Headers:**
```
name,nameHindi,type,category,address,addressHindi,city,district,phone,priceRange,rating,brands,specialties,specialtiesHindi,description,descriptionHindi,isFeatured
```

**Field Details:**
| Field | Values/Format |
|-------|---------------|
| name | English name |
| nameHindi | Hindi name (Devanagari) |
| type | One of: `clothing`, `jewelry`, `footwear`, `accessories`, `tailor`, `boutique` |
| category | One of: `men`, `women`, `kids`, `all` |
| address | Street address English |
| addressHindi | Street address Hindi |
| city | Rampur / Bareilly / Moradabad / Rudrapur / Haldwani |
| district | Rampur / Bareilly / Moradabad / Udham Singh Nagar / Nainital |
| phone | 10-digit phone |
| priceRange | One of: `budget`, `moderate`, `premium`, `expensive`, `luxury` |
| rating | 2.5 to 5.0 |
| brands | Semicolon-separated (Raymond;Peter England;Levi's;Allen Solly;local brands) |
| specialties | Semicolon-separated (Wedding Collection;Ethnic Wear;Western Wear) |
| specialtiesHindi | Hindi semicolon-separated |
| description | 1-2 sentence English |
| descriptionHindi | 1-2 sentence Hindi |
| isFeatured | true/false |

---

## FILE 5: famous-places.csv (50+ entries)

**Target Distribution:**
- Historical places: 15 entries (3 per district)
- Religious places: 15 entries (3 per district)
- Natural/Parks: 10 entries (2 per district)
- Landmarks: 10 entries (2 per district)

**CSV Headers:**
```
name,nameHindi,type,address,addressHindi,city,district,image,description,descriptionHindi,history,historyHindi,timings,entryFee,bestTimeToVisit,isFeatured,rating
```

**Field Details:**
| Field | Values/Format |
|-------|---------------|
| name | English name |
| nameHindi | Hindi name (Devanagari) |
| type | One of: `historical`, `religious`, `natural`, `recreational`, `educational`, `market`, `landmark`, `food-hub` |
| address | Street address English |
| addressHindi | Street address Hindi |
| city | Rampur / Bareilly / Moradabad / Rudrapur / Haldwani |
| district | Rampur / Bareilly / Moradabad / Udham Singh Nagar / Nainital |
| image | Leave empty (will add later) |
| description | 2-3 sentence English description |
| descriptionHindi | 2-3 sentence Hindi description |
| history | Brief English history (1-2 sentences) |
| historyHindi | Brief Hindi history |
| timings | e.g., "6:00 AM - 8:00 PM" or "Open 24 hours" |
| entryFee | e.g., "Free" or "₹20 per person" |
| bestTimeToVisit | e.g., "October to March" |
| isFeatured | true/false |
| rating | 3.0 to 5.0 |

---

## IMPORTANT RULES:

1. **Use REAL/REALISTIC data** - Use actual well-known institutions, restaurants, and places from these cities where possible. For lesser-known ones, create realistic names.
2. **PIN codes must be valid** for the respective areas.
3. **Hindi text** must be proper Devanagari script, not transliteration.
4. **No duplicate entries** - each entry must be unique.
5. **Distribute evenly** across all 5 districts.
6. **CSV formatting** - Use double quotes around fields containing commas or semicolons.
7. **Semicolons for lists** - Use semicolons (;) to separate multiple values within a field (courses, cuisine, facilities, etc.)
8. **Generate in batches** - If hitting token limits, generate one file at a time. Start with institutions.csv.

---

## SAMPLE OUTPUT (institutions.csv - first 3 rows):

```csv
name,nameHindi,type,address,addressHindi,city,district,state,pincode,phone,email,website,establishedYear,affiliation,affiliationHindi,courses,fees,admissionProcess,admissionProcessHindi,examsAccepted,facilities,rating,description,descriptionHindi,isVerified,isFeatured
"MJP Rohilkhand University","महात्मा ज्योतिबा फुले रुहेलखंड विश्वविद्यालय","university","Pilibhit Bypass Road","पीलीभीत बाईपास रोड","Bareilly","Bareilly","Uttar Pradesh","243006","0581-2527263","info@mjpru.ac.in","https://www.mjpru.ac.in",1975,"UGC","यूजीसी","B.A;B.Sc;B.Com;M.A;M.Sc;MBA;Ph.D","₹5,000 - ₹80,000 per year","Through entrance exam and merit","प्रवेश परीक्षा और मेरिट के माध्यम से","CUET;University Entrance","Library;Sports Ground;Hostel;Computer Lab;WiFi;Auditorium",4.2,"One of the oldest universities in UP, offering diverse courses across arts, science and professional streams.","उत्तर प्रदेश के सबसे पुराने विश्वविद्यालयों में से एक, कला, विज्ञान और व्यावसायिक धाराओं में विविध पाठ्यक्रम प्रदान करता है।",true,true
"Rampur Engineering College","रामपुर इंजीनियरिंग कॉलेज","college","Civil Lines, Rampur","सिविल लाइंस, रामपुर","Rampur","Rampur","Uttar Pradesh","244901","9412XXXXXX","info@rampurengg.ac.in","https://www.rampurengg.ac.in",2005,"AKTU","एकेटीयू","B.Tech;M.Tech;BCA;MCA","₹40,000 - ₹75,000 per year","Through UPSEE/JEE Main counseling","यूपीएसईई/जेईई मेन काउंसलिंग के माध्यम से","JEE Main;UPSEE","Library;Computer Lab;Workshop;Hostel;Canteen;Sports",3.8,"A reputed engineering college in Rampur offering technical courses affiliated to AKTU.","रामपुर का एक प्रतिष्ठित इंजीनियरिंग कॉलेज जो एकेटीयू से संबद्ध तकनीकी पाठ्यक्रम प्रदान करता है।",true,false
"Aakash Institute Moradabad","आकाश इंस्टीट्यूट मुरादाबाद","coaching","Near Gandhi Park, Civil Lines","गांधी पार्क के पास, सिविल लाइंस","Moradabad","Moradabad","Uttar Pradesh","244001","9876XXXXXX","moradabad@aakash.ac.in","https://www.aakash.ac.in",2010,"AICTE","एआईसीटीई","NEET Prep;JEE Prep;Foundation","₹80,000 - ₹1,50,000 per year","Direct admission with registration","पंजीकरण के साथ सीधा प्रवेश","NEET;JEE","AC Classrooms;Library;Online Tests;Doubt Sessions;Study Material",4.0,"Leading coaching institute for medical and engineering entrance exam preparation.","मेडिकल और इंजीनियरिंग प्रवेश परीक्षा की तैयारी के लिए अग्रणी कोचिंग संस्थान।",true,true
```

---

### PROMPT END

---

## HOW TO USE THIS DATA

Once you get the CSV files back from the AI:

### Option A: Use the Automated Seed Script (Recommended)
A ready-to-run seed script has been created at `rampurnews-cms/scripts/seed-directory-data.ts`.

1. **Add your AI-generated data** to the files in `scripts/data/`:
   - `institutions.ts` — already has 250 entries (real + generated)
   - `restaurants.ts` — 100+ entries
   - `shopping.ts` — 80+ entries
   - `fashion.ts` — 50+ entries
   - `places.ts` — 50+ entries

2. **Run the seeder**:
   ```bash
   cd rampurnews-cms
   npx tsx scripts/seed-directory-data.ts
   ```

3. **Data flows automatically**:
   - Supabase `cms_microsite_items` table ← seeded
   - CMS Admin at `/admin/content/microsite-items` ← editable
   - Frontend pages ← visible immediately via REST provider

### Option B: CSV Bulk Import via CMS Admin
1. Go to Content Manager → Select content type
2. Click "Bulk Import/Export" button
3. Upload CSV → Preview → Confirm

### Option C: Direct API
POST to `https://cms.rampurnews.com/api/cms/microsite-items`

---

## TIPS FOR BETTER RESULTS

- **Ask for one file at a time** if the AI hits output limits. Start with institutions (largest set).
- **Split by district** - Ask "Generate 50 institutions for Rampur district only" if needed.
- **Verify key data** - Cross-check well-known institutions (MJP Rohilkhand, IIM Kashipur, etc.) have correct details.
- **Add images later** - Leave image fields empty during bulk import, add them manually or via a separate script.
- **Use Google Maps** - For mapLink fields, you can batch-generate these after getting addresses.

---

## QUICK SINGLE-CATEGORY PROMPTS

### For Institutions Only (if you want to focus on education):
```
Generate 250 educational institutions in CSV format for Rampur, Bareilly, Moradabad, Rudrapur, and Haldwani districts. Include colleges, coaching centers, schools, government institutes, polytechnics, ITIs, private universities, and engineering colleges. Use the following CSV headers: [paste headers from FILE 1 above]. Distribute 50 entries per district. Use real Hindi names in Devanagari. Include realistic addresses, phone numbers, and PIN codes.
```

### For Restaurants Only:
```
Generate 100 restaurants, cafes, sweet shops, dhabas, and street food stalls in CSV format for Rampur, Bareilly, Moradabad, Rudrapur, and Haldwani. Use the following CSV headers: [paste headers from FILE 2 above]. Include local cuisine specialties, realistic Hindi names, and proper addresses. 20 entries per district.
```

### For Shopping Only:
```
Generate 80 shopping locations (malls, markets, bazaars, complexes) in CSV format for Rampur, Bareilly, Moradabad, Rudrapur, and Haldwani. Use the following CSV headers: [paste headers from FILE 3 above]. Include famous local markets like Sadar Bazaar, Nai Sarak etc. 16 entries per district.
```
