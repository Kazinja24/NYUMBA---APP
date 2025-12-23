export enum UserRole {
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD',
  AGENT = 'AGENT'
}

export enum Language {
  EN = 'EN',
  SW = 'SW'
}

export type AuthMethod = 'EMAIL' | 'PHONE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  kycStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Amenity {
  id: string;
  name_en: string;
  name_sw: string;
  icon: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  city: 'Dar es Salaam' | 'Dodoma' | 'Arusha' | 'Mwanza';
  price: number;
  period: 'month' | '6 months' | 'year';
  bedrooms: number;
  bathrooms: number;
  type: 'Apartment' | 'House' | 'Room' | 'Hostel' | 'Frame';
  description_en: string;
  description_sw: string;
  images: string[];
  amenities: string[]; // IDs of amenities
  landlordId: string;
  verified: boolean;
  coordinates?: { lat: number; lng: number };
  reviews?: Review[];
  status?: 'ACTIVE' | 'DRAFT' | 'RENTED';
}

export interface LandlordStats {
  totalViews: number;
  inquiries: number;
  listings: number;
  rating: number;
  revenue: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  tenantPhone: string;
  message: string;
  date: string;
  status: 'PENDING' | 'READ' | 'RESPONDED';
}

export interface Tenant {
  id: string;
  name: string;
  propertyId: string;
  propertyTitle: string;
  leaseStart: string;
  leaseEnd: string;
  status: 'ACTIVE' | 'ENDING_SOON' | 'OVERDUE';
  rentAmount: number;
}

// New Types for Phase 2 Features

export interface Transaction {
  id: string;
  amount: number;
  currency: 'TZS';
  provider: 'M-PESA' | 'TIGO' | 'AIRTEL' | 'HALOPESA';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  date: string;
  reference: string;
}

export interface ForumPost {
  id: string;
  authorName: string;
  title: string;
  content: string;
  category: 'ADVICE' | 'SCAM_ALERT' | 'GENERAL';
  likes: number;
  comments: number;
  date: string;
}