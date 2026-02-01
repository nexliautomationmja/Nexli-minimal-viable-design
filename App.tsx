
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import ClientComplaints from './components/ClientComplaints';
import ContactForm from './components/ContactForm';
import BookingSection from './components/BookingSection';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import FreeGuide from './components/FreeGuide';
import Services from './components/Services';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import NotFound from './components/NotFound';
import SocialDock from './components/SocialDock';
import Portfolio from './components/Portfolio';
import SummitTaxGroup from './components/portfolio/SummitTaxGroup';
import ClarityAdvisory from './components/portfolio/ClarityAdvisory';
import MeridianFinancial from './components/portfolio/MeridianFinancial';
import HarborWealth from './components/portfolio/HarborWealth';
import { getBlogPostBySlug } from './data/blogPosts';

const PORTFOLIO_FIRMS: Record<string, React.FC<{ navigate?: (view: string, slug?: string) => void }>> = {
  'summit-tax-group': SummitTaxGroup,
  'clarity-advisory': ClarityAdvisory,
  'meridian-financial': MeridianFinancial,
  'harbor-wealth': HarborWealth,
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved || 'dark'; // Defaulting to dark as requested
    }
    return 'dark';
  });

  const [view, setView] = useState<'home' | 'privacy' | 'terms' | 'guide' | 'services' | 'blog' | 'blogPost' | 'portfolio' | 'portfolioFirm' | '404'>('home');
  const [blogSlug, setBlogSlug] = useState<string | null>(null);
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);

  // Handle URL to State synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setView('home');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else if (path === '/free-guide') {
        setView('guide');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else if (path === '/services') {
        setView('services');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else if (path.startsWith('/portfolio/')) {
        const slug = path.replace('/portfolio/', '');
        if (PORTFOLIO_FIRMS[slug]) {
          setView('portfolioFirm');
          setPortfolioSlug(slug);
          setBlogSlug(null);
        } else {
          setView('404');
          setBlogSlug(null);
          setPortfolioSlug(null);
        }
      } else if (path === '/portfolio') {
        setView('portfolio');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        const post = getBlogPostBySlug(slug);
        if (post) {
          setView('blogPost');
          setBlogSlug(slug);
        } else {
          setView('404');
          setBlogSlug(null);
        }
        setPortfolioSlug(null);
      } else if (path === '/blog') {
        setView('blog');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else if (path === '/privacy') {
        setView('privacy');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else if (path === '/terms') {
        setView('terms');
        setBlogSlug(null);
        setPortfolioSlug(null);
      } else {
        setView('404');
        setBlogSlug(null);
        setPortfolioSlug(null);
      }
    };

    // Initial check
    handleLocationChange();

    // Listen for back/forward buttons
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Function to navigate and update URL
  const navigate = (newView: 'home' | 'privacy' | 'terms' | 'guide' | 'services' | 'blog' | 'blogPost' | 'portfolio' | 'portfolioFirm' | '404', slug?: string) => {
    let path: string;
    if (newView === 'blogPost' && slug) {
      path = `/blog/${slug}`;
    } else if (newView === 'portfolioFirm' && slug) {
      path = `/portfolio/${slug}`;
    } else {
      path = newView === 'guide' ? '/free-guide' :
        newView === 'services' ? '/services' :
          newView === 'portfolio' ? '/portfolio' :
            newView === 'blog' ? '/blog' :
              newView === 'privacy' ? '/privacy' :
                newView === 'terms' ? '/terms' : '/';
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setView(newView);
      setBlogSlug(slug || null);
      if (newView === 'portfolioFirm') {
        setPortfolioSlug(slug || null);
      } else {
        setPortfolioSlug(null);
      }
    }
  };

  const navigateToBlogPost = (slug: string) => {
    navigate('blogPost', slug);
  };

  const navigateToPortfolioFirm = (slug: string) => {
    navigate('portfolioFirm', slug);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
        {view === 'home' ? (
          <>
            <Hero />
            <ValueProposition />
            <ClientComplaints />
            <ContactForm />
            <BookingSection />
            <Navbar setView={navigate} currentView={view} />
          </>
        ) : view === 'privacy' ? (
          <PrivacyPolicy onBack={() => navigate('home')} />
        ) : view === 'services' ? (
          <>
            <Services />
            <Navbar setView={navigate} currentView={view} />
          </>
        ) : view === 'blog' ? (
          <>
            <Blog onNavigateToBlogPost={navigateToBlogPost} />
            <Navbar setView={navigate} currentView={view} />
          </>
        ) : view === 'blogPost' && blogSlug ? (
          <>
            <BlogPost
              slug={blogSlug}
              onBack={() => navigate('blog')}
              onNavigate={navigateToBlogPost}
            />
            <Navbar setView={navigate} currentView="blog" />
          </>
        ) : view === 'portfolio' ? (
          <>
            <Portfolio onNavigateToFirm={navigateToPortfolioFirm} />
            <Navbar setView={navigate} currentView={view} />
          </>
        ) : view === 'portfolioFirm' && portfolioSlug && PORTFOLIO_FIRMS[portfolioSlug] ? (
          <>
            {React.createElement(PORTFOLIO_FIRMS[portfolioSlug], { navigate })}
          </>
        ) : view === 'terms' ? (
          <TermsAndConditions onBack={() => navigate('home')} />
        ) : view === '404' ? (
          <>
            <NotFound
              onGoHome={() => navigate('home')}
              onGoBack={() => window.history.back()}
            />
            <Navbar setView={navigate} currentView="home" />
          </>
        ) : (
          <>
            <FreeGuide />
            <Navbar setView={navigate} currentView={view} />
          </>
        )}
        <footer className="py-20 border-t border-[var(--glass-border)] bg-[var(--footer-bg)] relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,var(--accent-glow)_0%,transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-3 no-underline group cursor-pointer bg-transparent border-none p-0"
              >
                {theme === 'dark' ? (
                  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                    <defs>
                      <linearGradient id="logo-grad-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB"></stop>
                        <stop offset="100%" stopColor="#06B6D4"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB"></path>
                    <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-footer)"></path>
                    <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4"></path>
                  </svg>
                ) : (
                  <img
                    src="/logos/icon-light.svg"
                    alt="Nexli"
                    className="w-10 h-10"
                  />
                )}
                <span className="text-3xl font-black tracking-tighter text-[var(--text-main)]" style={{ fontFamily: "'Syne', sans-serif" }}>NEXLI</span>
              </button>
              <SocialDock
                tiktokUrl="#"
                instagramUrl="#"
                xUrl="#"
              />
              <div className="flex gap-10 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                <button
                  onClick={() => navigate('privacy')}
                  className="hover:text-blue-500 transition-colors bg-transparent border-none p-0 uppercase tracking-[0.2em]"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate('terms')}
                  className="hover:text-blue-500 transition-colors bg-transparent border-none p-0 uppercase tracking-[0.2em]"
                >
                  Terms and Conditions
                </button>
                <div className="text-green-500/50 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  A2P COMPLIANT
                </div>
              </div>
              <div className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                © 2026 Nexli. High-End Automation for Elite Advisors.
              </div>
            </div>
          </div>
        </footer>
        <SpeedInsights />
        <Analytics />
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
