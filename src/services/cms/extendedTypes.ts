// Extended CMS Types for structured content modules

// ============ EDUCATION MODULE ============
export interface CMSExam {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  examDate: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  admitCardDate?: string;
  resultDate?: string;
  organization: string;
  organizationHindi: string;
  category: 'board' | 'entrance' | 'government' | 'university' | 'competitive';
  subcategory?: string;
  description: string;
  descriptionHindi?: string;
  eligibility?: string;
  eligibilityHindi?: string;
  officialWebsite?: string;
  applicationLink?: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  applicationStatus: 'open' | 'closed' | 'upcoming' | 'extended';
  admitCardStatus: 'available' | 'upcoming' | 'not-released';
  resultStatus: 'declared' | 'expected' | 'not-declared';
  isPopular?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isLive?: boolean;
  totalPosts?: number;
  lastUpdated?: string;
  seoTitle?: string;
  seoDescription?: string;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CMSResult {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  resultDate: string;
  expectedDate?: string;
  organization: string;
  organizationHindi: string;
  category: 'board' | 'entrance' | 'government' | 'university' | 'competitive';
  description: string;
  descriptionHindi?: string;
  resultLink?: string;
  alternateLinks?: string[];
  image?: string;
  totalCandidates?: number;
  passPercentage?: number;
  cutoffMarks?: string;
  status: 'declared' | 'expected' | 'upcoming';
  isNew?: boolean;
  isFeatured?: boolean;
  lastUpdated?: string;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CMSInstitution {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  type: 'college' | 'school' | 'university' | 'coaching' | 'vocational' | 'iti';
  address: string;
  addressHindi: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  establishedYear?: number;
  affiliation?: string;
  affiliationHindi?: string;
  courses?: string[];
  coursesHindi?: string[];
  fees?: string;
  admissionProcess?: string;
  admissionProcessHindi?: string;
  examsAccepted?: string[];
  facilities?: string[];
  facilitiesHindi?: string[];
  image?: string;
  gallery?: string[];
  rating?: number;
  reviews?: number;
  description: string;
  descriptionHindi: string;
  about?: string;
  aboutHindi?: string;
  seoTitle?: string;
  seoDescription?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  contactPerson?: string;
  contactPersonHindi?: string;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// ============ CAREER GUIDANCE MODULE ============
export interface CMSCareerGuide {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  category: 'after-10th' | 'after-12th' | 'graduation' | 'government-jobs' | 'private-sector' | 'abroad' | 'skills';
  description: string;
  descriptionHindi: string;
  content: string;
  contentHindi: string;
  image?: string;
  author?: string;
  authorHindi?: string;
  authorImage?: string;
  eligibility?: string[];
  eligibilityHindi?: string[];
  careerPaths?: string[];
  careerPathsHindi?: string[];
  averageSalary?: string;
  topColleges?: string[];
  requiredExams?: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  publishedAt: string;
  lastUpdated?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// ============ NEWS & UPDATES MODULE ============
export interface CMSEducationNews {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  category: 'board-news' | 'exam-news' | 'result-news' | 'admission-news' | 'scholarship' | 'government-order';
  excerpt: string;
  excerptHindi: string;
  content: string;
  contentHindi: string;
  image?: string;
  source?: string;
  sourceLink?: string;
  author?: string;
  isBreaking?: boolean;
  isImportant?: boolean;
  isFeatured?: boolean;
  publishedAt: string;
  lastUpdated?: string;
  relatedExams?: string[];
  relatedResults?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

// ============ EDUCATION EVENTS & NOTIFICATIONS ============
export interface CMSEducationEvent {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  type: 'webinar' | 'seminar' | 'workshop' | 'counseling' | 'career-fair' | 'admission-drive' | 'exam-date';
  date: string;
  endDate?: string;
  time?: string;
  venue: string;
  venueHindi: string;
  venueType: 'online' | 'offline' | 'hybrid';
  registrationLink?: string;
  description: string;
  descriptionHindi: string;
  organizer?: string;
  organizerHindi?: string;
  isFree?: boolean;
  registrationDeadline?: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured?: boolean;
}

// ============ CULTURE MODULE ============
export interface CMSHoliday {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  date: string;
  endDate?: string;
  type: 'national' | 'regional' | 'religious' | 'cultural' | 'bank';
  religion?: 'hindu' | 'muslim' | 'christian' | 'sikh' | 'buddhist' | 'jain' | 'secular';
  description: string;
  descriptionHindi: string;
  significance?: string;
  significanceHindi?: string;
  rituals?: string[];
  ritualsHindi?: string[];
  image?: string;
  isRecurring: boolean;
  recurringType?: 'yearly' | 'lunar';
  isPublicHoliday: boolean;
  region?: string[];
  googleCalendarLink?: string;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// ============ FOOD & LIFESTYLE MODULE ============
export interface CMSRestaurant {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  type: 'restaurant' | 'cafe' | 'street-food' | 'sweet-shop' | 'dhaba' | 'fine-dining';
  cuisine: string[];
  address: string;
  addressHindi: string;
  city: string;
  district: string;
  phone?: string;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury';
  rating?: number;
  reviews?: number;
  openingHours?: string;
  image?: string;
  gallery?: string[];
  specialties?: string[];
  specialtiesHindi?: string[];
  description: string;
  descriptionHindi: string;
  isVeg?: boolean;
  hasDelivery?: boolean;
  isFeatured?: boolean;
  mapLink?: string;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CMSFashionStore {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  type: 'clothing' | 'jewelry' | 'footwear' | 'accessories' | 'tailor' | 'boutique';
  category: 'men' | 'women' | 'kids' | 'all';
  address: string;
  addressHindi: string;
  city: string;
  district: string;
  phone?: string;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury';
  rating?: number;
  image?: string;
  gallery?: string[];
  brands?: string[];
  specialties?: string[];
  specialtiesHindi?: string[];
  description: string;
  descriptionHindi: string;
  isFeatured?: boolean;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CMSShoppingCentre {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  type: 'mall' | 'market' | 'bazaar' | 'complex' | 'plaza';
  address: string;
  addressHindi: string;
  city: string;
  district: string;
  phone?: string;
  openingHours?: string;
  image?: string;
  gallery?: string[];
  storeCount?: number;
  amenities?: string[];
  amenitiesHindi?: string[];
  parkingAvailable?: boolean;
  description: string;
  descriptionHindi: string;
  isFeatured?: boolean;
  mapLink?: string;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CMSFamousPlace {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  type: 'historical' | 'religious' | 'recreational' | 'market' | 'landmark' | 'food-hub';
  address: string;
  addressHindi: string;
  city: string;
  district: string;
  image?: string;
  gallery?: string[];
  description: string;
  descriptionHindi: string;
  history?: string;
  historyHindi?: string;
  timings?: string;
  entryFee?: string;
  bestTimeToVisit?: string;
  isFeatured?: boolean;
  rating?: number;
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CMSEvent {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  date: string;
  endDate?: string;
  time?: string;
  venue: string;
  venueHindi: string;
  address: string;
  city: string;
  district: string;
  category: 'cultural' | 'religious' | 'sports' | 'educational' | 'business' | 'entertainment' | 'food' | 'fashion';
  organizer?: string;
  organizerHindi?: string;
  description: string;
  descriptionHindi: string;
  image?: string;
  ticketPrice?: string;
  registrationLink?: string;
  isFree?: boolean;
  isFeatured?: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  seo?: CMSSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// ============ TESTIMONIALS & EXPERT ADVICE ============
export interface CMSTestimonial {
  id: string;
  name: string;
  nameHindi: string;
  designation: string;
  designationHindi: string;
  image?: string;
  content: string;
  contentHindi: string;
  rating?: number;
  exam?: string;
  year?: string;
  isFeatured?: boolean;
}

export interface CMSExpert {
  id: string;
  name: string;
  nameHindi: string;
  designation: string;
  designationHindi: string;
  specialization: string;
  specializationHindi: string;
  image?: string;
  bio: string;
  bioHindi: string;
  experience?: number;
  education?: string;
  socialLinks?: {
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  isFeatured?: boolean;
}

// ============ VIDEO TUTORIALS ============
export interface CMSVideoTutorial {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  category: 'exam-prep' | 'career-guidance' | 'study-tips' | 'motivation' | 'subject-wise';
  description: string;
  descriptionHindi: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: string;
  views?: number;
  instructor?: string;
  instructorHindi?: string;
  tags?: string[];
  isFeatured?: boolean;
  publishedAt: string;
}

// ============ COMMON TYPES ============
export interface CMSSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  imageUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  titleHindi: string;
  date: string;
  endDate?: string;
  type: 'exam' | 'result' | 'holiday' | 'event' | 'application' | 'admit-card';
  category?: string;
  color?: string;
  link?: string;
  status?: string;
}

export interface Breadcrumb {
  label: string;
  labelHindi: string;
  path: string;
}

export interface StatusBadge {
  label: string;
  labelHindi: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'new' | 'live';
}

// Query params for extended types
export interface ExtendedQueryParams {
  type?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  district?: string;
  featured?: boolean;
  popular?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  applicationStatus?: string;
  resultStatus?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}
