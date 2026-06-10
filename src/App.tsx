import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Eye,
  ArrowLeft,
  Share2,
  Terminal,
  Lock,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  LayoutDashboard,
  FilePlus,
  EyeOff,
  LogOut,
  User,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Clock,
  Send,
  Mail,
  MapPin,
  ExternalLink,
  Award,
  Compass,
  MessageSquare,
  Facebook,
  Linkedin,
  Shield,
  CheckCircle2,
  Bell,
  Users,
  TrendingUp,
  X,
  Activity,
  FileText,
  Check,
  Settings
} from 'lucide-react';

import PostCard from '@/components/blog/PostCard';
import CommentForm from '@/components/blog/CommentForm';
import CommentList from '@/components/blog/CommentList';
import Sidebar from '@/components/admin/Sidebar';
import LexicalEditor from '@/components/editor/LexicalEditor';
import LexicalRenderer from '@/components/editor/LexicalRenderer';
import Toast from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Post, Comment } from '@/lib/types';
import { useAppStore } from '@/src/store/useAppStore';

export default function App() {
  // Centralized Zustand Store state binding
  const {
    route,
    setRoute,
    activeSlug,
    setActiveSlug,
    theme,
    setTheme,
    toggleTheme,
    posts,
    setPosts,
    comments,
    setComments,
    selectedPost,
    setSelectedPost,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactType,
    setContactType,
    contactMessage,
    setContactMessage,
    isSubmittingContact,
    contactSuccess,
    setContactSuccess,
    editingPostId,
    setEditingPostId,
    adminTab,
    setAdminTab,
    profile,
    setProfile,
    analytics,
    setAnalytics,
    notifications,
    setNotifications,
    isLoadingAnalytics,
    isLoadingPosts,
    toastMessage,
    isToastVisible,
    triggerToast,
    hideToast,
    fetchPosts,
    fetchAdminData,
    submitContactForm,
    incrementViewCount
  } = useAppStore();

  // Admin local states
  const [postScheduledAt, setPostScheduledAt] = useState('');

  // Sync theme with DOM body & html elements
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  
  // Form values for administrative edits
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postThumbnailUrl, setPostThumbnailUrl] = useState('');
  const [postStatus, setPostStatus] = useState<'draft' | 'published'>('draft');
  const [postCategory, setPostCategory] = useState<'highlights' | 'opinion' | 'stars' | 'events'>('highlights');
  const [postType, setPostType] = useState<'article' | 'event' | 'profile' | 'editorial'>('article');
  const [editorStateJson, setEditorStateJson] = useState<any>(null);

  // Secret admin access clicks counter
  const [copyrightClicks, setCopyrightClicks] = useState(0);

  // Settings form values
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileTwoFactor, setProfileTwoFactor] = useState(false);
  const [profileIPWhitelist, setProfileIPWhitelist] = useState('0.0.0.0/0');

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Initial data loading triggers
  useEffect(() => {
    fetchPosts();
  }, [route]);

  useEffect(() => {
    if (route === 'admin') {
      fetchAdminData().then(() => {
        const currentProfile = useAppStore.getState().profile;
        if (currentProfile) {
          setProfileUsername(currentProfile.username || '');
          setProfileEmail(currentProfile.email || '');
          setProfileFullName(currentProfile.full_name || '');
          setProfileAvatarUrl(currentProfile.avatar_url || '');
          setProfileBio(currentProfile.bio || '');
          setProfilePassword(currentProfile.password || '');
          setProfileTwoFactor(currentProfile.two_factor_enabled || false);
          setProfileIPWhitelist(currentProfile.ip_whitelist || '0.0.0.0/0');
        }
      });
    }
  }, [route, adminTab, posts]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        triggerToast('Notification marked as resolved.');
        setAnalytics({ ...analytics, unread_notifications: Math.max(0, analytics.unread_notifications - 1) });
      }
    } catch (_) {
      triggerToast('Error updating notification.');
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
        triggerToast('Notification dismissed.');
        fetchAdminData();
      }
    } catch (_) {
      triggerToast('Error deleting notification.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileUsername,
          email: profileEmail,
          full_name: profileFullName,
          avatar_url: profileAvatarUrl,
          bio: profileBio,
          password: profilePassword,
          two_factor_enabled: profileTwoFactor,
          ip_whitelist: profileIPWhitelist
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        triggerToast('Security Profile & System Preferences Synced successfully.');
      } else {
        triggerToast('Failed to sync security configuration.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network block on updating preferences.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Hash URL changes for back-forward browser support!
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/blog/')) {
        const slug = hash.replace('#/blog/', '');
        setActiveSlug(slug);
        setRoute('blog');
      } else if (hash === '#/blog') {
        setActiveSlug('');
        setRoute('blog');
      } else if (hash === '#/feature') {
        setActiveSlug('');
        setRoute('feature');
      } else if (hash === '#/about') {
        setActiveSlug('');
        setRoute('about');
      } else if (hash === '#/contact') {
        setActiveSlug('');
        setRoute('contact');
      } else if (hash === '#/admin') {
        setActiveSlug('');
        setRoute('admin');
      } else if (hash === '#/stars') {
        setActiveSlug('');
        setRoute('blog');
        setActiveCategory('stars');
      } else if (hash === '#/highlights') {
        setActiveSlug('');
        setRoute('blog');
        setActiveCategory('highlights');
      } else if (hash === '#/opinion') {
        setActiveSlug('');
        setRoute('blog');
        setActiveCategory('opinion');
      } else if (hash === '#/events') {
        setActiveSlug('');
        setRoute('blog');
        setActiveCategory('events');
      } else {
        setActiveSlug('');
        setRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Trigger helper once on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash helper
  const navigateTo = (newRoute: 'home' | 'blog' | 'feature' | 'about' | 'contact' | 'admin' | string) => {
    if (newRoute === 'home') {
      window.location.hash = '/';
      setRoute('home');
    } else if (newRoute === 'blog') {
      window.location.hash = '/blog';
      setActiveSlug('');
      setRoute('blog');
    } else if (newRoute === 'feature') {
      window.location.hash = '/feature';
      setRoute('feature');
    } else if (newRoute === 'about') {
      window.location.hash = '/about';
      setRoute('about');
    } else if (newRoute === 'contact') {
      window.location.hash = '/contact';
      setRoute('contact');
    } else if (newRoute === 'admin') {
      window.location.hash = '/admin';
      setRoute('admin');
      setAdminTab('dashboard');
    } else {
      window.location.hash = `/blog/${newRoute}`;
      setActiveSlug(newRoute);
      setRoute('blog');
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Load Article and Comments Detail
  useEffect(() => {
    if (route === 'blog' && activeSlug) {
      const fetchArticleDetail = async () => {
        setIsLoadingComments(true);
        try {
          // Fetch from post local index
          const found = posts.find(p => p.slug === activeSlug);
          if (found) {
            setSelectedPost(found);
            
            // Trigger View Counter with SessionStorage locks (Prevent spam on reload)
            const viewKey = `viewed_${activeSlug}`;
            if (!sessionStorage.getItem(viewKey)) {
              sessionStorage.setItem(viewKey, 'true');
              await fetch('/api/views', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: activeSlug })
              });
              
              // Increment visually
              setSelectedPost({ ...found, view_count: found.view_count + 1 });
            }

            // Fetch Comments
            const commentsResponse = await fetch(`/api/comments?post_id=${found.id}`);
            if (commentsResponse.ok) {
              const commentData = await commentsResponse.json();
              setComments(commentData);
            }
          } else {
            // Fetch directly from server if page loads before collection fetches completed
            const response = await fetch('/api/posts?includeDrafts=true');
            if (response.ok) {
              const allPosts: Post[] = await response.json();
              const matched = allPosts.find((p: Post) => p.slug === activeSlug);
              if (matched) {
                setSelectedPost(matched);
                
                // Trigger View increment
                const viewKey = `viewed_${activeSlug}`;
                if (!sessionStorage.getItem(viewKey)) {
                  sessionStorage.setItem(viewKey, 'true');
                  fetch('/api/views', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: activeSlug })
                  });
                  matched.view_count += 1;
                }

                const commentsRes = await fetch(`/api/comments?post_id=${matched.id}`);
                if (commentsRes.ok) {
                   const comm = await commentsRes.json();
                   setComments(comm);
                }
              }
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingComments(false);
        }
      };

      fetchArticleDetail();
    } else {
      setSelectedPost(null);
    }
  }, [route, activeSlug, posts]);

  // Comments Refresher
  const handleCommentSuccess = async () => {
    if (!selectedPost) return;
    try {
      const response = await fetch(`/api/comments?post_id=${selectedPost.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        triggerToast('Your response has been registered successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toast confirmation handled centrally via Zustand triggerToast action

  // Secret Admin doorway activation
  const handleCopyrightClick = () => {
    const nextCount = copyrightClicks + 1;
    setCopyrightClicks(nextCount);
    if (nextCount >= 5) {
      setCopyrightClicks(0);
      triggerToast('Security bypass validated. Admin Console unlocked.');
      navigateTo('admin');
    } else {
      // Quiet hints for developer review
      console.log(`Bypass click sequence: ${nextCount}/5 to load standard console.`);
    }
  };

  // Form submission for tip messages powered by Zustand and active Node SMTP routes
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContactForm();
  };

  // Clipboard share action handler
  const handleShareClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    triggerToast('Copied link directly to clipboard.');
  };

  // Social sharing helpers
  const getShareLinks = (post: Post) => {
    const url = window.location.href;
    const title = post.title;
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };
  };

  // Admin Post Mutation handlers
  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postSlug.trim() || !editorStateJson) {
      triggerToast('All core editor fields are required.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          slug: postSlug.trim().toLowerCase().replace(/\s+/g, '-'),
          content: editorStateJson,
          plain_text_excerpt: postExcerpt,
          thumbnail_url: postThumbnailUrl,
          status: postStatus,
          category: postCategory,
          type: postType,
          scheduled_at: postScheduledAt ? new Date(postScheduledAt).toISOString() : null
        })
      });

      if (response.ok) {
        triggerToast(`Post saved successfully as ${postStatus}.`);
        setPostTitle('');
        setPostSlug('');
        setPostExcerpt('');
        setPostThumbnailUrl('');
        setPostScheduledAt('');
        setPostCategory('highlights');
        setPostType('article');
        setEditorStateJson(null);
        setAdminTab('dashboard');
        fetchPosts();
      } else {
        const err = await response.json();
        triggerToast(`Error: ${err.error || 'Failed to save'}`);
      }
    } catch (e) {
      console.error(e);
      triggerToast('Server synchronization error.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!postTitle.trim() || !postSlug.trim()) {
      triggerToast('Title and Slug are required.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const response = await fetch(`/api/posts/${editingPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          slug: postSlug.trim().toLowerCase().replace(/\s+/g, '-'),
          content: editorStateJson,
          plain_text_excerpt: postExcerpt,
          thumbnail_url: postThumbnailUrl,
          status: postStatus,
          category: postCategory,
          type: postType,
          scheduled_at: postScheduledAt ? new Date(postScheduledAt).toISOString() : null
        })
      });

      if (response.ok) {
        triggerToast(`Post updated successfully as ${postStatus}.`);
        setPostTitle('');
        setPostSlug('');
        setPostExcerpt('');
        setPostThumbnailUrl('');
        setPostScheduledAt('');
        setPostCategory('highlights');
        setPostType('article');
        setEditorStateJson(null);
        setAdminTab('dashboard');
        fetchPosts();
      } else {
        const err = await response.json();
        triggerToast(`Error: ${err.error || 'Failed to update'}`);
      }
    } catch (e) {
      console.error(e);
      triggerToast('Server update error.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeletePost = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you wish to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        triggerToast('Article deleted successfully.');
        fetchPosts();
      } else {
        const err = await response.json();
        triggerToast(`Error: ${err.error}`);
      }
    } catch {
      triggerToast('Service error occurred.');
    }
  };

  const handleQuickPublish = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', scheduled_at: null })
      });

      if (response.ok) {
        triggerToast(`"${title}" promoted instantly!`);
        fetchPosts();
      } else {
        const err = await response.json();
        triggerToast(`Error: ${err.error || 'Failed to publish'}`);
      }
    } catch {
      triggerToast('Quick publish error.');
    }
  };

  // Helper initiates updating
  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostExcerpt(post.plain_text_excerpt);
    setPostThumbnailUrl(post.thumbnail_url || '');
    setPostStatus(post.status);
    setPostCategory((post.category as any) || 'highlights');
    setPostType((post.type as any) || 'article');
    setEditorStateJson(post.content);
    
    if (post.scheduled_at) {
      try {
        const d = new Date(post.scheduled_at);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        setPostScheduledAt(localISO);
      } catch {
        setPostScheduledAt('');
      }
    } else {
      setPostScheduledAt('');
    }

    setAdminTab('edit');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-200 selection:bg-indigo-500/20 antialiased font-sans flex flex-col">
      {/* 1. Timeless High-Contrast Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4" id="arewa-public-header">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          {/* Factual Editorial Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigateTo('home')}>
            <div className="w-5.5 h-5.5 rounded bg-[#111113] border border-zinc-750 flex items-center justify-center">
              <Terminal className="w-3 text-white stroke-[3.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-[#f4f4f5] leading-none">
                AREWA TECH JOURNAL
              </span>
              <span className="text-[8px] font-mono tracking-wider text-zinc-500 mt-0.5 uppercase">
                NORTHERN NIGERIA
              </span>
            </div>
          </div>

          {/* Sitemapped Top Navigation: Home | Blog | Feature | About | Contact (Strictly no Console) */}
          <nav className="hidden sm:flex items-center gap-6 text-[10.5px] font-mono tracking-wider font-semibold">
            <button
              onClick={() => navigateTo('home')}
              className={`transition cursor-pointer uppercase ${route === 'home' ? 'text-zinc-100 border-b border-zinc-100 pb-1' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('blog')}
              className={`transition cursor-pointer uppercase ${route === 'blog' ? 'text-zinc-100 border-b border-zinc-100 pb-1' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Blog
            </button>
            <button
              onClick={() => navigateTo('feature')}
              className={`transition cursor-pointer uppercase ${route === 'feature' ? 'text-zinc-100 border-b border-zinc-100 pb-1' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Feature
            </button>
            <button
              onClick={() => navigateTo('about')}
              className={`transition cursor-pointer uppercase ${route === 'about' ? 'text-zinc-100 border-b border-zinc-100 pb-1' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              About
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className={`transition cursor-pointer uppercase ${route === 'contact' ? 'text-zinc-100 border-b border-zinc-100 pb-1' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Widgets (Theme support + Quick Mobile Nav combo) */}
          <div className="flex items-center gap-3">
            {/* Soft Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-1.5 p-1.5 px-3 border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/30 rounded font-mono text-[9px] tracking-wider text-zinc-455 transition cursor-pointer select-none"
              title={theme === 'light' ? "Toggle Dark Monolith" : "Toggle Crisp Light"}
              id="theme-toggler"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3 h-3 text-zinc-600" />
                  <span>DARK</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-zinc-400" />
                  <span>LIGHT</span>
                </>
              )}
            </button>

            {/* Micro Administrative State Link Indicator (If current route is admin, let them escape easily) */}
            {route === 'admin' && (
              <button
                onClick={() => navigateTo('home')}
                className="flex items-center gap-1 p-1 bg-red-950/30 border border-red-900/60 rounded text-red-400 text-[9px] font-mono tracking-widest px-2"
              >
                <LogOut className="w-2.5 h-2.5" />
                <span>EXIT CONSOLE</span>
              </button>
            )}
          </div>
        </div>

        {/* Small Responsive Mobile Navigation Toolbar */}
        <div className="sm:hidden max-w-5xl mx-auto flex items-center justify-around border-t border-zinc-900 mt-3 pt-3 text-[9.5px] font-mono tracking-widest text-zinc-500 font-semibold">
          <button onClick={() => navigateTo('home')} className={route === 'home' ? 'text-white' : 'hover:text-zinc-200'}>HOME</button>
          <button onClick={() => navigateTo('blog')} className={route === 'blog' ? 'text-white' : 'hover:text-zinc-200'}>BLOG</button>
          <button onClick={() => navigateTo('feature')} className={route === 'feature' ? 'text-white' : 'hover:text-zinc-200'}>FEATURE</button>
          <button onClick={() => navigateTo('about')} className={route === 'about' ? 'text-white' : 'hover:text-zinc-200'}>ABOUT</button>
          <button onClick={() => navigateTo('contact')} className={route === 'contact' ? 'text-white' : 'hover:text-zinc-200'}>CONTACT</button>
        </div>
      </header>

      {/* 2. Routing Controller System */}
      <div className="flex-1 flex flex-col">
        
        {/* ==========================================
           1. LANDING / HOME PAGE SCREEN
           ========================================== */}
        {route === 'home' && (
          <main className="flex-grow max-w-5xl w-full mx-auto py-12 px-6 space-y-16 animate-in fade-in duration-200">
            {/* Cinematic Editorial Welcome Core */}
            <header className="border-b border-zinc-900 pb-12 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-zinc-900 to-transparent blur-3xl rounded-full pointer-events-none opacity-40" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Column 1: Descriptive Editorial Content */}
                <div className="space-y-6 lg:col-span-7 col-span-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full select-none">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">
                      ECOSYSTEM DOCUMENTATION JOURNAL • EST. JUNE 2026
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white leading-[1.05] selection:bg-zinc-800 animate-in slide-in-from-bottom-3 duration-500">
                    Documenting Software Engineering & co-working pipelines across Northern Nigeria.
                  </h1>
                  
                  <p className="text-zinc-400 text-xs md:text-sm lg:text-base leading-relaxed font-sans font-normal">
                    Welcome to the **Arewa Tech Journal**—the primary authority on on-the-ground technical milestones, emerging developers, regional innovation co-creation hubs, and code academies mapping out the northern tech landscape. Fully minimal, content-centric, and dedicated directly to community growth.
                  </p>

                  {/* Factual Monospaced System Accent details */}
                  <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest select-none">
                    <div>REGIONAL BASE: <span className="text-white hover:text-orange-400 transition cursor-default">KADUNA / KANO / JOS</span></div>
                    <div>ESTABLISHED: <span className="text-zinc-250 text-zinc-300">MID.2026</span></div>
                    <div>AIM: <span className="text-zinc-250 text-zinc-300">TALENT & INVESTMENTS Growth</span></div>
                    <div>STATUS: <span className="text-orange-450 text-orange-450 font-bold">FULLY INDEPENDENT</span></div>
                  </div>
                </div>

                {/* Column 2: Elegant, Detailed Futuristic Tech Growth Illustration Frame */}
                <div className="lg:col-span-5 col-span-1" id="hero-tech-growth-artwork-panel animate-in fade-in duration-700">
                  <div className="relative group rounded-xl overflow-hidden border border-zinc-850 bg-zinc-950 p-2 hover:border-zinc-700 transition-all duration-500 shadow-2xl shadow-black/80">
                    {/* Cyber Scope Corner Sights */}
                    <div className="absolute top-1 left-1 text-[8px] font-mono text-zinc-650 tracking-normal select-none pointer-events-none">[+]</div>
                    <div className="absolute top-1 right-1 text-[8px] font-mono text-zinc-650 tracking-normal select-none pointer-events-none">[+]</div>
                    <div className="absolute bottom-1 left-1 text-[8px] font-mono text-zinc-650 tracking-normal select-none pointer-events-none">[+]</div>
                    <div className="absolute bottom-1 right-1 text-[8px] font-mono text-zinc-650 tracking-normal select-none pointer-events-none">[+]</div>
                    
                    {/* Glowing Tech Mesh Image with Fallback and Elegant Gradient Mask */}
                    <div className="relative h-64 md:h-72 w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-900">
                      <img 
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
                        alt="Arewa Futuristic Technical Matrix" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                      
                      {/* Live Neon Pulse Node overlay representing Kaduna Hub */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <span className="absolute inline-flex h-20 w-20 rounded-full bg-orange-400/10 animate-ping duration-1000" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white shadow-xl shadow-orange-500/85">
                          <span className="absolute top-0 right-0 w-full h-full bg-orange-400 animate-pulse rounded-full" />
                        </span>
                      </div>

                      {/* Monospaced Location tag floating */}
                      <div className="absolute top-3 left-3 bg-zinc-950/90 border border-zinc-800 rounded-md px-2 py-0.5 font-mono text-[8px] text-zinc-300 tracking-widest select-none uppercase">
                        LOC_NODE://KADUNA_HUB
                      </div>
                    </div>

                    {/* Integrated Detail HUD telemetry bottom block (UIUX Experts Approach) */}
                    <div className="mt-3.5 p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-1.5 font-mono tracking-wide">
                      <div className="flex justify-between text-[9px] text-zinc-500 uppercase">
                        <span>SYS_TRACK_SIGNAL</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          STABLE
                        </span>
                      </div>
                      <div className="h-px bg-zinc-900" />
                      <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                        <div>
                          <span className="text-zinc-650 block text-[7.5px] uppercase">COORDS</span>
                          <span className="text-zinc-300">10.5105° N, 7.4165° E</span>
                        </div>
                        <div>
                          <span className="text-zinc-650 block text-[7.5px] uppercase">GROWTH SCALE</span>
                          <span className="text-orange-450 font-bold">+34.2% YTD</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </header>

            {/* Featured Story Preview (Spotlight) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h2 className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase font-bold">
                  FEATURED ANALYSIS
                </h2>
                <span className="text-[10px] font-mono text-zinc-650 tracking-wider">UPDATED PERIODICALLY</span>
              </div>

              {posts.filter(p => p.status === 'published' && p.category === 'stars').slice(0, 1).map((fPost) => (
                <div 
                  key={fPost.id}
                  onClick={() => navigateTo(fPost.slug)}
                  className="group grid grid-cols-1 md:grid-cols-12 border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-750 hover:shadow-xl hover:shadow-black/60 transition-all duration-300"
                  id="featured-story-spotlight-card"
                >
                  <div className="md:col-span-7 h-60 md:h-80 overflow-hidden bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-900 relative">
                    <img
                      src={fPost.thumbnail_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80'}
                      alt={fPost.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-101"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-4 left-4 bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[9px] tracking-widest px-2.5 py-1 rounded-full uppercase">
                      {fPost.category === 'stars' ? 'ecosystem star profile' : fPost.category}
                    </div>
                  </div>

                  <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                        CHRONOLOGY: {formatDate(fPost.created_at)}
                      </span>
                      <h3 className="text-xl md:text-2xl font-sans font-bold tracking-tight text-white group-hover:text-zinc-300 transition duration-150 leading-snug">
                        {fPost.title}
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed line-clamp-4">
                        {fPost.plain_text_excerpt || "A deeply researched on-the-ground exploration of northern technology accelerators driving developer mentoring programs."}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                      <span className="text-white hover:underline">READ_MONOGRAPH</span>
                      <div className="flex items-center gap-1.5 text-zinc-650">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{fPost.view_count || 0} VIEWS</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Quick Sitemapped Category Navigation Grid */}
            <section className="space-y-4">
              <span className="text-[10px] font-mono text-zinc-650 tracking-widest uppercase block border-b border-zinc-900 pb-2">CHANNELS INDEX</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="home-category-grid">
                {[
                  { key: 'stars', title: 'ECOSYSTEM STARS', link: '#/stars', desc: 'Detailed professional profiles of the builders, developers, and founders driving northern tech programs forward.' },
                  { key: 'highlights', title: 'NOTABLE HIGHLIGHTS', link: '#/highlights', desc: 'Credible, factual documents logging historic milestones and growth tracks inside the ecosystem.' },
                  { key: 'events', title: 'ACTIVITIES & EVENTS', link: '#/events', desc: 'On-the-ground schedules and comprehensive coverage of upcoming tech developer sums, incubator cycles.' },
                  { key: 'opinion', title: 'OPINION & PERSPECTIVES', link: '#/opinion', desc: 'Factual commentary, actionable technical suggestions, and blueprints for university computing curriculums.' }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      setActiveCategory(item.key as any);
                      navigateTo('blog');
                    }}
                    className="p-5 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 text-left transition duration-150 cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-4.5 h-4.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Compass className="w-2.5 text-zinc-400" />
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600 tracking-wider">CH_0{item.key[0].toUpperCase()}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold text-white tracking-widest">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500 leading-normal font-sans pr-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Chronological Archives Snippet */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase font-bold">LATEST DEPLOYED CHRONOLOGY</span>
                <span className="text-xs font-mono text-zinc-500 cursor-pointer hover:text-white transition" onClick={() => navigateTo('blog')}>VIEW_ALL_RECORDS ({posts.filter(p => p.status === 'published').length})</span>
              </div>

              {isLoadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-64 bg-zinc-900/40 border border-zinc-900 rounded-xl p-6 space-y-4 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts
                    .filter((p) => p.status === 'published')
                    .slice(0, 3)
                    .map((post) => (
                      <PostCard key={post.id} post={post} onClick={(slug) => navigateTo(slug)} />
                    ))}
                </div>
              )}
            </section>

            {/* Immersive Newsletter Call-To-Action (Timeless Contrast block) */}
            <section className="border border-zinc-900 bg-zinc-950 p-8 rounded-xl text-center flex flex-col items-center justify-center max-w-3xl mx-auto space-y-4 shadow-xl">
              <Award className="w-7 h-7 text-zinc-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-sans font-bold text-white tracking-tight">Stay Connected With Arewa Tech Ecosystem</h3>
                <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
                  Join our weekly digest sent straight from Kaduna, Kano and Jos co-working hubs. Real briefings, zero marketing fluff, 100% engineering.
                </p>
              </div>
              <div className="w-full max-w-sm pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="enter email for newsletter"
                    className="flex-grow bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-center outline-none focus:border-zinc-700"
                  />
                  <button
                    onClick={() => triggerToast('Welcome aboard! Weekly briefings scheduled.')}
                    className="p-2 px-5 bg-stone-100 hover:bg-stone-200 text-zinc-950 font-mono text-xs font-bold rounded tracking-widest transition cursor-pointer uppercase shrink-0"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* ==========================================
           2. BLOG PAGE (FILTERABLE ARCHIVE FEED)
           ========================================== */}
        {route === 'blog' && !selectedPost && (
          <main className="flex-grow max-w-5xl w-full mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-200">
            {/* Page Header */}
            <header className="border-b border-zinc-900 pb-8 text-left space-y-4">
              <h1 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight leading-none">
                Ecosystem Archive Feed
              </h1>
              <p className="text-sm text-zinc-450 leading-relaxed max-w-2xl font-sans">
                Browse our comprehensive catalogue. Filter records by key categories like professional profiles, notable milestones, commentaries, and local activities.
              </p>
            </header>

            {/* Category Filter accessible within the Blog page + Search input */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-zinc-900/60 pb-6">
              
              {/* Categories Toggles list: Highlights | Opinion | Stars | Activities & Events */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono tracking-widest uppercase font-semibold">
                {[
                  { key: 'all', title: 'All records' },
                  { key: 'stars', title: 'Stars / Profiles' },
                  { key: 'highlights', title: 'Highlights' },
                  { key: 'events', title: 'Activities & Events' },
                  { key: 'opinion', title: 'Opinion' }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key as any)}
                    className={`px-3 py-1.5 rounded transition cursor-pointer select-none ${
                      activeCategory === cat.key
                        ? 'bg-stone-100 text-zinc-950 border border-stone-100'
                        : 'bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-200 hover:border-zinc-800'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              {/* Monospaced Inline Search bar */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="[ SEARCH RECORDS... ]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded py-1.5 px-3 font-mono text-xs text-stone-300 placeholder-zinc-700 outline-none transition focus:border-zinc-800 text-center"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-[9px] font-mono text-zinc-500 hover:text-zinc-200"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </section>

            {/* Sorted posts Grid layout with robust filter matching */}
            <section className="space-y-6">
              {isLoadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-64 bg-zinc-900/40 rounded-xl" />
                  ))}
                </div>
              ) : (() => {
                let filtered = posts.filter(p => p.status === 'published');
                
                // Route categorization
                if (activeCategory !== 'all') {
                  filtered = filtered.filter(p => p.category === activeCategory);
                }

                // Inline query categorization
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  filtered = filtered.filter(p => 
                    p.title.toLowerCase().includes(q) || 
                    p.plain_text_excerpt.toLowerCase().includes(q) || 
                    p.slug.toLowerCase().includes(q)
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="py-24 text-center border border-zinc-900 rounded-xl bg-zinc-950/20 font-mono text-xs text-zinc-500">
                      Query returned empty index. Clear your search or select another category filter.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="blog-feeds-grid-container">
                    {filtered.map((post) => (
                      <PostCard key={post.id} post={post} onClick={(slug) => navigateTo(slug)} />
                    ))}
                  </div>
                );
              })()}
            </section>
          </main>
        )}

        {/* ==========================================
           3. BLOG ARTICLE READING SCREEN (DETAILED PAGE)
           ========================================== */}
        {route === 'blog' && selectedPost && (
          <main className="flex-grow py-16 px-6 max-w-2xl w-full mx-auto space-y-12 animate-in fade-in duration-250">
            {/* Back button */}
            <button
              onClick={() => navigateTo('blog')}
              className="group inline-flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-350 transition cursor-pointer select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>RETURN_TO_ARCHIVES</span>
            </button>

            {/* Detailed Article header */}
            <header className="space-y-6 pt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">AREWA JOURNAL READING</span>
                <span className="text-zinc-800">|</span>
                <span className="font-mono text-xs text-zinc-450 uppercase opacity-90">TAG: {selectedPost.category || 'highlights'}</span>
                <span className="text-zinc-800">|</span>
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-805 rounded text-zinc-300 font-mono text-[9px] uppercase tracking-wider">{selectedPost.type || 'article'}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-tight">
                {selectedPost.title}
              </h1>

              {/* Detailed Author Meta & Live Custom Social Sharing pre-configured */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-6 border-b border-zinc-900/60 font-mono text-xs text-zinc-500">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold block">DATE</span>
                    <span className="mt-1 text-zinc-300 block">{formatDate(selectedPost.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold block font-semibold">VIEWS STATS</span>
                    <span className="mt-1 text-zinc-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedPost.view_count || 0}</span>
                    </span>
                  </div>
                </div>

                {/* Custom sharing menu on top */}
                <div className="flex items-center gap-2" id="article-sharing-panel">
                  <span className="text-[10px] text-zinc-650 uppercase tracking-widest font-bold hidden md:inline">Share:</span>
                  
                  {/* Twitter / X */}
                  <a
                    href={getShareLinks(selectedPost).twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-stone-200 transition text-[10px] font-mono select-none"
                    title="Share on Twitter / X"
                  >
                    X
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={getShareLinks(selectedPost).whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-stone-250 transition text-[10px] font-mono select-none"
                    title="Share on WhatsApp"
                  >
                    WA
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={getShareLinks(selectedPost).linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-stone-200 transition text-[10px] font-mono select-none"
                    title="Share on LinkedIn"
                  >
                    IN
                  </a>

                  {/* Facebook */}
                  <a
                    href={getShareLinks(selectedPost).facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-stone-200 transition text-[10px] font-mono select-none"
                    title="Share on Facebook"
                  >
                    FB
                  </a>

                  {/* Clip Link icon */}
                  <button
                    onClick={handleShareClipboard}
                    className="p-1.5 border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer text-[10px] font-mono"
                    title="Copy direct web link"
                  >
                    LINK
                  </button>
                </div>
              </div>
            </header>

            {/* Article Image Cover Representation */}
            {selectedPost.thumbnail_url && (
              <div className="w-full h-64 md:h-80 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900">
                <img
                  src={selectedPost.thumbnail_url}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content Rendered via recursive custom Lexical layout */}
            <section className="prose prose-invert max-w-none text-zinc-200 space-y-4 text-justify">
              <LexicalRenderer content={selectedPost.content} />
            </section>

            {/* Bottom Sharing Widget block */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left space-y-1">
                <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">Spread Ecosystem Awareness</p>
                <p className="text-[11px] text-zinc-500 font-sans leading-none">Share this credible, on-the-ground coverage with fellow enthusiasts & investors.</p>
              </div>
              <div className="flex gap-2">
                <a href={getShareLinks(selectedPost).twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded font-mono text-[10px] text-stone-300">Twitter/X</a>
                <a href={getShareLinks(selectedPost).whatsapp} target="_blank" rel="noopener noreferrer" className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded font-mono text-[10px] text-stone-300">WhatsApp</a>
                <a href={getShareLinks(selectedPost).linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded font-mono text-[10px] text-stone-300">LinkedIn</a>
              </div>
            </div>

            {/* Dynamic Comments system */}
            <div className="h-[1px] bg-zinc-900 my-16" />

            <section className="space-y-8 pb-12" id="article-commentary-system">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-sans font-semibold text-white tracking-tight">Ecosystem Dialogue</h2>
                <span className="text-xs font-mono text-zinc-500">{comments.length} contributions</span>
              </div>

              {/* Minimal comments list */}
              <CommentForm postId={selectedPost.id} onSuccess={handleCommentSuccess} />
              
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">Dialogue Stream</h3>
                <CommentList comments={comments} isLoading={isLoadingComments} />
              </div>
            </section>
          </main>
        )}

        {/* ==========================================
           4. FEATURE PAGE SCREEN
           ========================================== */}
        {route === 'feature' && (
          <main className="flex-grow max-w-4xl w-full mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-200">
            <header className="border-b border-zinc-900 pb-8 text-left space-y-4">
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full font-mono text-[9px] text-zinc-400 tracking-wider">
                COMMUNITY PROFILES • FEATURED SPOTLIGHT PAGE
              </span>
              <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-none mt-2">
                Ecosystem Spotlight
              </h1>
              <p className="text-sm text-zinc-450 leading-relaxed max-w-2xl font-sans">
                A dedicated space profiling one exceptional tech builder, system community, or digital transition co-creation hub at a time. Updated on a rolling schedule.
              </p>
            </header>

            {/* Visual Column Block Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column Description */}
              <div className="md:col-span-8 space-y-8">
                <article className="space-y-6">
                  {/* Feature Main header */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-zinc-500 block">JUNE 2026 EDITION</span>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">
                      Scaling Systems-Programming Academies in Kaduna: The CoLab Legacy
                    </h2>
                  </div>

                  {/* Feature image */}
                  <div className="w-full h-80 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                    <img
                      src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80"
                      alt="Caduna mentorship center"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Journalistic text */}
                  <div className="space-y-4 font-sans text-stone-200 leading-relaxed text-sm text-justify">
                    <p>
                      In typical tech summits across Lagos or Nairobi, attention is often fixed on venture-capital aggregates or FinTech payment ratios. But in Kaduna, a quiet structural revolution is happening. Here, the currency is not raw capital, but deep, core engineering capability. Led by independent co-creation groups and veteran engineer clinics at co-working libraries, Kaduna is rising as a specialized powerhouse for system-level programming.
                    </p>
                    <p className="border-l-2 border-white pl-4 italic text-zinc-400 font-mono text-xs">
                      "If we teach our youth to only assemble template landing pages, we keep them as consumer-level engineers. If we teach them core compiler engineering, network pipelines, and database optimizations, we create international pioneers."
                    </p>

                    <p>
                      By providing high-speed co-working workspace cohorts and direct mentoring reviews under strict systems standards, local initiatives are taking higher education students from computer theorems to high-frequency engineering projects. Students learn to implement micro-services in Rust, build robust asynchronous backends in TypeScript, and streamline deployment configurations in Docker—bridging critical voids in modern computer science syllabi.
                    </p>
                    <p>
                      Over 500 young programmers have graduated from these co-creation clinics directly into remote setups. For regional developers, co-working bases like CoLab, Kaduna Co-Creation networks, and Kano co-working libraries are representing a concrete, independent economic alternative.
                    </p>
                  </div>
                </article>
              </div>

              {/* Right Column Stats Grid */}
              <div className="md:col-span-4 bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-6">
                <div>
                  <h4 className="font-mono text-xs text-white font-bold tracking-widest uppercase">Ecosystem Milestones</h4>
                  <p className="text-[11px] text-zinc-500 font-sans">Kaduna co-creation outcomes tracking.</p>
                </div>
                
                <div className="divide-y divide-zinc-900 font-mono">
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Mentees Graduated</span>
                    <span className="text-white font-bold">500+ Mentees</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Active Technical Hubs</span>
                    <span className="text-white font-bold">12 Centers</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Placement Rate</span>
                    <span className="text-white font-bold">85% Local/Remote</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Curriculums Revamped</span>
                    <span className="text-white font-bold">4 Institutions</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => navigateTo('contact')}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-zinc-950 font-mono text-[10px] font-bold tracking-wider rounded transition uppercase cursor-pointer"
                  >
                    Nominate Eco Builders
                  </button>
                </div>
              </div>

            </div>
          </main>
        )}

        {/* ==========================================
           5. ABOUT PAGE SCREEN
           ========================================== */}
        {route === 'about' && (
          <main className="flex-grow max-w-4xl w-full mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-200">
            <header className="border-b border-zinc-900 pb-8 text-left space-y-4">
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full font-mono text-[9px] text-zinc-400 tracking-wider uppercase">
                CREDIBILITY • DOCUMENTATION • INSIGHTS
              </span>
              <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-none">
                Our Story & Mission
              </h1>
              <p className="text-sm text-zinc-450 leading-relaxed max-w-2xl font-sans">
                Get to know the journalistic values, team, and on-the-ground passion driving our coverage of the Northern Nigerian tech ecosystem.
              </p>
            </header>

            {/* Dual Grid block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Mission Statement */}
              <div className="space-y-6">
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">The Mission</h3>
                <div className="space-y-4 font-sans text-xs md:text-sm text-zinc-400 leading-relaxed text-justify">
                  <p>
                    Arewa Tech Journal was founded to bridge a massive gap in technology reporting across Nigeria. Conventional tech publications typically focus exclusively on tech conglomerates or venture capitals raising seeds in Lagos. What happens in major regional hubs like Kaduna, Kano, Jos, Maiduguri, or Sokoto is regularly unrecorded.
                  </p>
                  <p>
                    We believe Northern Nigeria is home to an extraordinary, rapidly expanding reservoir of technical drive. Higher institution students, independent open-source developers, and co-creation communities are scaling solutions to local realities in agricultural science, finance, and logistics. Our goal is to represent their stories with <strong>absolute journalistic accuracy, factual credibility, and system-level depth</strong>.
                  </p>
                </div>
              </div>

              {/* Core Pillars */}
              <div className="space-y-6 bg-zinc-950 border border-zinc-900 p-6 rounded-xl">
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Our Core Pillars</h3>
                
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Journalistic Credibility
                    </h4>
                    <p className="text-zinc-500 leading-relaxed pl-3.5">We write about what actually exists on-the-ground. No speculative hypes, no fake co-working claims.</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Deep-Tech Scope
                    </h4>
                    <p className="text-zinc-500 leading-relaxed pl-3.5">We look past simple templates. We profile compiler builders, database engineers, co-working systems developers, and server admins.</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Community Oriented
                    </h4>
                    <p className="text-zinc-500 leading-relaxed pl-3.5">We help code learners, tertiary academic hubs, co-working teams, and regional investors discover and build pathways.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Core Team bios */}
            <section className="space-y-6 pt-6">
              <span className="text-[10px] font-mono text-zinc-650 tracking-widest uppercase block border-b border-zinc-900 pb-2">THE EDITORIAL TEAM</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: 'Audu Ibrahim', role: 'Co-Founding Editor & Technical Journalist', location: 'Kaduna, Nigeria', desc: 'An engineer and writer, Audu has tracking co-working groups and co-creation hubs in northern regions since 2019.' },
                  { name: 'Fatima Abubakar', role: 'Head of Developer Profiling', location: 'Kano, Nigeria', desc: 'With a background in computer networking research, Fatima coordinates stellar profiles in Kano, Jos and surrounding universities.' }
                ].map((member) => (
                  <div key={member.name} className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-3">
                    <div className="space-y-1 text-left">
                      <h4 className="font-sans font-bold text-white">{member.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{member.role} — {member.location}</p>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">{member.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* ==========================================
           6. CONTACT PAGE SCREEN (FUNCTIONAL TIP FORM)
           ========================================== */}
        {route === 'contact' && (
          <main className="flex-grow max-w-3xl w-full mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-200">
            <header className="border-b border-zinc-900 pb-8 text-left space-y-4">
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full font-mono text-[9px] text-zinc-400 tracking-wider uppercase">
                COLLABORATION • TIPS • FEEDBACK
              </span>
              <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-none">
                Submit Tips & Enquiries
              </h1>
              <p className="text-sm text-zinc-455 leading-relaxed font-sans">
                Are you a local founder, student building something, or managing a hub? Reach out with editorial tips, collaboration prospects, news, or general suggestions.
              </p>
            </header>

            {/* Submission Form Canvas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form elements */}
              <div className="md:col-span-8">
                {contactSuccess ? (
                  <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
                    <Compass className="w-10 h-10 text-emerald-400 mx-auto" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h3 className="text-lg font-sans font-bold text-white">Editorial Tip Received</h3>
                      <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto leading-relaxed">
                        We have successfully logged your technical tips or query. Fatima and Audu will inspect your message within 24 hours. Keep coding!
                      </p>
                    </div>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="p-2 px-6 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs rounded hover:border-zinc-700 transition cursor-pointer uppercase font-bold"
                    >
                      Log another Tip
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-5 bg-zinc-950/40 p-6 md:p-8 border border-zinc-900 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name input */}
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">FULL NAME</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Ibrahim Bello"
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-sans"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. bell@kadduna-dev.ng"
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-sans"
                        />
                      </div>

                    </div>

                    {/* Dropdown Tip category selection */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">MESSAGING PURPOSE</label>
                      <select
                        value={contactType}
                        onChange={(e) => setContactType(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-mono cursor-pointer"
                      >
                        <option value="tips">Ecosystem News Tip / Story Recommendation</option>
                        <option value="collaboration">Collaboration / Writing for ATJ</option>
                        <option value="profile">Stars Profile Recommendation</option>
                        <option value="feedback">General Reader Feedback</option>
                      </select>
                    </div>

                    {/* Message body input */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">YOUR ENQUIRY OR STORY DETAILS</label>
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        rows={5}
                        placeholder="Detail co-working milestones, emerging developers, or co-creation projects you would like mapped out..."
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-sans leading-relaxed resize-none"
                      />
                    </div>

                    {/* Submit tip button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingContact}
                        className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-zinc-950 font-mono text-xs font-bold tracking-widest rounded transition uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmittingContact ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                            <span>TRANSMITTING MESSAGE...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-zinc-950" />
                            <span>SUBMIT TIP RECORD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sidebar Quick contacts */}
              <div className="md:col-span-4 bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-6 text-left">
                <div className="space-y-1">
                  <h4 className="font-mono text-xs text-white uppercase tracking-widest font-bold">Direct Channels</h4>
                  <p className="text-[11px] text-zinc-500 font-sans">Reach out for rapid corporate communications.</p>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[9px] text-[#52525b] uppercase block">JOURNAL EMAIL</span>
                      <span className="text-zinc-350">editor@arewa-journal.tech</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[9px] text-[#52525b] uppercase block">PHYSICAL BASE</span>
                      <span className="text-zinc-350">Kaduna Hub, Kaduna, Nigeria</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 text-[10px] text-zinc-500 leading-normal font-sans">
                  We are extremely responsive to secure whistleblower logs, university curriculum submissions, co-working expansion alerts, and ecosystem profiles.
                </div>
              </div>

            </div>
          </main>
        )}

        {/* ==========================================
           7. COMPREHENSIVE ADMIN SECURITY PORTAL (REACHED VIA HASH #/admin)
           ========================================== */}
        {route === 'admin' && (
          <div className="flex-grow flex h-full min-h-[calc(100vh-64px)] animate-in fade-in duration-200">
            <Sidebar
              currentTab={adminTab}
              onNavigate={(tab) => setAdminTab(tab)}
              userEmail={profile.email}
              userFullName={profile.full_name}
              userAvatarUrl={profile.avatar_url}
              onSignOut={() => {
                triggerToast('Simulation Mode: Account session locked out.');
                navigateTo('home');
              }}
            />

            {/* Administrative Office Desk */}
            <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto max-w-5xl">
              
              {/* Analytics dashboard */}
              {adminTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-200 text-left">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
                    <div>
                      <h1 className="text-2.5xl font-mono font-bold tracking-tight text-[#f4f4f5] uppercase flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent animate-pulse" />
                        <span>System Telemetry & Analytics</span>
                      </h1>
                      <p className="text-xs text-zinc-500 font-sans mt-1">Real-time engagement indexes and whistleblower signal streams.</p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-zinc-500">
                      LAST AUDIT: <span className="text-accent">{profile.last_login ? formatDate(profile.last_login) : 'ACTIVE NOW'}</span>
                    </div>
                  </div>

                  {/* Operational Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Blogs count card */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3 relative group overflow-hidden hover:border-zinc-800 transition duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">TOTAL MONOGRAPHS</span>
                        <FileText className="w-4 h-4 text-zinc-650" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-mono font-bold text-white tracking-tight">{analytics.total_blogs}</p>
                        <p className="text-[10px] font-mono text-zinc-500">
                          <span className="text-accent">{analytics.published_blogs}</span> Active • <span className="text-amber-500">{analytics.draft_blogs}</span> Drafts
                        </p>
                      </div>
                    </div>

                    {/* View counts card */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3 relative group overflow-hidden hover:border-zinc-800 transition duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">COMBINED VIEWS</span>
                        <Eye className="w-4 h-4 text-zinc-650" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-mono font-bold text-white tracking-tight">{analytics.total_views}</p>
                        <p className="text-[10px] font-mono text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>+18.4% this cycle</span>
                        </p>
                      </div>
                    </div>

                    {/* Active Comments Card */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3 relative group overflow-hidden hover:border-zinc-800 transition duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">ACTIVE FEEDBACK</span>
                        <MessageSquare className="w-4 h-4 text-zinc-650" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-mono font-bold text-white tracking-tight">{analytics.total_comments}</p>
                        <p className="text-[10px] font-mono text-zinc-500">100% moderation approved</p>
                      </div>
                    </div>

                    {/* Notification/Alert Card */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3 relative group overflow-hidden hover:border-zinc-800 transition duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">NOTIFICATION BUFFER</span>
                        <Bell className="w-4 h-4 text-zinc-650" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2">
                          <span>{analytics.unread_notifications}</span>
                          {analytics.unread_notifications > 0 && (
                            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                          )}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500">Requires active operator audit</p>
                      </div>
                    </div>

                    {/* Audited Visitors Card */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3 relative group overflow-hidden hover:border-zinc-800 transition duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">AUDITED VISITORS</span>
                        <Users className="w-4 h-4 text-zinc-650" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-mono font-bold text-white tracking-tight">{analytics.total_users}</p>
                        <p className="text-[10px] font-mono text-zinc-500">Est. unique browser nodes</p>
                      </div>
                    </div>
                  </div>

                  {/* Categories Distribution & System Health Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    {/* Left: Category volume distribution chart */}
                    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-5">
                      <div className="space-y-1">
                        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Ecosystem Catalog Volume</h3>
                        <p className="text-[11px] text-zinc-500 font-sans">Visual representation of content categories within our database.</p>
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Highlights progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                            <span>Notable Highlights ({analytics.categories.highlights || 0})</span>
                            <span>{analytics.total_blogs > 0 ? Math.round((analytics.categories.highlights / analytics.total_blogs) * 105) : 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent transition-all duration-500" 
                              style={{ width: `${analytics.total_blogs > 0 ? (analytics.categories.highlights / analytics.total_blogs) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Opinion progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                            <span>Opinion / Perspectives ({analytics.categories.opinion || 0})</span>
                            <span>{analytics.total_blogs > 0 ? Math.round((analytics.categories.opinion / analytics.total_blogs) * 105) : 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-500" 
                              style={{ width: `${analytics.total_blogs > 0 ? (analytics.categories.opinion / analytics.total_blogs) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Stars progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                            <span>Ecosystem Stars ({analytics.categories.stars || 0})</span>
                            <span>{analytics.total_blogs > 0 ? Math.round((analytics.categories.stars / analytics.total_blogs) * 105) : 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 transition-all duration-500" 
                              style={{ width: `${analytics.total_blogs > 0 ? (analytics.categories.stars / analytics.total_blogs) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Events progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                            <span>Activities & Events ({analytics.categories.events || 0})</span>
                            <span>{analytics.total_blogs > 0 ? Math.round((analytics.categories.events / analytics.total_blogs) * 105) : 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-500" 
                              style={{ width: `${analytics.total_blogs > 0 ? (analytics.categories.events / analytics.total_blogs) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Operational Status & System Parameters */}
                    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Journal Security Status</h3>
                        <p className="text-[11px] text-zinc-500 font-sans">Active operational guidelines and cryptographic locks state.</p>
                      </div>

                      <div className="space-y-3 pt-1 text-xs font-mono">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                          <span className="text-zinc-500 uppercase text-[9px] tracking-wider">SECURE ENTRY LOCKS</span>
                          <span className="text-accent flex items-center gap-1 text-[11px]">
                            <Shield className="w-3 h-3 text-accent" />
                            <span>ACTIVE PIN GATE</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                          <span className="text-zinc-500 uppercase text-[9px] tracking-wider">OPERATOR ACCOUNT</span>
                          <span className="text-zinc-300 text-[11px]">{profile.username} ({profile.email})</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                          <span className="text-zinc-500 uppercase text-[9px] tracking-wider">Two-Factor Authentication</span>
                          <span className={`text-[10px] uppercase font-bold ${profile.two_factor_enabled ? 'text-green-500' : 'text-zinc-500'}`}>
                            {profile.two_factor_enabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-zinc-500 uppercase text-[9px] tracking-wider">IP Whitelist Constraint</span>
                          <span className="text-zinc-450 text-[10px] mt-0.5 block truncate max-w-[180px]" title={profile.ip_whitelist}>
                            {profile.ip_whitelist || '0.0.0.0/0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active system notifications / inbox alerts feed */}
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                      <div>
                        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-accent" />
                          <span>Administrative Inbox & Signal Terminal</span>
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Story tips, secure whistleblowing submissions, and system events.</p>
                      </div>
                      <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400">
                        {notifications.length} DISCOVEREDS
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-center py-10 text-zinc-650 font-mono text-[11px]">
                          Complete clear inbox. No outstanding signal alerts found.
                        </p>
                      ) : (
                        notifications.map((item) => (
                          <div 
                            key={item.id} 
                            className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-150 ${
                              item.read 
                                ? 'bg-zinc-950/20 border-zinc-900/50' 
                                : 'bg-zinc-900/20 border-zinc-905/70 relative z-10'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                {!item.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                )}
                                <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 uppercase border ${
                                  item.type === 'whistleblower'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : item.type === 'tip'
                                      ? 'bg-accent/10 border-accent/20 text-accent-light'
                                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}>
                                  {item.type || 'system'}
                                </span>
                                <h4 className={`font-mono text-xs ${item.read ? 'text-zinc-400 font-medium' : 'text-zinc-100 font-bold'}`}>
                                  {item.title}
                                </h4>
                                <span className="text-[9px] font-mono text-zinc-600">
                                  {formatDate(item.created_at)}
                                </span>
                              </div>
                              <p className="text-[11px] font-sans text-zinc-400 leading-relaxed">
                                {item.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {!item.read && (
                                <button
                                  onClick={() => handleMarkNotificationRead(item.id)}
                                  className="p-1 px-2 text-[9px] font-mono bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-750 text-accent hover:text-accent-light transition cursor-pointer select-none uppercase"
                                  title="Mark as resolved"
                                >
                                  RESOLVE
                                </button>
                              )}
                              <button
                                onClick={() => handleDismissNotification(item.id)}
                                className="p-1 px-2 text-[9px] font-mono bg-zinc-900 border border-zinc-800 rounded hover:border-red-900/30 text-zinc-500 hover:text-red-400 transition cursor-pointer select-none uppercase"
                                title="Dismiss/Discard"
                              >
                                DISCARD
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Master Articles Index */}
              {adminTab === 'blogs' && (
                <div className="space-y-8 animate-in fade-in duration-200 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5 gap-4">
                    <div>
                      <h1 className="text-2.5xl font-mono font-bold tracking-tight text-[#f4f4f5] uppercase">Monographs Directory</h1>
                      <p className="text-xs text-zinc-500 font-sans mt-1">Audit public statistics, edit scripts, and manage state locks across {posts.length} indexed records.</p>
                    </div>
                    <button
                      onClick={() => {
                        setPostTitle('');
                        setPostSlug('');
                        setPostExcerpt('');
                        setPostStatus('draft');
                        setPostCategory('highlights');
                        setPostType('article');
                        setEditorStateJson(null);
                        setAdminTab('new');
                      }}
                      className="flex items-center gap-1.5 bg-zinc-100 hover:bg-stone-200 text-zinc-950 font-mono text-xs font-bold px-4.5 py-2.5 rounded-lg transition select-none cursor-pointer uppercase self-start sm:self-auto"
                      id="btn-trigger-new-post-overhaul"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-950" />
                      <span>Draft New Monograph</span>
                    </button>
                  </div>

                  {/* Filter and search utilities */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Search posts by title, slug, summary..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-700"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="w-full sm:w-auto">
                      <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-lg text-xs font-mono text-zinc-400 outline-none cursor-pointer"
                      >
                        <option value="all">ALL CATEGORIES</option>
                        <option value="highlights">NOTABLE HIGHLIGHTS</option>
                        <option value="opinion">OPINIONS & REFLECTIONS</option>
                        <option value="stars">ECOSYSTEM STARS</option>
                        <option value="events">ACTIVITIES & EVENTS</option>
                      </select>
                    </div>
                  </div>

                  {/* Data Grid table */}
                  {isLoadingPosts ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-12 bg-zinc-900 rounded" />
                      <div className="h-12 bg-zinc-900 rounded" />
                    </div>
                  ) : (
                    (() => {
                      const filteredPosts = posts.filter(p => {
                        const matchesCat = activeCategory === 'all' || p.category === activeCategory;
                        const query = searchQuery.toLowerCase();
                        const matchesSearch = p.title.toLowerCase().includes(query) || 
                          p.slug.toLowerCase().includes(query) || 
                          (p.plain_text_excerpt && p.plain_text_excerpt.toLowerCase().includes(query));
                        return matchesCat && matchesSearch;
                      });

                      if (filteredPosts.length === 0) {
                        return (
                          <div className="text-center py-20 border border-zinc-900 bg-zinc-950/20 rounded-xl font-mono text-xs text-zinc-500">
                            No active matching monographs found. Try refining search constraints.
                          </div>
                        );
                      }

                      return (
                        <div className="border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl">
                          <table className="w-full text-left border-collapse font-sans text-sm">
                            <thead>
                              <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                                <th className="p-4 pl-6">TITLE</th>
                                <th className="p-4">CATEGORY</th>
                                <th className="p-4">TYPE</th>
                                <th className="p-4">STATUS</th>
                                <th className="p-4 text-center">VIEWS</th>
                                <th className="p-4 text-center">SHARES</th>
                                <th className="p-4 pr-6 text-right">ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900/80 text-zinc-300">
                              {filteredPosts.map((post) => {
                                const isScheduled = post.status === 'published' && post.scheduled_at && new Date(post.scheduled_at) > new Date();
                                const canQuickPublish = post.status === 'draft' || isScheduled;
                                // Estimate shares based on views dynamically
                                const sharesEst = Math.round((post.view_count || 0) * 0.12) + 2;

                                return (
                                  <tr key={post.id} className="hover:bg-zinc-900/15 transition duration-100">
                                    <td className="p-4 pl-6 text-left">
                                      <p className="font-semibold text-zinc-100 line-clamp-1">{post.title}</p>
                                      <p className="text-[10px] font-mono text-zinc-505 truncate max-w-[280px]">slug: {post.slug}</p>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-zinc-400 capitalize">{post.category || 'highlights'}</td>
                                    <td className="p-4 font-mono text-xs text-zinc-400 uppercase">{post.type || 'article'}</td>
                                    <td className="p-4">
                                      <div className="flex flex-col items-start gap-1">
                                        <span className={`px-2 py-0.5 text-[8.5px] font-mono rounded border uppercase tracking-wider ${
                                          isScheduled
                                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                            : post.status === 'published'
                                              ? 'bg-zinc-900 border-zinc-805 text-zinc-350'
                                              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                        }`}>
                                          {isScheduled ? 'scheduled' : post.status}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-zinc-400 text-center">{post.view_count || 0}</td>
                                    <td className="p-4 font-mono text-xs text-zinc-505 text-center">{sharesEst}</td>
                                    <td className="p-4 pr-6 text-right">
                                      <div className="inline-flex items-center gap-1.5">
                                        {/* Direct Reader link preview shortcut */}
                                        <button
                                          onClick={() => navigateTo(post.slug)}
                                          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 hover:text-[#f4f4f5] text-zinc-500 transition cursor-pointer"
                                          title="View Public Post Page"
                                          id={`btn-live-preview-shortcut-${post.id}`}
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                        
                                        {canQuickPublish && (
                                          <button
                                            onClick={() => handleQuickPublish(post.id, post.title)}
                                            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 text-accent transition cursor-pointer"
                                            title="Promote Immediately"
                                            id={`btn-pub-${post.id}`}
                                          >
                                            <Globe className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => startEditing(post)}
                                          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 hover:text-white text-zinc-400 transition cursor-pointer"
                                          title="Edit script in Lexical Composer"
                                          id={`btn-edit-${post.id}`}
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeletePost(post.id, post.title)}
                                          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded hover:border-red-900/40 hover:bg-red-900/10 hover:text-red-400 text-zinc-400 transition cursor-pointer"
                                          title="Delete entry completely"
                                          id={`btn-delete-${post.id}`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Staged Drafts Dashboard */}
              {adminTab === 'drafts' && (
                <div className="space-y-8 animate-in fade-in duration-200 text-left">
                  <div className="border-b border-zinc-900 pb-5">
                    <h1 className="text-2xl font-sans font-bold tracking-tight text-white">Staged Manuscripts</h1>
                    <p className="text-sm text-zinc-500 font-sans mt-1">Review draft posts currently locked from public view.</p>
                  </div>

                  <div className="space-y-4">
                    {posts.filter(p => p.status === 'draft').length === 0 ? (
                      <p className="text-center py-20 text-zinc-500 border border-zinc-900 bg-zinc-950/20 rounded-xl font-mono text-xs">
                        No active staged drafts found. Complete clean slate.
                      </p>
                    ) : (
                      posts.filter(p => p.status === 'draft').map(post => (
                        <div key={post.id} className="p-5 bg-zinc-955 border border-zinc-900 rounded-xl flex items-center justify-between hover:border-zinc-800 transition duration-150 bg-zinc-950" id={`draft-card-${post.id}`}>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-zinc-100">{post.title}</h3>
                            <p className="text-xs font-mono text-zinc-500">
                              LAST MODIFIED: {formatDate(post.updated_at)} • CATEGORY: {post.category || 'highlights'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wider">
                              STAGED DRAFT
                            </span>
                            <button
                              onClick={() => handleQuickPublish(post.id, post.title)}
                              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-350 hover:text-white hover:border-zinc-700 rounded transition cursor-pointer"
                              id={`btn-quick-pub-${post.id}`}
                            >
                              QUICK PUBLISH
                            </button>
                            <button
                              onClick={() => startEditing(post)}
                              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 rounded hover:border-zinc-700 transition cursor-pointer"
                              id={`btn-promote-${post.id}`}
                            >
                              OPEN EDITOR
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Security gate and Preferences Tab */}
              {adminTab === 'settings' && (
                <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in duration-200 text-left">
                  <div className="border-b border-zinc-900 pb-5">
                    <h1 className="text-2.5xl font-mono font-bold tracking-tight text-[#f4f4f5] uppercase flex items-center gap-2">
                      <Shield className="w-5 h-5 text-accent" />
                      <span>Security Passport & Control Gate</span>
                    </h1>
                    <p className="text-xs text-zinc-500 font-sans mt-1">Configure security passcodes, whitelists, and personalized avatars indicators.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    {/* Left profile info */}
                    <div className="md:col-span-4 space-y-6">
                      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-5">
                        <h3 className="font-mono text-xs font-bold text-stone-200 uppercase tracking-widest border-b border-zinc-900 pb-2">
                          Primary Identity Parameters
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">OPERATOR USERNAME</label>
                            <input
                              type="text"
                              value={profileUsername}
                              onChange={(e) => setProfileUsername(e.target.value)}
                              required
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">EMAIL NOTIFICATION ADDR</label>
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={(e) => setProfileEmail(e.target.value)}
                              required
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">OPERATOR FULL NAME</label>
                          <input
                            type="text"
                            value={profileFullName}
                            onChange={(e) => setProfileFullName(e.target.value)}
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-sans"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">EDITORIAL BIOGRAPHY</label>
                          <textarea
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 font-sans leading-relaxed resize-none"
                          />
                        </div>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-5">
                        <h3 className="font-mono text-xs font-bold text-stone-200 uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-accent" />
                          <span>Secret Passcode Gate & Whitelists</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">SYSTEM ACCESS PASSWORD</label>
                            <input
                              type="password"
                              value={profilePassword}
                              onChange={(e) => setProfilePassword(e.target.value)}
                              placeholder="Type to configure new access key"
                              className="w-full bg-zinc-900 border border-zinc-805 rounded px-4 py-2.5 text-xs text-stone-250 outline-none focus:border-accent font-mono text-accent"
                            />
                            <p className="text-[9px] text-zinc-600 font-mono">Ensures robust session mapping.</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">IP CIDR Restriction</label>
                            <input
                              type="text"
                              value={profileIPWhitelist}
                              onChange={(e) => setProfileIPWhitelist(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-805 rounded px-4 py-2.5 text-xs text-stone-250 outline-none focus:border-zinc-700 font-mono"
                            />
                            <p className="text-[9px] text-zinc-600 font-mono">Use 0.0.0.0/0 to bypass constraint checking.</p>
                          </div>
                        </div>

                        <div className="border-t border-zinc-900/80 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={profileTwoFactor}
                              onChange={(e) => setProfileTwoFactor(e.target.checked)}
                              className="rounded bg-zinc-900 border-zinc-800 text-accent focus:ring-accent-light w-4.5 h-4.5"
                            />
                            <div className="text-left">
                              <span className="text-xs font-mono text-zinc-300 font-bold uppercase block">ENFORCE MFA SECURITY KEY</span>
                              <span className="text-[10px] font-sans text-zinc-500">Enable physical hardware signature simulation mapping alerts.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right profile helper sidebar (preset selection and dynamic visual) */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-xl space-y-5 text-center">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Active Avatar Indicator</span>
                        
                        <div className="flex flex-col items-center gap-3">
                          {profileAvatarUrl ? (
                            <img
                              src={profileAvatarUrl}
                              alt="Profile View"
                              referrerPolicy="no-referrer"
                              className="w-20 h-20 rounded-lg object-cover border-2 border-accent shadow-xl bg-zinc-800"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-800">
                              <User className="w-10 h-10 text-zinc-400" />
                            </div>
                          )}

                          <input
                            type="text"
                            value={profileAvatarUrl}
                            onChange={(e) => setProfileAvatarUrl(e.target.value)}
                            placeholder="Manually map avatar URL link"
                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-300 text-center"
                          />
                        </div>

                        {/* Presets selection */}
                        <div className="space-y-1.5 border-t border-zinc-900/60 pt-4 text-left">
                          <span className="text-[9px] font-mono text-zinc-600 block uppercase tracking-wide">AVATAR SELECTION PRESETS</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
                              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
                            ].map((presetUrl, idx) => (
                              <button
                                key={presetUrl}
                                type="button"
                                onClick={() => setProfileAvatarUrl(presetUrl)}
                                className={`w-10 h-10 rounded-sm overflow-hidden border transition cursor-pointer ${
                                  profileAvatarUrl === presetUrl
                                    ? 'border-accent shadow-lg duration-100 scale-105'
                                    : 'border-zinc-850 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={presetUrl} alt="Preset select" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic device audit list */}
                      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl space-y-4">
                        <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block font-bold text-left">Security Signals Audit</span>
                        
                        <div className="space-y-3 text-left font-mono text-[9px] text-zinc-500">
                          <div className="p-2.5 bg-zinc-900/30 border border-zinc-900/60 rounded">
                            <span className="text-accent uppercase block font-bold">KANO CENTRAL HUB SIGNATURE</span>
                            <p className="mt-0.5 text-zinc-400">Node TS-Linux v24 • Chrome DevTools</p>
                            <p className="text-[8px] text-zinc-600 mt-1">TIME: {new Date().toISOString().substring(0, 16)} • OK</p>
                          </div>

                          <div className="p-2.5 bg-zinc-900/10 border border-transparent rounded">
                            <span className="text-zinc-400 uppercase block">KADUNA LAB SIMULATOR LINK</span>
                            <p className="mt-0.5 text-zinc-650">Ahmadu Bello Campus Node</p>
                            <p className="text-[8px] text-zinc-650 mt-1">TIME: 2026-06-07T05:32 • TIMEOUT MATCHED</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Row */}
                  <div className="flex justify-end pt-4 border-t border-zinc-900">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex items-center gap-1.5 bg-accent hover:bg-stone-200 text-zinc-950 font-mono text-xs font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 select-none cursor-pointer uppercase shadow-lg shadow-accent/5 hover:scale-[1.02]"
                      id="btn-settings-sync"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                          <span>Syncing Prefs...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
                          <span>Sync preferences & lock gate</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Dynamic Lexical Write Canvas */}
              {(adminTab === 'new' || adminTab === 'edit') && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl text-left">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
                    <div>
                      <h1 className="text-2xl font-sans font-bold tracking-tight text-white">
                        {adminTab === 'new' ? 'Craft New Publication' : 'Edit Staged Article'}
                      </h1>
                      <p className="text-sm text-zinc-500 font-sans mt-1">
                        Utilize standard inline commands. Floating toolbar mounts on highlight.
                      </p>
                    </div>
                    <div className="inline-flex gap-3">
                      <button
                        onClick={() => setAdminTab('dashboard')}
                        className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 font-mono text-xs rounded-lg transition select-none cursor-pointer uppercase"
                        id="btn-editor-cancel"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={adminTab === 'new' ? handleCreatePost : handleUpdatePost}
                        disabled={isSubmittingPost}
                        className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-zinc-104 text-zinc-950 font-mono text-xs font-bold px-5 py-2 rounded-lg transition disabled:opacity-50 select-none cursor-pointer uppercase"
                        id="btn-editor-save"
                      >
                        {isSubmittingPost ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                        ) : (
                          <span>Save Entry</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Core information configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ARTICLE TITLE</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => {
                          setPostTitle(e.target.value);
                          if (adminTab === 'new') {
                            setPostSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                          }
                        }}
                        placeholder="e.g. Spotlight: Fatima on Kano Tech hubs"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-sm outline-none transition focus:border-zinc-700 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">URL PATH SLUG</label>
                      <input
                        type="text"
                        value={postSlug}
                        onChange={(e) => setPostSlug(e.target.value)}
                        placeholder="kano-tech-hubs"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-sm outline-none transition focus:border-zinc-700 font-sans font-mono"
                      />
                    </div>
                  </div>

                  {/* Custom fields - category and type selects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 animate-in slide-in-from-top-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ECOSYSTEM CATEGORY</label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-xs outline-none transition focus:border-zinc-705 font-mono cursor-pointer"
                      >
                        <option value="highlights">Notable Highlights (milestones)</option>
                        <option value="opinion">Opinion / Perspectives</option>
                        <option value="stars">Ecosystem Stars (profiles)</option>
                        <option value="events">Activities & Events (coverage)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ARTICLE GENRE TYPE</label>
                      <select
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-xs outline-none transition focus:border-zinc-705 font-mono cursor-pointer"
                      >
                        <option value="article">Article / Report</option>
                        <option value="event">Event Coverage</option>
                        <option value="profile">Founder/Developer Profile</option>
                        <option value="editorial">Editorial Commentary</option>
                      </select>
                    </div>
                  </div>

                  {/* Excerpt and post status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">VISIBILITY LOCK</label>
                      <select
                        value={postStatus}
                        onChange={(e) => setPostStatus(e.target.value as 'draft' | 'published')}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-sm outline-none transition focus:border-zinc-705 font-mono cursor-pointer"
                      >
                        <option value="draft">STAGED DRAFT</option>
                        <option value="published">PROMOTE & PUBLISH</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">PLAIN TEXT SUMMARY EXCERPT</label>
                      <input
                        type="text"
                        value={postExcerpt}
                        onChange={(e) => setPostExcerpt(e.target.value)}
                        placeholder="A crisp monograph preview summary excerpt (one to two lines)."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-sm outline-none transition focus:border-zinc-700 font-sans"
                      />
                    </div>
                  </div>

                  {/* Scheduled Release configuration */}
                  {postStatus === 'published' && (
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                      <label className="block text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>SCHEDULE RELEASE PUBLISHING (OPTIONAL)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={postScheduledAt}
                        onChange={(e) => setPostScheduledAt(e.target.value)}
                        className="w-full bg-zinc-905 border border-zinc-800 rounded px-4 py-2.5 text-zinc-100 text-xs outline-none transition focus:border-zinc-700 font-mono cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-600 font-mono leading-none mt-0.5">
                        Leave empty to publish immediately. Future scheduling hides the post from readers until that timestamp occurs.
                      </p>
                    </div>
                  )}

                  {/* Thumbnail Cover Configuration Input Row */}
                  <div className="space-y-3 border border-zinc-900 bg-zinc-950/40 p-4 rounded-xl">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ARTICLE COVER THUMBNAIL URL</label>
                      <input
                        type="text"
                        value={postThumbnailUrl}
                        onChange={(e) => setPostThumbnailUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or click accelerator preset below"
                        className="w-full bg-zinc-905 border border-zinc-805 rounded px-4 py-2 text-zinc-100 text-xs outline-none transition focus:border-zinc-700 font-sans"
                        id="form-thumbnail-input"
                      />
                    </div>
                    
                    {/* Catalog suggestions */}
                    <div className="space-y-1.5 pt-1 text-left">
                      <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest block">QUICK CATALOG PRESENTS</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { title: 'Workspace Minimal', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80' },
                          { title: 'Core Server Hardware', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
                          { title: 'Workspace Community', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80' },
                          { title: 'Abstract Geometry Black', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' }
                        ].map((p) => (
                          <button
                            key={p.title}
                            type="button"
                            onClick={() => setPostThumbnailUrl(p.url)}
                            className={`p-1 px-2.5 border rounded text-[9px] font-mono transition cursor-pointer select-none ${
                              postThumbnailUrl === p.url
                                ? 'bg-zinc-900 border-zinc-700 text-white'
                                : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-stone-300'
                            }`}
                          >
                            + {p.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Lexical Composer Surface */}
                  <div className="space-y-1 pt-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-1.5">ARTICLE CORE CONTENT</label>
                    <LexicalEditor
                      initialContentJson={editorStateJson}
                      onChange={(jsonStr, text) => {
                        setEditorStateJson(jsonStr);
                        if (!postExcerpt && text) {
                          setPostExcerpt(text.substring(0, 150).replace(/\n/g, ' '));
                        }
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* 4. Timeless Editorial Footer */}
      <footer className="bg-zinc-950/40 border-t border-zinc-900 py-10 px-6 mt-12 select-none" id="arewa-journal-footer">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright Area with a secret click doorway */}
          <div className="text-center md:text-left space-y-1">
            <p 
              onClick={handleCopyrightClick}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-400 transition cursor-help tracking-wider"
              title="Click five times to resolve security session"
            >
              © 2026 AREWA TECH JOURNAL. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] font-sans text-zinc-650 tracking-normal leading-none uppercase">
              Credible Journalistic Records Covering Northern Nigeria's Technological Horizon.
            </p>
          </div>

          {/* Social Links Icons */}
          <div className="flex gap-4 items-center">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-600 hover:text-zinc-300 transition"
              title="Twitter/X Profile"
            >
              <span className="font-mono text-[10px] font-bold">TWITTER</span>
            </a>
            <span className="text-zinc-800 font-mono text-[10px]">•</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-600 hover:text-zinc-300 transition"
              title="Open Source Pipeline"
            >
              <span className="font-mono text-[10px] font-bold">GITHUB</span>
            </a>
            <span className="text-zinc-800 font-mono text-[10px]">•</span>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 text-zinc-600 hover:text-zinc-300 transition"
              title="LinkedIn network"
            >
              <span className="font-mono text-[10px] font-bold">LINKEDIN</span>
            </a>
          </div>
        </div>
      </footer>

      {/* 5. Feedback toasts */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
      />
    </div>
  );
}
