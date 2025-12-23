import { Amenity, Property, LandlordStats, Inquiry, Tenant } from './types';

export const AMENITIES: Amenity[] = [
  { id: 'water', name_en: 'Reliable Water', name_sw: 'Maji ya Uhakika', icon: 'droplet' },
  { id: 'power', name_en: 'LUKU Meter', name_sw: 'LUKU', icon: 'zap' },
  { id: 'security', name_en: 'Fenced/Security', name_sw: 'Ulinzi/Fence', icon: 'shield' },
  { id: 'ac', name_en: 'Air Conditioning', name_sw: 'AC', icon: 'wind' },
  { id: 'parking', name_en: 'Parking', name_sw: 'Parking', icon: 'car' },
  { id: 'wifi', name_en: 'WiFi', name_sw: 'WiFi', icon: 'wifi' },
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Masaki',
    location: 'Masaki, Kinondoni',
    city: 'Dar es Salaam',
    price: 1500000,
    period: 'month',
    bedrooms: 2,
    bathrooms: 2,
    type: 'Apartment',
    description_en: 'Luxury 2-bedroom apartment with sea view, standby generator, and modern kitchen. Walking distance to supermarkets.',
    description_sw: 'Apartment ya kisasa Masaki yenye vyumba viwili, view ya bahari, jenereta, na jiko la kisasa. Ipo karibu na supermarkets.',
    images: [
      'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Modern Balcony
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Modern Arch Room
    ],
    amenities: ['water', 'power', 'security', 'ac', 'parking', 'wifi'],
    landlordId: 'L1',
    verified: true,
    reviews: [
        { id: 'r1', userId: 'u2', userName: 'Grace M.', rating: 5, comment: 'Excellent security and constant water.', date: '2023-10-15' }
    ],
    status: 'ACTIVE',
    coordinates: { lat: -6.7483, lng: 39.2796 }
  },
  {
    id: '2',
    title: 'Affordable Room in Sinza',
    location: 'Sinza Madukani',
    city: 'Dar es Salaam',
    price: 250000,
    period: 'month',
    bedrooms: 1,
    bathrooms: 1,
    type: 'Room',
    description_en: 'Self-contained room near universities. Tiles, gypsum board ceiling, and shared compound. Water flows daily.',
    description_sw: 'Chumba self-contained Sinza. Tiles, gypsum, na uwanja wa kushare. Maji yanatoka kila siku.',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Empty Room Window
      'https://images.unsplash.com/photo-1505693416388-33a94a2e12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Simple Room
    ],
    amenities: ['water', 'power', 'security'],
    landlordId: 'L2',
    verified: true,
    status: 'ACTIVE',
    coordinates: { lat: -6.7833, lng: 39.2167 }
  },
  {
    id: '3',
    title: 'Family House in Dodoma CBD',
    location: 'Area D, Dodoma',
    city: 'Dodoma',
    price: 800000,
    period: 'month',
    bedrooms: 3,
    bathrooms: 2,
    type: 'House',
    description_en: 'Spacious 3-bedroom standalone house. Huge garden, perfect for families. Quiet neighborhood.',
    description_sw: 'Nyumba kubwa ya vyumba vitatu. Ina bustani kubwa, inafaa sana kwa familia. Eneo tulivu.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-27b88e57e62f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Spiral Stairs House
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Fence House
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Yellow/Modern House
    ],
    amenities: ['water', 'power', 'parking', 'security'],
    landlordId: 'L3',
    verified: false,
    status: 'RENTED',
    coordinates: { lat: -6.1630, lng: 35.7516 }
  },
  {
    id: '4',
    title: 'Student Hostel Near UDSM',
    location: 'Survey, Ubungo',
    city: 'Dar es Salaam',
    price: 150000,
    period: 'month',
    bedrooms: 1,
    bathrooms: 0,
    type: 'Hostel',
    description_en: 'Shared hostel room for students. Walking distance to UDSM main gate. Secure environment.',
    description_sw: 'Hostel ya kushare kwa wanafunzi. Kutembea kidogo tu kufika geti kuu la UDSM. Eneo lenye usalama.',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Bunk Beds
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Wooden Bunks
    ],
    amenities: ['water', 'power', 'wifi'],
    landlordId: 'L4',
    verified: true,
    status: 'ACTIVE',
    coordinates: { lat: -6.7905, lng: 39.2057 }
  }
];

export const MOCK_INQUIRIES: Inquiry[] = [
    { id: 'i1', propertyId: '2', propertyTitle: 'Affordable Room in Sinza', tenantName: 'Baraka John', tenantPhone: '0712345678', message: 'Is this room still available? Can I view it tomorrow?', date: '2023-11-20', status: 'PENDING' },
    { id: 'i2', propertyId: '1', propertyTitle: 'Modern Apartment in Masaki', tenantName: 'Sarah Smith', tenantPhone: '0755555555', message: 'Does the price include service charge?', date: '2023-11-19', status: 'READ' },
];

export const MOCK_TENANTS: Tenant[] = [
    { id: 't1', name: 'Aisha Juma', propertyId: '3', propertyTitle: 'Family House in Dodoma CBD', leaseStart: '2023-01-01', leaseEnd: '2023-12-31', status: 'ENDING_SOON', rentAmount: 800000 },
];

export const LANDLORD_STATS: LandlordStats = {
  totalViews: 1240,
  inquiries: 45,
  listings: 4,
  rating: 4.8,
  revenue: 3500000
};

export const TRANSLATIONS = {
  EN: {
    heroTitle: "Smart Choices for Your Next Home",
    heroSubtitle: "Simple, Speedy, and Affordable Access.",
    searchPlaceholder: "Search by location (e.g., Sinza, Masaki)",
    filters: "Filters",
    priceRange: "Price Range (TZS)",
    search: "Search",
    featured: "Featured Properties",
    contactLandlord: "Contact Landlord",
    verified: "Verified",
    perMonth: "/month",
    amenities: "Amenities",
    description: "Description",
    login: "Login / Sign Up",
    logout: "Logout",
    switchRole: "Switch Role",
    viewDashboard: "View Dashboard",
    dashboard: "Landlord Dashboard",
    addNew: "Add New Listing",
    views: "Total Views",
    inquiries: "Inquiries",
    myListings: "My Listings",
    aiAssistant: "Nyumba Rafiki (AI Help)",
    aiWelcome: "Habari! I am your AI assistant. Ask me about rental contracts, prices in Dar, or how to avoid scams.",
    virtualTour: "Virtual Tour 360°",
    rentWithTrust: "Rent with Trust",
    paymentSecure: "Secure Payment via Mobile Money",
    community: "Community & Tips",
    calculator: "Affordability Calculator",
    mapView: "Map View",
    listView: "List View",
    writeReview: "Write a Review",
    reviews: "Reviews",
    submitReview: "Submit Review",
    contract: {
      title: "Tenancy Agreement",
      generate: "Generate Contract",
      send: "Sign & Send to Tenant",
      download: "Download PDF",
      generatedSuccess: "Contract generated successfully!",
    },
    auth: {
      title: "Welcome to NIKONEKTI",
      email: "Email",
      phone: "Phone",
      enterEmail: "Enter your email",
      enterPhone: "Enter phone number (e.g., 0712...)",
      sendOtp: "Send OTP",
      verifyOtp: "Verify OTP",
      password: "Password",
      login: "Login",
      signup: "Sign Up",
      role: "I am a...",
      tenant: "Tenant",
      landlord: "Landlord"
    },
    calc: {
      incomeLabel: "Your Monthly Income (TZS)",
      calculate: "Calculate Budget",
      result: "Recommended Rent Budget",
      advice: "Financial experts recommend spending no more than 30% of your income on rent."
    },
    landlord: {
      overview: "Overview",
      properties: "Properties",
      messages: "Messages",
      tenants: "Tenants & Leases",
      revenue: "Total Revenue",
      activeListings: "Active Listings",
      createListing: "Create New Listing",
      editListing: "Edit Listing",
      step1: "Basic Info",
      step2: "Details",
      step3: "Amenities",
      titleLabel: "Property Title",
      priceLabel: "Monthly Rent (TZS)",
      locationLabel: "Location (Neighborhood)",
      cityLabel: "City",
      descLabel: "Description",
      uploadPhotos: "Upload Photos",
      save: "Publish Listing",
      update: "Update Listing",
      cancel: "Cancel",
      next: "Next",
      back: "Back",
      generateContract: "Generate Contract",
      contractMsg: "Contract generated and sent to tenant via SMS.",
      reply: "Reply",
      markRead: "Mark Read"
    }
  },
  SW: {
    heroTitle: "Chaguo Bora kwa Nyumba Yako Ijayo",
    heroSubtitle: "Upatikanaji Rahisi, Haraka, na wa Gharama Nafuu.",
    searchPlaceholder: "Tafuta eneo (mf. Sinza, Masaki)",
    filters: "Vigezo",
    priceRange: "Bei (TZS)",
    search: "Tafuta",
    featured: "Nyumba Zinazopendekezwa",
    contactLandlord: "Wasiliana na Mwenye Nyumba",
    verified: "Imethibitishwa",
    perMonth: "/mwezi",
    amenities: "Huduma",
    description: "Maelezo",
    login: "Ingia / Jisajili",
    logout: "Toka",
    switchRole: "Badili Hali",
    viewDashboard: "Ona Dashboard",
    dashboard: "Dashboard ya Mwenye Nyumba",
    addNew: "Weka Nyumba Mpya",
    views: "Waliotazama",
    inquiries: "Maulizo",
    myListings: "Nyumba Zangu",
    aiAssistant: "Nyumba Rafiki (AI)",
    aiWelcome: "Habari! Mimi ni msaidizi wako. Niulize kuhusu mikataba, bei za nyumba, au jinsi ya kukwepa matapeli.",
    virtualTour: "Tembelea Kijiditali 360°",
    rentWithTrust: "Panga kwa Amani",
    paymentSecure: "Lipa Salama kwa Simu",
    community: "Jamii na Ushauri",
    calculator: "Kikokotoo cha Bajeti",
    mapView: "Ona Ramani",
    listView: "Ona Orodha",
    writeReview: "Andika Maoni",
    reviews: "Maoni",
    submitReview: "Tuma Maoni",
    contract: {
      title: "Mkataba wa Upangaji",
      generate: "Tengeneza Mkataba",
      send: "Saini na Tuma kwa Mpangaji",
      download: "Pakua PDF",
      generatedSuccess: "Mkataba umetengenezwa kikamilifu!",
    },
    auth: {
      title: "Karibu NIKONEKTI",
      email: "Barua Pepe",
      phone: "Simu",
      enterEmail: "Weka barua pepe",
      enterPhone: "Weka namba ya simu (mf. 0712...)",
      sendOtp: "Tuma OTP",
      verifyOtp: "Thibitisha OTP",
      password: "Neno la siri",
      login: "Ingia",
      signup: "Jisajili",
      role: "Mimi ni...",
      tenant: "Mpangaji",
      landlord: "Mwenye Nyumba"
    },
    calc: {
      incomeLabel: "Kipato chako kwa mwezi (TZS)",
      calculate: "Kokotoa Bajeti",
      result: "Bajeti Inayopendekezwa",
      advice: "Wataalamu wanashauri kutotumia zaidi ya 30% ya kipato chako kwenye kodi ya nyumba."
    },
    landlord: {
      overview: "Muhtasari",
      properties: "Nyumba Zangu",
      messages: "Meseji",
      tenants: "Wapangaji & Mikataba",
      revenue: "Mapato Jumla",
      activeListings: "Nyumba Zilizo Sokoni",
      createListing: "Weka Nyumba Mpya",
      editListing: "Hariri Nyumba",
      step1: "Taarifa za Msingi",
      step2: "Maelezo",
      step3: "Huduma",
      titleLabel: "Jina la Nyumba",
      priceLabel: "Kodi kwa Mwezi (TZS)",
      locationLabel: "Eneo (Mtaa)",
      cityLabel: "Mji",
      descLabel: "Maelezo",
      uploadPhotos: "Weka Picha",
      save: "Chapisha",
      update: "Sasisha",
      cancel: "Ghairi",
      next: "Endelea",
      back: "Rudi",
      generateContract: "Tengeneza Mkataba",
      contractMsg: "Mkataba umetengenezwa na kutumwa kwa mpangaji.",
      reply: "Jibu",
      markRead: "Soma"
    }
  }
};