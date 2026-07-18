export interface Category {
  id: string;
  slug: string;
  titleHindi: string;
  titleEnglish: string;
  description: string;
  path: string;
}

export const categories: Category[] = [
  {
    id: "rampur",
    slug: "rampur",
    titleHindi: "रामपुर",
    titleEnglish: "Rampur News",
    description: "रामपुर जिले से जुड़ी ताज़ा, विश्वसनीय और ज़मीनी खबरें।",
    path: "/rampur",
  },
  {
    id: "local",
    slug: "local",
    titleHindi: "स्थानीय",
    titleEnglish: "Local News",
    description: "स्थानीय समाचार और ज़मीनी खबरें।",
    path: "/local",
  },
  {
    id: "up",
    slug: "up",
    titleHindi: "उत्तर प्रदेश",
    titleEnglish: "UP News",
    description: "उत्तर प्रदेश से जुड़ी राजनीति, प्रशासन और जनहित की खबरें।",
    path: "/up",
  },
  {
    id: "national",
    slug: "national",
    titleHindi: "देश",
    titleEnglish: "National",
    description: "देशभर की महत्वपूर्ण राजनीतिक, सामाजिक और आर्थिक खबरें।",
    path: "/national",
  },
  {
    id: "international",
    slug: "international",
    titleHindi: "अंतरराष्ट्रीय",
    titleEnglish: "International",
    description: "दुनिया भर की अहम अंतरराष्ट्रीय खबरें और वैश्विक घटनाक्रम।",
    path: "/international",
  },
  {
    id: "politics",
    slug: "politics",
    titleHindi: "राजनीति",
    titleEnglish: "Politics",
    description: "स्थानीय और राष्ट्रीय राजनीति से जुड़ी खबरें और विश्लेषण।",
    path: "/politics",
  },
  {
    id: "crime",
    slug: "crime",
    titleHindi: "अपराध",
    titleEnglish: "Crime",
    description: "अपराध, कानून व्यवस्था और न्याय से जुड़ी रिपोर्ट्स।",
    path: "/crime",
  },
  {
    id: "education-jobs",
    slug: "education-jobs",
    titleHindi: "शिक्षा और नौकरियां",
    titleEnglish: "Education & Jobs",
    description: "शिक्षा, परीक्षाएं, भर्तियां और रोजगार समाचार।",
    path: "/education-jobs",
  },
  {
    id: "education",
    slug: "education",
    titleHindi: "शिक्षा",
    titleEnglish: "Education",
    description: "शिक्षा से जुड़ी ताज़ा खबरें।",
    path: "/education",
  },
  {
    id: "career",
    slug: "career",
    titleHindi: "करियर",
    titleEnglish: "Career",
    description: "करियर गाइडेंस, नौकरियों और तैयारी से जुड़ी खबरें।",
    path: "/education-jobs/career",
  },
  {
    id: "business",
    slug: "business",
    titleHindi: "व्यापार",
    titleEnglish: "Business",
    description: "व्यापार, अर्थव्यवस्था और स्थानीय बाजार की खबरें।",
    path: "/business",
  },
  {
    id: "entertainment",
    slug: "entertainment",
    titleHindi: "मनोरंजन",
    titleEnglish: "Entertainment",
    description: "फिल्म, टीवी, वेब सीरीज़ और मनोरंजन जगत की खबरें।",
    path: "/entertainment",
  },
  {
    id: "sports",
    slug: "sports",
    titleHindi: "खेल",
    titleEnglish: "Sports",
    description: "क्रिकेट, फुटबॉल और अन्य खेलों की ताज़ा खबरें।",
    path: "/sports",
  },
  {
    id: "health",
    slug: "health",
    titleHindi: "स्वास्थ्य",
    titleEnglish: "Health",
    description: "स्वास्थ्य, फिटनेस और चिकित्सा से जुड़ी जानकारी।",
    path: "/health",
  },
  {
    id: "technology",
    slug: "technology",
    titleHindi: "टेक्नोलॉजी",
    titleEnglish: "Technology",
    description: "टेक्नोलॉजी और डिजिटल दुनिया की खबरें।",
    path: "/technology",
  },
  {
    id: "religion-culture",
    slug: "religion-culture",
    titleHindi: "धर्म और संस्कृति",
    titleEnglish: "Religion & Culture",
    description: "धार्मिक, सांस्कृतिक और सामाजिक परंपराओं से जुड़ी खबरें।",
    path: "/religion-culture",
  },
  {
    id: "food-lifestyle",
    slug: "food-lifestyle",
    titleHindi: "खान-पान और लाइफस्टाइल",
    titleEnglish: "Food & Lifestyle",
    description: "खाने-पीने, जीवनशैली और ट्रेंड्स से जुड़ी खबरें।",
    path: "/food-lifestyle",
  },
  {
    id: "nearby",
    slug: "nearby",
    titleHindi: "आस-पास",
    titleEnglish: "Nearby",
    description: "रामपुर के आसपास के इलाकों की महत्वपूर्ण खबरें।",
    path: "/nearby",
  },
  {
    id: "editorials",
    slug: "editorials",
    titleHindi: "संपादकीय",
    titleEnglish: "Editorials",
    description: "संपादकीय, विश्लेषण और विशेष रिपोर्ट।",
    path: "/editorials",
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((cat) => cat.slug === slug);
};
