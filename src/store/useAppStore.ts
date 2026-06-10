import { create } from 'zustand';
import { Post, Comment } from '@/lib/types';

interface AppState {
  // Navigation Routing
  route: 'home' | 'blog' | 'feature' | 'about' | 'contact' | 'admin';
  activeSlug: string;
  setRoute: (route: 'home' | 'blog' | 'feature' | 'about' | 'contact' | 'admin') => void;
  setActiveSlug: (slug: string) => void;

  // Theme Config
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Data State
  posts: Post[];
  comments: Comment[];
  selectedPost: Post | null;
  isLoadingPosts: boolean;
  isLoadingComments: boolean;
  setPosts: (posts: Post[]) => void;
  setComments: (comments: Comment[]) => void;
  setSelectedPost: (post: Post | null) => void;

  // Search & Filter
  searchQuery: string;
  activeCategory: 'all' | 'highlights' | 'opinion' | 'stars' | 'events';
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: 'all' | 'highlights' | 'opinion' | 'stars' | 'events') => void;

  // Contact Form State
  contactName: string;
  contactEmail: string;
  contactType: string;
  contactMessage: string;
  isSubmittingContact: boolean;
  contactSuccess: boolean;
  setContactName: (name: string) => void;
  setContactEmail: (email: string) => void;
  setContactType: (type: string) => void;
  setContactMessage: (message: string) => void;
  setContactSuccess: (success: boolean) => void;

  // Administrative / Analytics
  adminTab: 'dashboard' | 'blogs' | 'new' | 'drafts' | 'settings' | 'edit';
  setAdminTab: (tab: 'dashboard' | 'blogs' | 'new' | 'drafts' | 'settings' | 'edit') => void;
  editingPostId: string;
  setEditingPostId: (id: string) => void;
  profile: any;
  setProfile: (profile: any) => void;
  analytics: any;
  setAnalytics: (analytics: any) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  isLoadingAnalytics: boolean;

  // Toast System
  toastMessage: string;
  isToastVisible: boolean;
  triggerToast: (msg: string) => void;
  hideToast: () => void;

  // Async core actions
  fetchPosts: () => Promise<void>;
  fetchAdminData: () => Promise<void>;
  submitContactForm: () => Promise<boolean>;
  incrementViewCount: (slug: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation Defaults
  route: 'home',
  activeSlug: '',
  setRoute: (route) => set({ route, activeSlug: route !== 'blog' ? '' : get().activeSlug }),
  setActiveSlug: (slug) => set({ activeSlug: slug }),

  // Theme Defaults
  theme: (() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
    } catch {
      return 'light';
    }
  })(),
  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('LocalStorage write blocked', e);
    }
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  // Blog Data Defaults
  posts: [],
  comments: [],
  selectedPost: null,
  isLoadingPosts: false,
  isLoadingComments: false,
  setPosts: (posts) => set({ posts }),
  setComments: (comments) => set({ comments }),
  setSelectedPost: (selectedPost) => set({ selectedPost }),

  // Filter Defaults
  searchQuery: '',
  activeCategory: 'all',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),

  // Contact Form Defaults
  contactName: '',
  contactEmail: '',
  contactType: 'feedback',
  contactMessage: '',
  isSubmittingContact: false,
  contactSuccess: false,
  setContactName: (contactName) => set({ contactName }),
  setContactEmail: (contactEmail) => set({ contactEmail }),
  setContactType: (contactType) => set({ contactType }),
  setContactMessage: (contactMessage) => set({ contactMessage }),
  setContactSuccess: (contactSuccess) => set({ contactSuccess }),

  // Admin / Dashboard Defaults
  adminTab: 'dashboard',
  setAdminTab: (adminTab) => set({ adminTab }),
  editingPostId: '',
  setEditingPostId: (editingPostId) => set({ editingPostId }),
  profile: {
    username: 'arewa_editor',
    email: 'vandulinus@gmail.com',
    full_name: 'Vandulinus Arewa',
    password: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    bio: 'Lead Editorial Director and Curator mapping Northern Nigeria’s high-growth tech ecosystems.',
    two_factor_enabled: false,
    ip_whitelist: '0.0.0.0/0',
    last_login: ''
  },
  setProfile: (profile) => set({ profile }),
  analytics: {
    total_blogs: 0,
    published_blogs: 0,
    draft_blogs: 0,
    total_views: 0,
    total_comments: 0,
    unread_notifications: 0,
    total_users: 0,
    estimated_shares: 0,
    categories: { highlights: 0, opinion: 0, stars: 0, events: 0 }
  },
  setAnalytics: (analytics) => set({ analytics }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  isLoadingAnalytics: false,

  // Toast System Defaults
  toastMessage: '',
  isToastVisible: false,
  triggerToast: (toastMessage) => set({ toastMessage, isToastVisible: true }),
  hideToast: () => set({ isToastVisible: false }),

  // Async Core Actions
  fetchPosts: async () => {
    set({ isLoadingPosts: true });
    try {
      const includeDrafts = get().route === 'admin';
      const response = await fetch(`/api/posts?includeDrafts=${includeDrafts}`);
      if (response.ok) {
        const data = await response.json();
        set({ posts: data });
      }
    } catch (err) {
      console.error('Failed to load posts index', err);
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  fetchAdminData: async () => {
    if (get().route !== 'admin') return;
    set({ isLoadingAnalytics: true });
    try {
      const aniRes = await fetch('/api/admin/analytics');
      if (aniRes.ok) {
        const aniData = await aniRes.json();
        set({ analytics: aniData });
      }
      const notiRes = await fetch('/api/notifications');
      if (notiRes.ok) {
        const notiData = await notiRes.json();
        set({ notifications: notiData });
      }
      const profRes = await fetch('/api/profile');
      if (profRes.ok) {
        const profData = await profRes.json();
        set({ profile: profData });
      }
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },

  submitContactForm: async () => {
    const { contactName, contactEmail, contactType, contactMessage, triggerToast } = get();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      triggerToast('All form fields are logically required.');
      return false;
    }

    set({ isSubmittingContact: true });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          type: contactType,
          message: contactMessage
        })
      });

      if (res.ok) {
        const data = await res.json();
        set({
          contactSuccess: true,
          contactName: '',
          contactEmail: '',
          contactMessage: ''
        });
        triggerToast(data.message || 'Your editorial tip or enquiry was securely routed.');
        return true;
      } else {
        triggerToast('Failed to dispatch enquiry. Try again later.');
        return false;
      }
    } catch (err) {
      console.error('Failed to dispatch contact email', err);
      triggerToast('SMTP transmission error. Contact system offline.');
      return false;
    } finally {
      set({ isSubmittingContact: false });
    }
  },

  incrementViewCount: async (slug) => {
    try {
      await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
    } catch (err) {
      console.warn('Could not register view telemetry', err);
    }
  }
}));
