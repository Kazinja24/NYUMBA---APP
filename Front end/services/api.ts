import { User, Property, Inquiry, Tenant, UserRole, Transaction, ForumPost } from '../types';
import { MOCK_PROPERTIES, MOCK_INQUIRIES, MOCK_TENANTS } from '../constants';

// Configuration to switch between Mock and Real Backend
const USE_MOCK_DATA = true; // Set to false when backend is running at localhost:8000
const API_BASE_URL = 'http://localhost:8000/api';

const STORAGE_KEYS = {
  USERS: 'nk_users',
  PROPERTIES: 'nk_properties',
  INQUIRIES: 'nk_inquiries',
  TENANTS: 'nk_tenants',
  CURRENT_USER: 'nk_current_user'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initializeStorage = () => {
  if (USE_MOCK_DATA) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(MOCK_PROPERTIES));
    if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(MOCK_INQUIRIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(MOCK_TENANTS));
    }
  }
};

initializeStorage();

// Real API Implementation
const realApi = {
    auth: {
        login: async (emailOrPhone: string): Promise<User> => {
            const res = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailOrPhone }) 
            });
            if (!res.ok) throw new Error('Login failed');
            const data = await res.json();
            return data.user;
        },
        signup: async (data: any): Promise<User> => {
             const res = await fetch(`${API_BASE_URL}/auth/signup/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data) 
            });
            if (!res.ok) throw new Error('Signup failed');
            const result = await res.json();
            return result.user;
        },
        sendOtp: async (phone: string): Promise<void> => {
             const res = await fetch(`${API_BASE_URL}/auth/otp/send/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }) 
            });
            if (!res.ok) throw new Error('Failed to send OTP');
        },
        verifyOtp: async (phone: string, code: string): Promise<boolean> => {
             const res = await fetch(`${API_BASE_URL}/auth/otp/verify/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code }) 
            });
            return res.ok;
        },
        getCurrentUser: (): User | null => {
            const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return stored ? JSON.parse(stored) : null;
        },
        logout: async () => {
             localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    },
    properties: {
        getAll: async (filters?: any): Promise<Property[]> => {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`${API_BASE_URL}/properties/?${query}`);
            if (!res.ok) throw new Error('Failed to fetch properties');
            return await res.json();
        },
        getById: async (id: string): Promise<Property | undefined> => {
            const res = await fetch(`${API_BASE_URL}/properties/${id}/`);
            if (!res.ok) return undefined;
            return await res.json();
        },
        create: async (property: Property): Promise<Property> => {
            const res = await fetch(`${API_BASE_URL}/properties/`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(property)
            });
            return await res.json();
        },
        update: async (property: Property): Promise<Property> => {
             const res = await fetch(`${API_BASE_URL}/properties/${property.id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(property)
            });
            return await res.json();
        }
    },
    inquiries: {
        getByLandlord: async (landlordId: string): Promise<Inquiry[]> => {
            const res = await fetch(`${API_BASE_URL}/inquiries/`);
            return await res.json();
        },
        send: async (inquiry: Partial<Inquiry>): Promise<Inquiry> => {
            const res = await fetch(`${API_BASE_URL}/inquiries/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inquiry)
            });
            return await res.json();
        }
    },
    tenants: {
        getByLandlord: async (landlordId: string): Promise<Tenant[]> => {
            const res = await fetch(`${API_BASE_URL}/leases/`);
            return await res.json();
        }
    },
    payment: {
        initiate: async (amount: number, phone: string, provider: string): Promise<Transaction> => {
             const res = await fetch(`${API_BASE_URL}/payments/initiate/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, phone, provider })
            });
            return await res.json();
        }
    },
    forum: {
        getPosts: async (): Promise<ForumPost[]> => {
            // Placeholder for real backend
            return [];
        }
    }
};

// Mock API Implementation (Fallback)
const mockApi = {
  auth: {
    login: async (emailOrPhone: string): Promise<User> => {
      await delay(800);
      const user: User = {
        id: 'u_' + Date.now(),
        name: 'User ' + emailOrPhone.split('@')[0],
        role: UserRole.TENANT,
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
        isVerified: true,
        kycStatus: 'VERIFIED'
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    },
    
    signup: async (data: any): Promise<User> => {
      await delay(1000);
      const user: User = {
        id: 'u_' + Date.now(),
        name: data.name || 'New User',
        role: data.role || UserRole.TENANT,
        email: data.email,
        phone: data.phone,
        isVerified: false,
        kycStatus: 'PENDING'
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    },

    sendOtp: async (phone: string): Promise<void> => {
        await delay(500);
        console.log(`[MOCK SMS] OTP sent to ${phone}: 123456`);
        // In reality, this triggers the SMS gateway
    },

    verifyOtp: async (phone: string, code: string): Promise<boolean> => {
        await delay(500);
        return code === '123456';
    },

    getCurrentUser: (): User | null => {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    },

    logout: async () => {
      await delay(300);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  properties: {
    getAll: async (filters?: any): Promise<Property[]> => {
      await delay(600);
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      let properties: Property[] = stored ? JSON.parse(stored) : [];

      if (filters) {
        if (filters.term) {
          const term = filters.term.toLowerCase();
          properties = properties.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.location.toLowerCase().includes(term) ||
            p.city.toLowerCase().includes(term)
          );
        }
        if (filters.minPrice) properties = properties.filter(p => p.price >= filters.minPrice);
        if (filters.maxPrice) properties = properties.filter(p => p.price <= filters.maxPrice);
        if (filters.city) properties = properties.filter(p => p.city === filters.city);
      }
      return properties;
    },

    getById: async (id: string): Promise<Property | undefined> => {
      await delay(400);
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      const properties: Property[] = stored ? JSON.parse(stored) : [];
      return properties.find(p => p.id === id);
    },

    create: async (property: Property): Promise<Property> => {
      await delay(1000);
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      const properties: Property[] = stored ? JSON.parse(stored) : [];
      const newProperty = { ...property, id: Date.now().toString(), status: 'ACTIVE' as const };
      
      const updatedProperties = [...properties, newProperty];
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updatedProperties));
      return newProperty;
    },

    update: async (property: Property): Promise<Property> => {
      await delay(800);
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      const properties: Property[] = stored ? JSON.parse(stored) : [];
      
      const updatedProperties = properties.map(p => p.id === property.id ? property : p);
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updatedProperties));
      return property;
    }
  },

  inquiries: {
    getByLandlord: async (landlordId: string): Promise<Inquiry[]> => {
      await delay(500);
      const stored = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      const inquiries: Inquiry[] = stored ? JSON.parse(stored) : [];
      return inquiries; 
    },

    send: async (inquiry: Partial<Inquiry>): Promise<Inquiry> => {
      await delay(800);
      const stored = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      const inquiries: Inquiry[] = stored ? JSON.parse(stored) : [];
      
      const newInquiry: Inquiry = {
        id: 'i_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        propertyId: inquiry.propertyId!,
        propertyTitle: inquiry.propertyTitle!,
        tenantName: inquiry.tenantName || 'Anonymous',
        tenantPhone: inquiry.tenantPhone || '',
        message: inquiry.message || ''
      };

      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([newInquiry, ...inquiries]));
      return newInquiry;
    }
  },

  tenants: {
    getByLandlord: async (landlordId: string): Promise<Tenant[]> => {
      await delay(500);
      const stored = localStorage.getItem(STORAGE_KEYS.TENANTS);
      return stored ? JSON.parse(stored) : [];
    }
  },

  payment: {
    initiate: async (amount: number, phone: string, provider: string): Promise<Transaction> => {
         await delay(2000); // Simulate USSD push delay
         return {
             id: 'tx_' + Date.now(),
             amount,
             currency: 'TZS',
             provider: provider as any,
             status: 'SUCCESS', // Simulate instant success for demo
             date: new Date().toISOString(),
             reference: 'NIK-' + Math.floor(Math.random() * 100000)
         };
    }
  },

  forum: {
      getPosts: async (): Promise<ForumPost[]> => {
          await delay(500);
          return [
              {
                  id: 'f1',
                  authorName: 'John Doe',
                  title: 'Best areas for UDSM students?',
                  content: 'I am starting university next month, looking for cheap rentals.',
                  category: 'ADVICE',
                  likes: 12,
                  comments: 4,
                  date: '2023-11-20'
              },
              {
                  id: 'f2',
                  authorName: 'Admin',
                  title: 'WARNING: Do not pay agents before viewing',
                  content: 'Many people are getting scammed by fake agents in Sinza.',
                  category: 'SCAM_ALERT',
                  likes: 45,
                  comments: 10,
                  date: '2023-11-15'
              }
          ];
      }
  }
};

// Export the API based on configuration
export const api = USE_MOCK_DATA ? mockApi : realApi;