// CMS-ready mock data structure (WordPress REST API compatible)
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  image: string;
  category: string;
  categoryHindi: string;
  author: string;
  publishedDate: string;
  readTime?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  views?: number;
}

// Generate placeholder image URL
const getPlaceholderImage = (seed: number, width = 640, height = 360): string => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

// Mock news data organized by category
export const mockNewsData: Record<string, NewsArticle[]> = {
  rampur: [
    {
      id: "r1",
      title: "रामपुर में नई सड़क परियोजना का उद्घाटन, यातायात में होगा सुधार",
      slug: "rampur-new-road-project",
      excerpt: "जिला प्रशासन ने शहर के मुख्य मार्ग पर नई सड़क परियोजना का शुभारंभ किया। इससे लाखों लोगों को राहत मिलेगी।",
      image: getPlaceholderImage(101),
      category: "rampur",
      categoryHindi: "रामपुर",
      author: "राकेश शर्मा",
      publishedDate: "2026-01-03T10:30:00Z",
      readTime: "3 मिनट",
      isFeatured: true,
    },
    {
      id: "r2",
      title: "रामपुर के किसानों को मिलेगी नई सिंचाई योजना का लाभ",
      slug: "rampur-farmers-irrigation",
      excerpt: "राज्य सरकार ने रामपुर जिले के किसानों के लिए विशेष सिंचाई योजना की घोषणा की है।",
      image: getPlaceholderImage(102),
      category: "rampur",
      categoryHindi: "रामपुर",
      author: "प्रीति वर्मा",
      publishedDate: "2026-01-03T09:15:00Z",
      readTime: "4 मिनट",
    },
    {
      id: "r3",
      title: "रामपुर नगर निगम ने शुरू की स्वच्छता अभियान",
      slug: "rampur-cleanliness-drive",
      excerpt: "नगर निगम ने पूरे शहर में विशेष स्वच्छता अभियान की शुरुआत की है।",
      image: getPlaceholderImage(103),
      category: "rampur",
      categoryHindi: "रामपुर",
      author: "अमित कुमार",
      publishedDate: "2026-01-02T18:45:00Z",
      readTime: "2 मिनट",
    },
  ],
  up: [
    {
      id: "up1",
      title: "उत्तर प्रदेश सरकार ने नई शिक्षा नीति को दी मंजूरी",
      slug: "up-new-education-policy",
      excerpt: "मुख्यमंत्री ने राज्य की नई शिक्षा नीति को मंजूरी दी, जिससे लाखों छात्रों को फायदा होगा।",
      image: getPlaceholderImage(201),
      category: "up",
      categoryHindi: "उत्तर प्रदेश",
      author: "सुनीता यादव",
      publishedDate: "2026-01-03T11:00:00Z",
      readTime: "5 मिनट",
      isFeatured: true,
    },
    {
      id: "up2",
      title: "लखनऊ मेट्रो का नया रूट जल्द होगा शुरू",
      slug: "lucknow-metro-new-route",
      excerpt: "लखनऊ मेट्रो की नई लाइन अगले महीने से यात्रियों के लिए खुल जाएगी।",
      image: getPlaceholderImage(202),
      category: "up",
      categoryHindi: "उत्तर प्रदेश",
      author: "विकास सिंह",
      publishedDate: "2026-01-03T08:30:00Z",
      readTime: "3 मिनट",
    },
    {
      id: "up3",
      title: "प्रयागराज में महाकुंभ की तैयारियां जोरों पर",
      slug: "prayagraj-mahakumbh-preparations",
      excerpt: "महाकुंभ मेले के लिए प्रयागराज में बड़े पैमाने पर तैयारियां चल रही हैं।",
      image: getPlaceholderImage(203),
      category: "up",
      categoryHindi: "उत्तर प्रदेश",
      author: "रवि प्रताप",
      publishedDate: "2026-01-02T15:20:00Z",
      readTime: "4 मिनट",
    },
  ],
  national: [
    {
      id: "n1",
      title: "संसद में पारित हुआ नया श्रम कानून, करोड़ों मजदूरों को मिलेगा लाभ",
      slug: "parliament-new-labor-law",
      excerpt: "केंद्र सरकार ने नए श्रम कानून को संसद में पारित कराया, जिससे करोड़ों श्रमिकों को फायदा होगा।",
      image: getPlaceholderImage(301),
      category: "national",
      categoryHindi: "देश",
      author: "अनुराग त्रिपाठी",
      publishedDate: "2026-01-03T12:00:00Z",
      readTime: "6 मिनट",
      isFeatured: true,
      isBreaking: true,
    },
    {
      id: "n2",
      title: "भारत और अमेरिका के बीच नई व्यापार संधि पर हस्ताक्षर",
      slug: "india-us-trade-agreement",
      excerpt: "दोनों देशों ने द्विपक्षीय व्यापार को बढ़ावा देने के लिए नई संधि पर हस्ताक्षर किए।",
      image: getPlaceholderImage(302),
      category: "national",
      categoryHindi: "देश",
      author: "नेहा गुप्ता",
      publishedDate: "2026-01-03T10:45:00Z",
      readTime: "5 मिनट",
    },
    {
      id: "n3",
      title: "देश में बढ़ रहा है डिजिटल भुगतान का चलन",
      slug: "digital-payment-growth-india",
      excerpt: "UPI और डिजिटल भुगतान के जरिए देश में लेन-देन का नया रिकॉर्ड बना।",
      image: getPlaceholderImage(303),
      category: "national",
      categoryHindi: "देश",
      author: "कृष्णा मूर्ति",
      publishedDate: "2026-01-02T20:30:00Z",
      readTime: "4 मिनट",
    },
  ],
  politics: [
    {
      id: "p1",
      title: "विधानसभा चुनाव से पहले गठबंधन की चर्चा तेज",
      slug: "assembly-election-alliance-talks",
      excerpt: "आगामी विधानसभा चुनावों के मद्देनजर विभिन्न दलों में गठबंधन की बातचीत शुरू हो गई है।",
      image: getPlaceholderImage(401),
      category: "politics",
      categoryHindi: "राजनीति",
      author: "मनोज पांडेय",
      publishedDate: "2026-01-03T13:00:00Z",
      readTime: "5 मिनट",
      isFeatured: true,
    },
    {
      id: "p2",
      title: "केंद्रीय मंत्री ने किया जनता से संवाद",
      slug: "central-minister-public-interaction",
      excerpt: "केंद्रीय मंत्री ने जनता की समस्याओं को सुना और समाधान का आश्वासन दिया।",
      image: getPlaceholderImage(402),
      category: "politics",
      categoryHindi: "राजनीति",
      author: "सीमा राजपूत",
      publishedDate: "2026-01-03T09:00:00Z",
      readTime: "3 मिनट",
    },
    {
      id: "p3",
      title: "विपक्ष ने उठाए सरकार की नीतियों पर सवाल",
      slug: "opposition-questions-government-policies",
      excerpt: "विपक्षी दलों ने सरकार की आर्थिक नीतियों पर कड़े सवाल उठाए।",
      image: getPlaceholderImage(403),
      category: "politics",
      categoryHindi: "राजनीति",
      author: "राजेश मिश्रा",
      publishedDate: "2026-01-02T16:15:00Z",
      readTime: "4 मिनट",
    },
  ],
  crime: [
    {
      id: "c1",
      title: "पुलिस ने किया लुटेरों के गिरोह का पर्दाफाश",
      slug: "police-busts-robbery-gang",
      excerpt: "रामपुर पुलिस ने अंतरजिला लुटेरों के गिरोह को गिरफ्तार किया, लाखों का माल बरामद।",
      image: getPlaceholderImage(501),
      category: "crime",
      categoryHindi: "अपराध",
      author: "विनोद कुमार",
      publishedDate: "2026-01-03T14:00:00Z",
      readTime: "4 मिनट",
      isFeatured: true,
    },
    {
      id: "c2",
      title: "साइबर ठगी के आरोपी को किया गिरफ्तार",
      slug: "cyber-fraud-accused-arrested",
      excerpt: "पुलिस ने ऑनलाइन ठगी करने वाले आरोपी को पकड़ा, कई लोगों से ठगे थे लाखों रुपये।",
      image: getPlaceholderImage(502),
      category: "crime",
      categoryHindi: "अपराध",
      author: "अजय राठौर",
      publishedDate: "2026-01-03T11:30:00Z",
      readTime: "3 मिनट",
    },
    {
      id: "c3",
      title: "नशीले पदार्थों की तस्करी में तीन गिरफ्तार",
      slug: "drug-trafficking-three-arrested",
      excerpt: "पुलिस ने नशीले पदार्थों की तस्करी के आरोप में तीन लोगों को गिरफ्तार किया।",
      image: getPlaceholderImage(503),
      category: "crime",
      categoryHindi: "अपराध",
      author: "संदीप सिंह",
      publishedDate: "2026-01-02T19:45:00Z",
      readTime: "3 मिनट",
    },
  ],
  "education-jobs": [
    {
      id: "ej1",
      title: "UPSC की प्रारंभिक परीक्षा के नतीजे घोषित",
      slug: "upsc-prelims-results-announced",
      excerpt: "संघ लोक सेवा आयोग ने सिविल सेवा प्रारंभिक परीक्षा के परिणाम जारी किए।",
      image: getPlaceholderImage(601),
      category: "education-jobs",
      categoryHindi: "शिक्षा और नौकरियां",
      author: "प्रभात शुक्ला",
      publishedDate: "2026-01-03T15:00:00Z",
      readTime: "4 मिनट",
      isFeatured: true,
    },
    {
      id: "ej2",
      title: "उत्तर प्रदेश में निकली 10,000 शिक्षक भर्ती",
      slug: "up-teacher-recruitment-10000",
      excerpt: "राज्य सरकार ने प्राथमिक विद्यालयों के लिए शिक्षकों की बड़ी भर्ती की घोषणा की।",
      image: getPlaceholderImage(602),
      category: "education-jobs",
      categoryHindi: "शिक्षा और नौकरियां",
      author: "मीना कुमारी",
      publishedDate: "2026-01-03T12:30:00Z",
      readTime: "5 मिनट",
    },
    {
      id: "ej3",
      title: "नई शिक्षा नीति के तहत स्कूलों में होंगे बड़े बदलाव",
      slug: "new-education-policy-school-changes",
      excerpt: "केंद्र सरकार ने नई शिक्षा नीति के तहत स्कूली पाठ्यक्रम में बदलाव की घोषणा की।",
      image: getPlaceholderImage(603),
      category: "education-jobs",
      categoryHindi: "शिक्षा और नौकरियां",
      author: "अनिता सक्सेना",
      publishedDate: "2026-01-02T14:00:00Z",
      readTime: "6 मिनट",
    },
  ],
  business: [
    {
      id: "b1",
      title: "शेयर बाजार में तेजी, सेंसेक्स ने छुआ नया उच्चतम स्तर",
      slug: "stock-market-rally-sensex-high",
      excerpt: "भारतीय शेयर बाजार में जबरदस्त तेजी, सेंसेक्स ने बनाया नया रिकॉर्ड।",
      image: getPlaceholderImage(701),
      category: "business",
      categoryHindi: "व्यापार",
      author: "धीरज बंसल",
      publishedDate: "2026-01-03T16:00:00Z",
      readTime: "4 मिनट",
      isFeatured: true,
    },
    {
      id: "b2",
      title: "पेट्रोल-डीजल के दामों में राहत की उम्मीद",
      slug: "petrol-diesel-price-relief",
      excerpt: "अंतरराष्ट्रीय बाजार में कच्चे तेल की कीमतों में गिरावट से राहत की उम्मीद।",
      image: getPlaceholderImage(702),
      category: "business",
      categoryHindi: "व्यापार",
      author: "कविता अग्रवाल",
      publishedDate: "2026-01-03T10:00:00Z",
      readTime: "3 मिनट",
    },
    {
      id: "b3",
      title: "स्टार्टअप इंडिया: नई कंपनियों को मिलेगा विशेष प्रोत्साहन",
      slug: "startup-india-special-incentives",
      excerpt: "सरकार ने नई स्टार्टअप कंपनियों के लिए विशेष प्रोत्साहन पैकेज की घोषणा की।",
      image: getPlaceholderImage(703),
      category: "business",
      categoryHindi: "व्यापार",
      author: "रोहित शर्मा",
      publishedDate: "2026-01-02T17:30:00Z",
      readTime: "5 मिनट",
    },
  ],
  entertainment: [
    {
      id: "e1",
      title: "शाहरुख खान की नई फिल्म का ट्रेलर हुआ रिलीज",
      slug: "shahrukh-khan-new-movie-trailer",
      excerpt: "बॉलीवुड के किंग खान की आगामी फिल्म का ट्रेलर ने तोड़े सारे रिकॉर्ड।",
      image: getPlaceholderImage(801),
      category: "entertainment",
      categoryHindi: "मनोरंजन",
      author: "पूजा सिन्हा",
      publishedDate: "2026-01-03T17:00:00Z",
      readTime: "3 मिनट",
      isFeatured: true,
    },
    {
      id: "e2",
      title: "बिग बॉस में नया ट्विस्ट, दर्शक हुए हैरान",
      slug: "bigg-boss-new-twist",
      excerpt: "रियलिटी शो बिग बॉस में नए मोड़ ने दर्शकों को चौंका दिया।",
      image: getPlaceholderImage(802),
      category: "entertainment",
      categoryHindi: "मनोरंजन",
      author: "अर्चना त्यागी",
      publishedDate: "2026-01-03T14:30:00Z",
      readTime: "2 मिनट",
    },
    {
      id: "e3",
      title: "नई वेब सीरीज ने OTT पर मचाई धूम",
      slug: "new-web-series-ott-hit",
      excerpt: "नई हिंदी वेब सीरीज ने रिलीज के पहले हफ्ते में ही व्यूअरशिप के रिकॉर्ड तोड़े।",
      image: getPlaceholderImage(803),
      category: "entertainment",
      categoryHindi: "मनोरंजन",
      author: "निखिल जैन",
      publishedDate: "2026-01-02T21:00:00Z",
      readTime: "4 मिनट",
    },
  ],
  sports: [
    {
      id: "s1",
      title: "भारत ने जीता टेस्ट सीरीज, ऑस्ट्रेलिया को हराया",
      slug: "india-wins-test-series-australia",
      excerpt: "टीम इंडिया ने शानदार प्रदर्शन करते हुए ऑस्ट्रेलिया को उन्हीं की धरती पर हराया।",
      image: getPlaceholderImage(901),
      category: "sports",
      categoryHindi: "खेल",
      author: "अभिषेक राय",
      publishedDate: "2026-01-03T18:00:00Z",
      readTime: "5 मिनट",
      isFeatured: true,
      isBreaking: true,
    },
    {
      id: "s2",
      title: "IPL की नई टीम के लिए मेगा ऑक्शन की तैयारी",
      slug: "ipl-new-team-mega-auction",
      excerpt: "आईपीएल में नई फ्रेंचाइजी के शामिल होने से मेगा ऑक्शन की तैयारियां शुरू।",
      image: getPlaceholderImage(902),
      category: "sports",
      categoryHindi: "खेल",
      author: "करण वर्मा",
      publishedDate: "2026-01-03T13:45:00Z",
      readTime: "4 मिनट",
    },
    {
      id: "s3",
      title: "ओलंपिक की तैयारी में जुटे भारतीय खिलाड़ी",
      slug: "indian-athletes-olympic-preparation",
      excerpt: "2028 ओलंपिक के लिए भारतीय खिलाड़ियों की तैयारियां जोरों पर हैं।",
      image: getPlaceholderImage(903),
      category: "sports",
      categoryHindi: "खेल",
      author: "गीता फोगाट",
      publishedDate: "2026-01-02T12:00:00Z",
      readTime: "6 मिनट",
    },
  ],
  health: [
    {
      id: "h1",
      title: "सर्दियों में बढ़ रहे हैं वायरल संक्रमण के मामले",
      slug: "winter-viral-infection-cases",
      excerpt: "स्वास्थ्य विभाग ने सर्दियों में बढ़ते वायरल संक्रमण से बचाव की सलाह दी।",
      image: getPlaceholderImage(1001),
      category: "health",
      categoryHindi: "स्वास्थ्य",
      author: "डॉ. रजत खन्ना",
      publishedDate: "2026-01-03T09:30:00Z",
      readTime: "5 मिनट",
      isFeatured: true,
    },
    {
      id: "h2",
      title: "नई स्वास्थ्य बीमा योजना से मिलेगा गरीबों को लाभ",
      slug: "new-health-insurance-scheme-poor",
      excerpt: "सरकार की नई स्वास्थ्य बीमा योजना से करोड़ों गरीब परिवारों को मिलेगा फायदा।",
      image: getPlaceholderImage(1002),
      category: "health",
      categoryHindi: "स्वास्थ्य",
      author: "डॉ. सुमन अरोड़ा",
      publishedDate: "2026-01-03T07:00:00Z",
      readTime: "4 मिनट",
    },
    {
      id: "h3",
      title: "फिटनेस टिप्स: घर पर रहकर कैसे रहें स्वस्थ",
      slug: "fitness-tips-stay-healthy-home",
      excerpt: "व्यस्त जीवनशैली में घर पर रहकर स्वस्थ रहने के आसान उपाय।",
      image: getPlaceholderImage(1003),
      category: "health",
      categoryHindi: "स्वास्थ्य",
      author: "आयुष जोशी",
      publishedDate: "2026-01-02T10:30:00Z",
      readTime: "3 मिनट",
    },
  ],
  "religion-culture": [
    {
      id: "rc1",
      title: "मकर संक्रांति पर पूरे देश में उत्सव का माहौल",
      slug: "makar-sankranti-celebration",
      excerpt: "मकर संक्रांति के अवसर पर देशभर में पतंगबाजी और पूजा-अर्चना का उत्साह।",
      image: getPlaceholderImage(1101),
      category: "religion-culture",
      categoryHindi: "धर्म और संस्कृति",
      author: "पंडित राजेश शास्त्री",
      publishedDate: "2026-01-03T06:00:00Z",
      readTime: "4 मिनट",
      isFeatured: true,
    },
    {
      id: "rc2",
      title: "अयोध्या में राम मंदिर में भक्तों की भारी भीड़",
      slug: "ayodhya-ram-temple-devotees-crowd",
      excerpt: "नए साल की शुरुआत में अयोध्या राम मंदिर में श्रद्धालुओं की भारी भीड़ उमड़ी।",
      image: getPlaceholderImage(1102),
      category: "religion-culture",
      categoryHindi: "धर्म और संस्कृति",
      author: "स्वामी विवेकानंद दास",
      publishedDate: "2026-01-02T08:00:00Z",
      readTime: "3 मिनट",
    },
    {
      id: "rc3",
      title: "लोक नृत्य और संगीत से सजी सांस्कृतिक संध्या",
      slug: "folk-dance-music-cultural-evening",
      excerpt: "रामपुर में आयोजित सांस्कृतिक कार्यक्रम में लोक कलाकारों ने बांधा समां।",
      image: getPlaceholderImage(1103),
      category: "religion-culture",
      categoryHindi: "धर्म और संस्कृति",
      author: "गीता देवी",
      publishedDate: "2026-01-01T19:00:00Z",
      readTime: "4 मिनट",
    },
  ],
  "food-lifestyle": [
    {
      id: "fl1",
      title: "सर्दियों के मौसम में ये फल जरूर खाएं",
      slug: "winter-fruits-must-eat",
      excerpt: "सर्दियों में स्वास्थ्य के लिए लाभकारी फलों की सूची और उनके फायदे।",
      image: getPlaceholderImage(1201),
      category: "food-lifestyle",
      categoryHindi: "खान-पान और लाइफस्टाइल",
      author: "शेफ विकास खन्ना",
      publishedDate: "2026-01-03T08:00:00Z",
      readTime: "4 मिनट",
      isFeatured: true,
    },
    {
      id: "fl2",
      title: "घर पर बनाएं स्वादिष्ट गाजर का हलवा",
      slug: "homemade-gajar-halwa-recipe",
      excerpt: "पारंपरिक तरीके से घर पर गाजर का हलवा बनाने की आसान विधि।",
      image: getPlaceholderImage(1202),
      category: "food-lifestyle",
      categoryHindi: "खान-पान और लाइफस्टाइल",
      author: "तरला दलाल",
      publishedDate: "2026-01-02T11:00:00Z",
      readTime: "5 मिनट",
    },
    {
      id: "fl3",
      title: "नए साल में अपनाएं ये हेल्दी लाइफस्टाइल टिप्स",
      slug: "new-year-healthy-lifestyle-tips",
      excerpt: "2026 में स्वस्थ और खुशहाल जीवन के लिए अपनाएं ये आसान आदतें।",
      image: getPlaceholderImage(1203),
      category: "food-lifestyle",
      categoryHindi: "खान-पान और लाइफस्टाइल",
      author: "डॉ. दीपिका शाह",
      publishedDate: "2026-01-01T12:00:00Z",
      readTime: "6 मिनट",
    },
  ],
  nearby: [
    {
      id: "nb1",
      title: "मुरादाबाद में नई औद्योगिक इकाई का उद्घाटन",
      slug: "moradabad-new-industrial-unit",
      excerpt: "पीतल नगरी मुरादाबाद में नई औद्योगिक इकाई से हजारों को मिलेगा रोजगार।",
      image: getPlaceholderImage(1301),
      category: "nearby",
      categoryHindi: "आस-पास",
      author: "सचिन तिवारी",
      publishedDate: "2026-01-03T11:00:00Z",
      readTime: "4 मिनट",
      isFeatured: true,
    },
    {
      id: "nb2",
      title: "बिजनौर में बाढ़ राहत कार्य तेज",
      slug: "bijnor-flood-relief-work",
      excerpt: "बिजनौर जिले में बाढ़ प्रभावित क्षेत्रों में राहत कार्य जारी है।",
      image: getPlaceholderImage(1302),
      category: "nearby",
      categoryHindi: "आस-पास",
      author: "राजीव कुमार",
      publishedDate: "2026-01-03T09:45:00Z",
      readTime: "3 मिनट",
    },
    {
      id: "nb3",
      title: "संभल में पर्यटन को मिलेगा बढ़ावा",
      slug: "sambhal-tourism-promotion",
      excerpt: "ऐतिहासिक संभल में पर्यटन को बढ़ावा देने के लिए नई योजना शुरू।",
      image: getPlaceholderImage(1303),
      category: "nearby",
      categoryHindi: "आस-पास",
      author: "फरहान अली",
      publishedDate: "2026-01-02T16:30:00Z",
      readTime: "4 मिनट",
    },
  ],
};

// Get news by category
export const getNewsByCategory = (categorySlug: string): NewsArticle[] => {
  return mockNewsData[categorySlug] || [];
};

// Get all news articles
export const getAllNews = (): NewsArticle[] => {
  return Object.values(mockNewsData).flat();
};

// Get featured news
export const getFeaturedNews = (): NewsArticle[] => {
  return getAllNews().filter((article) => article.isFeatured);
};

// Get breaking news
export const getBreakingNews = (): NewsArticle[] => {
  return getAllNews().filter((article) => article.isBreaking);
};

// Get trending news (mock based on random selection)
export const getTrendingNews = (): NewsArticle[] => {
  const all = getAllNews();
  return all.slice(0, 5);
};

// Format date in Hindi
export const formatDateHindi = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("hi-IN", options);
};

// Get relative time in Hindi
export const getRelativeTimeHindi = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "अभी";
  if (diffMins < 60) return `${diffMins} मिनट पहले`;
  if (diffHours < 24) return `${diffHours} घंटे पहले`;
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  return formatDateHindi(dateString);
};
