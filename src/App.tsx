import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Moon, Sun, ShoppingBag, Filter, Sparkles, Heart, 
  ShieldCheck, FileText, Truck, ArrowRight, Layers, MessageCircle,
  User as UserIcon, LogIn, Globe, Settings as SettingsIcon
} from 'lucide-react';
import { LineLogo } from './components/LineLogo';
import { StoriesBar } from './components/StoriesBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CategoriesView } from './components/CategoriesView';
import { ClientChatView } from './components/ClientChatView';
import { WhatsAppFloatingBar, WhatsAppTab } from './components/WhatsAppFloatingBar';
import { LegalTermsModal } from './components/LegalTermsModal';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { auth, onAuthStateChanged, signOut } from './firebase';
import { TRANSLATIONS, Language } from './translations';
import { 
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, 
  INITIAL_STORIES, DEFAULT_SELLER_CONTACT 
} from './data/mockData';
import { Product, ProductVariant, CartItem, StoryDrop, SellerContact } from './types';
import { syncService } from './utils/syncService';
import { authService, AppUser } from './services/authService';
import { userFavoritesService } from './services/userFavoritesService';
import { getCurrencyMode, setCurrencyMode, CurrencyMode } from './utils/currencyUtils';

export default function App() {
  // Mobile Splash Screen state
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Authentication & Guest Mode state
  const [user, setUser] = useState<AppUser | null>(() => authService.getCurrentSession());
  const [isGuest, setIsGuest] = useState<boolean>(() => !authService.getCurrentSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<'order' | 'chat' | 'general' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Language state (French default, English supported)
  const [language, setLanguage] = useState<Language>('fr');
  const t = TRANSLATIONS[language];

  // Currency display mode state ($ USD / FC Franc Congolais / Both)
  const [currencyMode, setCurrencyModeState] = useState<CurrencyMode>(() => getCurrencyMode());

  const handleToggleCurrency = () => {
    const next: CurrencyMode = currencyMode === 'BOTH' ? 'CDF' : currencyMode === 'CDF' ? 'USD' : 'BOTH';
    setCurrencyMode(next);
    setCurrencyModeState(next);
  };

  useEffect(() => {
    const handleCurrencyChanged = () => {
      setCurrencyModeState(getCurrencyMode());
    };
    window.addEventListener('currency_changed', handleCurrencyChanged);
    return () => window.removeEventListener('currency_changed', handleCurrencyChanged);
  }, []);

  // Helper to extract clean personalized slug from URL pathname, search query or hash
  const extractUrlSlug = (): string | null => {
    if (typeof window === 'undefined') return null;
    // Check search query (?user=percy or ?u=percy)
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('user') || params.get('u');
    if (querySlug) return querySlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Check pathname (/percy or /u/percy)
    const cleanPath = window.location.pathname.replace(/^\/+/, '').split('/')[0].trim().toLowerCase();
    const systemPaths = ['index.html', 'api', 'assets', 'favicon.ico', 'manifest.json', 'robots.txt', 'sw.js'];
    if (cleanPath && !systemPaths.includes(cleanPath)) {
      return cleanPath.replace(/[^a-z0-9_-]/g, '');
    }

    // Check hash (#/percy)
    if (window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#\/?/, '').split('/')[0].trim().toLowerCase();
      if (cleanHash && !systemPaths.includes(cleanHash)) {
        return cleanHash.replace(/[^a-z0-9_-]/g, '');
      }
    }

    return null;
  };

  // Personalized URL slug detection on mount
  useEffect(() => {
    const slug = extractUrlSlug();
    if (slug) {
      localStorage.setItem('line_active_slug', slug);
      const savedName = localStorage.getItem('line_guest_name');
      if (!savedName || savedName === 'Client Visiteur' || savedName === 'Client') {
        const formatted = slug.charAt(0).toUpperCase() + slug.slice(1);
        localStorage.setItem('line_guest_name', formatted);
      }
    }
  }, []);

  // Listen to Firebase auth changes & update dynamic browser URL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const appUser: AppUser = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Client',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || undefined,
          provider: 'password',
        };
        setUser(appUser);
        setIsGuest(false);
        authService.saveSession(appUser);

        // Dynamically update URL to personalized slug: /percy
        const rawName = appUser.displayName || appUser.email?.split('@')[0] || 'client';
        const slug = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
        if (slug && typeof window !== 'undefined') {
          localStorage.setItem('line_user_slug', slug);
          localStorage.setItem('line_active_slug', slug);
          const targetPath = `/${slug}`;
          if (window.location.pathname !== targetPath && (window.location.pathname === '/' || window.location.pathname === '')) {
            window.history.pushState(null, '', targetPath);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Theme state with robust localStorage & DOM synchronization
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('line_theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark') || false;
    }
    return false;
  });

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    const themeStr = nextMode ? 'dark' : 'light';
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('line_theme', themeStr);

    if (user?.uid) {
      authService.saveUserTheme(user.uid, themeStr);
    }
  };

  // Restore user saved theme upon login
  useEffect(() => {
    if (user?.uid) {
      authService.getUserTheme(user.uid).then((savedTheme) => {
        if (savedTheme) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          localStorage.setItem('line_theme', savedTheme);
        }
      });
    }
  }, [user?.uid]);

  // WhatsApp Tab State
  const [currentTab, setCurrentTab] = useState<WhatsAppTab>('drops');
  const [products, setProducts] = useState<Product[]>(() => syncService.getProducts());
  const [categories] = useState(INITIAL_CATEGORIES);
  const [stories] = useState<StoryDrop[]>(INITIAL_STORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Favorites
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => userFavoritesService.getLocalFavorites());

  // Automatically restore and sync favorites across devices when user logs in
  useEffect(() => {
    if (user) {
      const userKey = user.uid || user.email || '';
      userFavoritesService.loadUserFavorites(userKey).then((cloudFavs) => {
        if (cloudFavs && cloudFavs.length > 0) {
          setFavoriteIds((prev) => {
            const merged = Array.from(new Set([...cloudFavs, ...prev]));
            userFavoritesService.saveUserFavorites(userKey, merged);
            return merged;
          });
        } else {
          userFavoritesService.saveUserFavorites(userKey, favoriteIds);
        }
      });
    }
  }, [user]);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeStory, setActiveStory] = useState<StoryDrop | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  // Seller Contact (synced in real-time with Admin)
  const [sellerContact, setSellerContact] = useState<SellerContact>(() => syncService.getSellerContact());

  // Real-time synchronization with Admin
  useEffect(() => {
    const unsubContact = syncService.subscribeToSellerContact((c) => {
      setSellerContact(c);
    });
    const unsubProducts = syncService.subscribeToProducts((p) => {
      setProducts(p);
    });
    return () => {
      unsubContact();
      unsubProducts();
    };
  }, []);

  // Filtered Products for Drops & Favorites
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (currentTab === 'favorites') {
        if (!favoriteIds.includes(p.id)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q) || false;
        const matchesTag = p.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesName && !matchesDesc && !matchesTag) return false;
      }

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'cat-new') return p.isNewDrop;
      return p.categoryId === selectedCategory;
    });
  }, [products, currentTab, favoriteIds, searchQuery, selectedCategory]);

  // Cart operations
  const handleAddToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product,
          variant,
          quantity,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      userFavoritesService.saveLocalFavorites(updated);
      if (user) {
        const userKey = user.uid || user.email || '';
        userFavoritesService.saveUserFavorites(userKey, updated);
      }
      return updated;
    });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const handleDirectOrder = (product: Product, variant: ProductVariant, quantity: number) => {
    handleAddToCart(product, variant, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-[#25D366] selection:text-black">
      {/* Mobile Startup Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-30 bg-[#F8F9FB]/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => {
              setCurrentTab('drops');
              setSelectedCategory('all');
            }}
          >
            <LineLogo size="md" showSubtitle={true} />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Currency Toggle ($ / FC) */}
            <button
              onClick={handleToggleCurrency}
              className="px-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-black text-[#25D366] hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer select-none"
              title="Devise d'affichage des prix : Cliquez pour basculer ($ USD / FC Franc Congolais / Les deux)"
            >
              <span>{currencyMode === 'BOTH' ? '$ • FC' : currencyMode === 'CDF' ? 'FC (Francs)' : '$ (USD)'}</span>
            </button>

            {/* Settings (Engrenage) Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              aria-label="Paramètres de l'application"
              title="Paramètres (Thème, Langue, Sécurité, Confidentialité)"
            >
              <SettingsIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-xs overflow-hidden"
              aria-label="Mon Profil"
              title={user ? (user.displayName || user.email || 'Profil') : 'Profil & Connexion'}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
              {user && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] ring-2 ring-white dark:ring-[#0B0F17]" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label={t.viewCart}
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#25D366] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B0F17]">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Strictly Client Experience */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-24 space-y-5">
        {/* Notice of Cash on Delivery */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>{t.codNotice}</span>
          </div>
          <button
            onClick={() => setIsTermsOpen(true)}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80"
          >
            {t.termsBtn}
          </button>
        </div>

        {/* VIEW 1: DROPS (Flux continu nouveautés) & VIEW 3: FAVORIS */}
        {(currentTab === 'drops' || currentTab === 'favorites') && (
          <>
            {/* Search Bar */}
            <div className="relative pt-1 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/80 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white placeholder:text-slate-400 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {t.clear}
                  </button>
                )}
              </div>
            </div>

            {/* Stories Bar (Exclusive to Drops view) */}
            {currentTab === 'drops' && (
              <StoriesBar
                stories={stories}
                onSelectStory={(s) => setActiveStory(s)}
              />
            )}

            {/* Category Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Subheader info & active count */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentTab === 'favorites' ? t.favoritesTitle : t.collectionTitle}
                </span>
                <span className="text-xs text-slate-400">({filteredProducts.length} {t.articlesCount})</span>
              </div>

              <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_6px_#25D366]" />
                <span>{t.readyExpress}</span>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-[#121824] rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.noArticles}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {t.noArticlesSub}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold"
                >
                  {t.showAll}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteIds.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onQuickAdd={handleQuickAdd}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: RAYONS */}
        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            products={products}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setCurrentTab('drops');
            }}
          />
        )}

        {/* VIEW 4: DIRECT CHAT */}
        {currentTab === 'chats' && (
          <ClientChatView
            sellerContact={sellerContact}
            onBackToStore={() => setCurrentTab('drops')}
            user={user}
            onRequireAuth={(reason) => {
              setAuthReason(reason);
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating WhatsApp Bottom Bar */}
      <WhatsAppFloatingBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'cart') {
            setIsCartOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        cartCount={totalCartCount}
        unreadChatCount={1}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isFavorite={selectedProduct ? favoriteIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onDirectOrder={handleDirectOrder}
      />

      {/* Cart & Direct Social Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        sellerContact={sellerContact}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        user={user}
        onRequireAuth={(reason) => {
          setAuthReason(reason);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Story Viewer Modal */}
      <StoryViewerModal
        story={activeStory}
        onClose={() => setActiveStory(null)}
        onShopCollection={() => {
          setSelectedCategory('all');
          setCurrentTab('drops');
        }}
      />

      {/* Legal Terms & Cash on Delivery Modal */}
      <LegalTermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Auth Modal (Google & Email / Password & Visitor) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setIsGuest(false);
          setIsAuthModalOpen(false);
        }}
        onContinueAsGuest={() => {
          setIsGuest(true);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Profile Modal (Identity, Contact & Wishlist) */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        isGuest={isGuest}
        favoritesCount={favoriteIds.length}
        onOpenFavorites={() => setCurrentTab('favorites')}
        onLoginRequest={() => {
          setAuthReason('general');
          setIsAuthModalOpen(true);
        }}
        onLogout={async () => {
          await authService.logout();
          setUser(null);
          setIsGuest(true);
        }}
      />

      {/* Settings Modal (Theme, Language, Account Security, Privacy) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        language={language}
        onSelectLanguage={setLanguage}
        user={user}
        onUserUpdated={(updatedUser) => setUser(updatedUser)}
        onOpenLegalTerms={() => setIsTermsOpen(true)}
      />
    </div>
  );
}
