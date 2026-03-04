"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  ChevronDown,
  User,
  LogOut,
  Heart,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const CITY_LIST = [
  "Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Surat",
  "Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Pimpri-Chinchwad","Patna","Vadodara",
  "Ghaziabad","Ludhiana","Agra","Nashik","Faridabad","Meerut","Rajkot","Kalyan-Dombivali","Vasai-Virar","Varanasi",
  "Srinagar","Aurangabad","Dhanbad","Amritsar","Allahabad","Ranchi","Howrah","Coimbatore","Jabalpur","Gwalior",
  "Vijayawada","Jodhpur","Madurai","Raipur","Kota","Guwahati","Chandigarh","Solapur","Hubli-Dharwad","Bareilly",
  "Moradabad","Mysore","Gurgaon","Aligarh","Jalandhar","Tiruchirappalli","Bhubaneswar","Salem","Warangal",
  "Mira-Bhayandar","Thiruvananthapuram","Bhiwandi","Saharanpur","Guntur","Amravati","Bikaner","Noida","Jamshedpur",
  "Bhilai","Cuttack","Firozabad","Kochi","Nellore","Bhavnagar","Dehradun","Durgapur","Asansol","Rourkela",
  "Nanded","Kolhapur","Ajmer","Akola","Gulbarga","Jamnagar","Ujjain","Loni","Siliguri","Jhansi","Ulhasnagar",
  "Jammu","Sangli-Miraj","Mangalore","Erode","Belgaum","Ambattur","Tirunelveli","Malegaon","Gaya","Jalgaon",
  "Udaipur","Maheshtala","Tirupur","Davanagere","Kozhikode","Kurnool","Rajpur Sonarpur","Bokaro","South Dumdum",
  "Bellary","Patiala","Gopalpur","Agartala","Bhagalpur","Muzaffarnagar","Bhatpara","Panihati","Latur","Dhule",
  "Rohtak","Korba","Bhilwara","Berhampur","Muzaffarpur","Ahmednagar","Mathura","Kollam","Avadi","Kadapa",
  "Kamarhati","Bilaspur","Shahjahanpur","Satara","Bijapur","Rampur","Shivamogga","Chandrapur","Junagadh",
  "Thrissur","Alwar","Bardhaman","Kulti","Kakinada","Nizamabad","Parbhani","Tumkur","Hisar","Ozhukarai",
  "Bihar Sharif","Panipat","Darbhanga","Bally","Aizawl","Dewas","Ichalkaranji","Karnal","Bathinda","Jalna",
  "Eluru","Barasat","Kirari Suleman Nagar","Purnia","Satna","Mau","Sonipat","Farrukhabad","Sagar","Durg",
  "Imphal","Ratlam","Hapur","Arrah","Karimnagar","Anantapur","Etawah","Ambernath","North Dumdum","Bharatpur",
  "Begusarai","New Delhi","Gandhidham","Baranagar","Tiruvottiyur","Puducherry","Sikar","Thoothukkudi","Rewa",
  "Mirzapur","Raichur","Pali","Ramagundam","Haridwar","Vijayanagaram","Katihar","Nagercoil","Sri Ganganagar",
  "Karawal Nagar","Mango","Thanjavur","Bulandshahr","Uluberia","Katni","Sambhal","Singrauli","Nadiad",
  "Secunderabad","Naihati","Yamunanagar","Bidhan Nagar","Pallavaram","Bidar","Munger","Panchkula","Burhanpur",
  "Raurkela Industrial Township","Kharagpur","Dindigul","Gandhinagar","Hospet","Nangloi Jat","Malda","Ongole",
  "Deoghar","Chapra","Haldia","Khandwa","Nandyal","Morena","Amroha","Anand","Bhind","Bhalswa Jahangir Pur",
  "Madhyamgram","Bhiwani","Berhampore","Ambala","Fatehpur","Raebareli","Khora","Chittoor","Bhusawal","Orai",
  "Bahraich","Phusro","Vellore","Mehsana","Raiganj","Sirsa","Danapur","Serampore","Sultan Pur Majra","Guna",
  "Jaunpur","Panvel","Shivpuri","Surendranagar Dudhrej","Unnao","Chinsurah","Alappuzha","Kottayam","Machilipatnam",
  "Shimla","Adoni","Udupi","Tenali","Proddatur","Saharsa","Hindupur","Sasaram","Buxar","Krishnanagar",
  "Fatehpur Sikri","Madhubani","Motihari","Rae Bareli","Baharampur","Baripada","Khammam","Bhimavaram","Mandsaur",
  "Chittaranjan","Nalgonda","Baran","Panaji","Silchar","Haldwani","Gangtok","Shillong","Kohima","Itanagar",
];

const POPULAR_CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Jaipur"];

// ---------------------------------------------------------------------------
// Inline search-history hook (localStorage-backed)
// ---------------------------------------------------------------------------
function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const reloadSearchHistory = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("search_history");
      setRecentSearches(stored ? JSON.parse(stored) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const addToSearchHistory = useCallback((term: string) => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("search_history");
      let history: string[] = stored ? JSON.parse(stored) : [];
      history = [term, ...history.filter((t) => t !== term)].slice(0, 10);
      localStorage.setItem("search_history", JSON.stringify(history));
      setRecentSearches(history);
    } catch {
      /* noop */
    }
  }, []);

  const clearSearchHistory = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem("search_history");
    setRecentSearches([]);
  }, []);

  const removeFromSearchHistory = useCallback((term: string) => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("search_history");
      let history: string[] = stored ? JSON.parse(stored) : [];
      history = history.filter((t) => t !== term);
      localStorage.setItem("search_history", JSON.stringify(history));
      setRecentSearches(history);
    } catch {
      /* noop */
    }
  }, []);

  return {
    recentSearches,
    addToSearchHistory,
    reloadSearchHistory,
    clearSearchHistory,
    removeFromSearchHistory,
  };
}

// ---------------------------------------------------------------------------
// Inline city-selector that replaces the old LocationDropdown
// ---------------------------------------------------------------------------
function LocationDropdownContent({
  onSelect,
  onClose,
}: {
  onSelect: (city: string) => void;
  onClose: () => void;
}) {
  const [citySearch, setCitySearch] = useState("");

  const filteredCities = citySearch
    ? CITY_LIST.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
    : POPULAR_CITIES;

  return (
    <div className="p-4 max-h-[400px] overflow-y-auto">
      <Input
        placeholder="Search cities..."
        value={citySearch}
        onChange={(e) => setCitySearch(e.target.value)}
        className="mb-3"
        autoFocus
      />
      <button
        onClick={() => {
          localStorage.removeItem("selected_address");
          localStorage.removeItem("selected_city");
          onSelect("");
          onClose();
          window.dispatchEvent(new Event("locationCleared"));
        }}
        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50 rounded-md mb-2"
      >
        Clear Location
      </button>
      {!citySearch && (
        <p className="text-xs text-muted-foreground px-3 mb-2">Popular Cities</p>
      )}
      <div className="space-y-1">
        {filteredCities.map((city) => (
          <button
            key={city}
            onClick={() => {
              const val = { address: city };
              localStorage.setItem("selected_address", JSON.stringify(val));
              localStorage.setItem("selected_city", city);
              onSelect(city);
              onClose();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
          >
            <MapPin className="h-3 w-3 text-gray-400" />
            {city}
          </button>
        ))}
        {filteredCities.length === 0 && (
          <p className="text-sm text-gray-400 px-3 py-2">No cities found</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

interface SearchResult {
  id: string;
  title: string;
  location?: string;
  category?: string;
  price?: number | string;
  imageUrl?: string[];
  images?: string[];
  image_url?: string | null;
}

interface GroupedResults {
  titleMatches: SearchResult[];
  locationMatches: SearchResult[];
  categoryMatches: SearchResult[];
}

function groupSearchResults(
  results: SearchResult[],
  query: string
): GroupedResults {
  const q = query.toLowerCase();
  const titleMatches: SearchResult[] = [];
  const locationMatches: SearchResult[] = [];
  const categoryMatches: SearchResult[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (r.title?.toLowerCase().includes(q)) {
      titleMatches.push(r);
      seen.add(r.id);
    }
  }
  for (const r of results) {
    if (!seen.has(r.id) && r.location?.toLowerCase().includes(q)) {
      locationMatches.push(r);
      seen.add(r.id);
    }
  }
  for (const r of results) {
    if (!seen.has(r.id) && r.category?.toLowerCase().includes(q)) {
      categoryMatches.push(r);
      seen.add(r.id);
    }
  }
  // Anything not yet categorized goes into title matches
  for (const r of results) {
    if (!seen.has(r.id)) {
      titleMatches.push(r);
    }
  }

  return { titleMatches, locationMatches, categoryMatches };
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
interface NavbarProps {
  isDarkPageProp?: boolean;
}

export default function Navbar({ isDarkPageProp = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [mobileLocationDialogOpen, setMobileLocationDialogOpen] = useState(false);
  const [wishlistMenuOpen, setWishlistMenuOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<
    { address?: string } | string | null
  >(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("selected_address");
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      }
    }
    return null;
  });

  const {
    recentSearches,
    addToSearchHistory,
    reloadSearchHistory,
    clearSearchHistory,
    removeFromSearchHistory,
  } = useSearchHistory();

  // Reload search history when overlay opens
  useEffect(() => {
    if (searchOpen) reloadSearchHistory();
  }, [searchOpen, reloadSearchHistory]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when search overlay is open
  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Search via API (debounced)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/experiences?search=${encodeURIComponent(searchQuery)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          const results: SearchResult[] = Array.isArray(data)
            ? data
            : Array.isArray(data.experiences)
              ? data.experiences
              : [];
          setSearchResults(results.slice(0, 8));
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      }
      setSelectedResultIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        document.body.style.overflow = "";
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // Re-read location when route changes
  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("selected_address") : null;
    let parsed: typeof selectedLocation = null;
    try {
      parsed = raw ? JSON.parse(raw) : raw;
    } catch {
      parsed = raw;
    }
    setSelectedLocation(parsed);
  }, [pathname]);

  // Listen for location cleared events
  useEffect(() => {
    const handleLocationCleared = () => setSelectedLocation(null);
    window.addEventListener("locationCleared", handleLocationCleared);
    return () => window.removeEventListener("locationCleared", handleLocationCleared);
  }, []);

  // ------- handlers -------

  const toggleMobileMenu = () => setMobileMenuOpen((o) => !o);

  const toggleSearch = () => {
    setSearchOpen((o) => {
      document.body.style.overflow = o ? "" : "hidden";
      return !o;
    });
  };

  const getFlatResults = useCallback((): SearchResult[] => {
    if (searchResults.length === 0) return [];
    const grouped = groupSearchResults(searchResults, searchQuery);
    return [...grouped.titleMatches, ...grouped.locationMatches, ...grouped.categoryMatches];
  }, [searchResults, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const flat = getFlatResults();
    if (selectedResultIndex >= 0 && selectedResultIndex < flat.length) {
      const selected = flat[selectedResultIndex];
      if (selected?.title) {
        addToSearchHistory(selected.title);
        setSearchOpen(false);
        router.push(`/experience/${selected.id}`);
        document.body.style.overflow = "";
        return;
      }
    }
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      router.push(`/experiences?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      document.body.style.overflow = "";
    }
  };

  const handleSearchResultClick = (id: string) => {
    const experience = searchResults.find((exp) => exp.id === id);
    if (experience?.title) addToSearchHistory(experience.title);
    setSearchOpen(false);
    router.push(`/experience/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const flat = getFlatResults();
    if (e.key === "Escape") {
      setSearchOpen(false);
      document.body.style.overflow = "";
      return;
    }
    if (!flat.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit(e as unknown as React.FormEvent);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedResultIndex((prev) =>
          prev < flat.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedResultIndex((prev) =>
          prev > 0 ? prev - 1 : flat.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedResultIndex >= 0 && selectedResultIndex < flat.length) {
          handleSearchResultClick(flat[selectedResultIndex].id);
        } else if (searchQuery.trim()) {
          handleSearchSubmit(e as unknown as React.FormEvent);
        }
        break;
    }
  };

  const handleSignIn = () => signInWithGoogle();

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (path: string) => {
    scrollToTop();
    setCompanyDropdownOpen(false);
    setSupportDropdownOpen(false);
    router.push(path);
    setSearchOpen(false);
    document.body.style.overflow = "";
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    addToSearchHistory(term);
    handleNavigation(`/experiences?search=${encodeURIComponent(term)}`);
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    addToSearchHistory(term);
    handleNavigation(`/experiences?search=${encodeURIComponent(term)}`);
  };

  const getLocationLabel = () => {
    if (selectedLocation) {
      if (typeof selectedLocation === "object" && selectedLocation.address) {
        return selectedLocation.address.split(",")[0];
      }
      if (typeof selectedLocation === "string") {
        return selectedLocation.split(",")[0];
      }
    }
    if (typeof window !== "undefined") {
      const city = localStorage.getItem("selected_city");
      if (city) return city;
    }
    return "Select Location";
  };

  const handleLocationSelect = (city: string) => {
    if (city) {
      setSelectedLocation({ address: city });
    } else {
      setSelectedLocation(null);
    }
    window.dispatchEvent(new Event("locationChanged"));
    if (pathname !== "/experiences") {
      router.push("/experiences");
    }
  };

  // ------- derived styles -------

  const isDarkPage = pathname === "/";

  const navbarBgClass = isDarkPage
    ? "bg-black/30 backdrop-blur-md"
    : "bg-white dark:bg-gray-900/90 backdrop-blur-md shadow-sm";

  const textClass = cn(
    "transition-colors",
    isDarkPage
      ? "text-white hover:text-gray-200"
      : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
  );

  const iconClass = cn(
    "transition-colors",
    isDarkPage
      ? "text-white hover:text-gray-200"
      : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
  );

  // ------- render -------

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-8 py-5",
          navbarBgClass
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 z-10" onClick={scrollToTop}>
            <img
              src="/assets/5c4b2b72-9668-4671-9be9-84c7371c459a.png"
              alt="Slash logo"
              className="h-8 w-8"
            />
            <span className={cn("font-medium text-xl", textClass)}>Slash</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 ml-4">
            <Link
              href="/experiences"
              className={cn("text-base font-medium whitespace-nowrap", textClass)}
            >
              All Experiences
            </Link>
            <Link
              href="/swipe"
              className={cn("text-base font-medium whitespace-nowrap", textClass)}
            >
              Swipe
            </Link>
            <Link
              href="/gift-personalizer"
              className={cn("text-base font-medium whitespace-nowrap", textClass)}
            >
              Gift Personalizer
            </Link>

            {/* Company Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "text-base font-medium flex items-center gap-1 whitespace-nowrap",
                    textClass
                  )}
                >
                  Company
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[280px] sm:w-[400px] p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DropdownMenuItem
                    onClick={() => router.push("/about-us")}
                    className="flex flex-col items-start p-3 rounded-md hover:bg-accent cursor-pointer gap-1"
                  >
                    <div className="text-base font-medium">About Us</div>
                    <p className="text-sm text-muted-foreground">
                      Learn more about our mission and team
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/testimonials")}
                    className="flex flex-col items-start p-3 rounded-md hover:bg-accent cursor-pointer gap-1"
                  >
                    <div className="text-base font-medium">Testimonials</div>
                    <p className="text-sm text-muted-foreground">
                      What our customers say about us
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/press")}
                    className="flex flex-col items-start p-3 rounded-md hover:bg-accent cursor-pointer gap-1"
                  >
                    <div className="text-base font-medium">Press</div>
                    <p className="text-sm text-muted-foreground">
                      Media coverage and press releases
                    </p>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Support Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "text-base font-medium flex items-center gap-1 whitespace-nowrap",
                    textClass
                  )}
                >
                  Support
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[280px] sm:w-[400px] p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DropdownMenuItem
                    onClick={() => router.push("/contact")}
                    className="flex flex-col items-start p-3 rounded-md hover:bg-accent cursor-pointer gap-1"
                  >
                    <div className="text-base font-medium">Contact Us</div>
                    <p className="text-sm text-muted-foreground">
                      Get in touch with our support team
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/faq")}
                    className="flex flex-col items-start p-3 rounded-md hover:bg-accent cursor-pointer gap-1"
                  >
                    <div className="text-base font-medium">FAQ</div>
                    <p className="text-sm text-muted-foreground">
                      Frequently asked questions
                    </p>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Location Selector (desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-base font-medium whitespace-nowrap",
                    textClass
                  )}
                  aria-label="Select location"
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span
                    className={cn(
                      "max-w-[120px] truncate text-base font-medium whitespace-nowrap",
                      isDarkPage ? "text-white" : "text-gray-900"
                    )}
                    style={{
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    {getLocationLabel()}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={0}
                className="w-auto min-w-[320px] max-w-[95vw] p-0 rounded-xl shadow-2xl border border-gray-200 bg-white overflow-x-hidden"
              >
                <LocationDropdownContent
                  onSelect={handleLocationSelect}
                  onClose={() => {
                    /* dropdown auto-closes */
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right-side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={toggleSearch}
              className={cn(
                "p-2 hover:bg-white/10 rounded-full transition-colors",
                iconClass
              )}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className={cn(
                "p-2 hover:bg-white/10 rounded-full transition-colors relative hidden md:flex",
                iconClass
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            {isAuthenticated ? (
              <DropdownMenu open={wishlistMenuOpen} onOpenChange={setWishlistMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("hidden md:inline-flex", iconClass)}
                    onClick={() => setWishlistMenuOpen((o) => !o)}
                  >
                    <span className="relative">
                      <Heart className="h-5 w-5" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <DropdownMenuItem onClick={() => router.push("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    Liked
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={cn("hidden md:inline-flex", iconClass)}
                onClick={() =>
                  toast({
                    title: "Please log in to view your liked list.",
                    variant: "destructive",
                  })
                }
              >
                <Heart className="h-5 w-5" />
              </Button>
            )}

            {/* User Avatar / Sign-in */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={iconClass}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image ?? undefined} />
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase() ??
                          user?.email?.charAt(0)?.toUpperCase() ??
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    Liked
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={iconClass}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <DropdownMenuItem onClick={handleSignIn}>
                    <User className="mr-2 h-4 w-4" />
                    Sign in with Google
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={toggleMobileMenu} aria-label="Open menu">
            <Menu className={iconClass} />
          </button>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile Menu Overlay                                                 */}
      {/* ------------------------------------------------------------------ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col md:hidden overflow-x-hidden">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[240px] h-full p-6 flex flex-col space-y-4 shadow-lg overflow-y-auto">
            <button
              className="self-end mb-4"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>

            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={toggleMobileMenu}
                className="text-base font-medium text-primary w-full mb-2"
              >
                Profile
              </Link>
            ) : (
              <button
                onClick={handleSignIn}
                className="text-base font-medium text-primary w-full mb-2 text-left"
              >
                Sign In
              </button>
            )}

            {/* Location selector (mobile) */}
            <div className="mb-4">
              <Dialog
                open={mobileLocationDialogOpen}
                onOpenChange={setMobileLocationDialogOpen}
              >
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-base font-medium whitespace-nowrap"
                    aria-label="Select location"
                  >
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span
                      className="max-w-[120px] truncate text-base font-normal whitespace-nowrap text-black"
                      style={{
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    >
                      {getLocationLabel()}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Location</DialogTitle>
                  </DialogHeader>
                  <LocationDropdownContent
                    onSelect={(city) => {
                      handleLocationSelect(city);
                      setMobileLocationDialogOpen(false);
                    }}
                    onClose={() => setMobileLocationDialogOpen(false)}
                  />
                  <DialogClose asChild>
                    <button className="mt-4 w-full py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">
                      Cancel
                    </button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>

            <Link
              href="/experiences"
              onClick={toggleMobileMenu}
              className="text-base font-medium text-gray-900 dark:text-gray-100 w-full"
            >
              All Experiences
            </Link>
            <Link
              href="/gift-personalizer"
              onClick={toggleMobileMenu}
              className="text-base font-medium text-gray-900 dark:text-gray-100 w-full"
            >
              Gift Personalizer
            </Link>
            <Link
              href="/swipe"
              onClick={toggleMobileMenu}
              className="text-base font-medium text-gray-900 dark:text-gray-100 w-full"
            >
              Swipe
            </Link>

            {isAuthenticated && (
              <Link
                href="/cart"
                onClick={toggleMobileMenu}
                className="text-base font-medium text-gray-900 dark:text-gray-100 w-full flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {itemCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && (
              <Link
                href="/wishlist"
                onClick={toggleMobileMenu}
                className="text-base font-medium text-gray-900 dark:text-gray-100 w-full flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Liked
                {wishlistCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Company Section */}
            <div>
              <button
                onClick={() => setCompanyDropdownOpen((o) => !o)}
                className="flex items-center justify-between w-full text-base font-medium text-gray-900 dark:text-gray-100"
              >
                Company
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    companyDropdownOpen && "rotate-180"
                  )}
                />
              </button>
              {companyDropdownOpen && (
                <div className="pl-4 flex flex-col space-y-2 mt-2">
                  <Link
                    href="/about-us"
                    onClick={toggleMobileMenu}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/testimonials"
                    onClick={toggleMobileMenu}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Testimonials
                  </Link>
                  <Link
                    href="/press"
                    onClick={toggleMobileMenu}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Press
                  </Link>
                </div>
              )}
            </div>

            {/* Support Section */}
            <div>
              <button
                onClick={() => setSupportDropdownOpen((o) => !o)}
                className="flex items-center justify-between w-full text-base font-medium text-gray-900 dark:text-gray-100"
              >
                Support
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    supportDropdownOpen && "rotate-180"
                  )}
                />
              </button>
              {supportDropdownOpen && (
                <div className="pl-4 flex flex-col space-y-2 mt-2">
                  <Link
                    href="/contact"
                    onClick={toggleMobileMenu}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/faq"
                    onClick={toggleMobileMenu}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    FAQ
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  handleSignOut();
                  toggleMobileMenu();
                }}
                className="text-base font-medium text-destructive text-left mt-4"
              >
                Sign Out
              </button>
            )}
          </div>
          {/* Tap outside to close */}
          <div className="flex-1" onClick={toggleMobileMenu} />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Search Overlay                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={searchRef}
        className={cn(
          "fixed inset-0 bg-white/80 backdrop-blur-sm transition-opacity z-50",
          searchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="container max-w-2xl mx-auto pt-28 px-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search for experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-12 w-full border border-input bg-white/90 backdrop-blur-sm px-3 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-4 py-6 text-lg rounded-xl"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={toggleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Popular Searches */}
          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {["Hot Air Balloon", "Dining", "Yacht", "Spa Day", "Adventure"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearchClick(term)}
                    className="px-3 py-1.5 bg-gray-100/80 backdrop-blur-sm rounded-full text-sm hover:bg-gray-200/80 cursor-pointer text-gray-700"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Recent Searches */}
          {searchOpen && !searchQuery && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Recent Searches</p>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-primary hover:underline px-2 py-1 rounded"
                  >
                    Clear Search History
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {recentSearches.length > 0 ? (
                  recentSearches.map((term, index) => (
                    <div key={index} className="flex items-center group">
                      <button
                        onClick={() => handleRecentSearchClick(term)}
                        className="flex-1 text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 backdrop-blur-sm text-gray-700 flex items-center transition-colors"
                      >
                        <Clock className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-sm">{term}</span>
                      </button>
                      <button
                        onClick={() => removeFromSearchHistory(term)}
                        className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        aria-label={`Remove ${term} from search history`}
                        tabIndex={0}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 px-4 py-3 text-sm">
                    No recent searches yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Results - Grouped */}
          {searchResults.length > 0 && (() => {
            const grouped = groupSearchResults(searchResults, searchQuery);
            const allFlat = [...grouped.titleMatches, ...grouped.locationMatches, ...grouped.categoryMatches];

            const renderResult = (experience: SearchResult, flatIndex: number) => {
              const thumb =
                experience.imageUrl?.[0] ?? experience.images?.[0] ?? (typeof experience.image_url === "string" ? experience.image_url : null);
              const priceVal = experience.price != null ? parseFloat(String(experience.price)) : null;
              return (
                <button
                  key={experience.id}
                  onClick={() => handleSearchResultClick(experience.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg hover:bg-gray-100/80 backdrop-blur-sm text-gray-700 flex items-center justify-between group transition-colors",
                    selectedResultIndex === flatIndex && "bg-gray-200/80"
                  )}
                  onMouseEnter={() => setSelectedResultIndex(flatIndex)}
                  onMouseLeave={() => setSelectedResultIndex(-1)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {thumb && (
                        <img
                          src={thumb}
                          alt={experience.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                        {experience.title}
                      </div>
                      {experience.location && (
                        <div className="text-sm text-gray-500 truncate">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {experience.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {priceVal != null && !isNaN(priceVal) && (
                    <div className="text-sm font-medium text-gray-900 flex-shrink-0">
                      ₹{priceVal.toLocaleString("en-IN")}
                    </div>
                  )}
                </button>
              );
            };

            let flatIdx = 0;

            return (
              <div className="mt-6 max-h-80 overflow-y-auto">
                {grouped.titleMatches.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1">Title Matches</p>
                    <div className="space-y-1">
                      {grouped.titleMatches.map((r) => {
                        const el = renderResult(r, flatIdx);
                        flatIdx++;
                        return el;
                      })}
                    </div>
                  </div>
                )}
                {grouped.locationMatches.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1">Location Matches</p>
                    <div className="space-y-1">
                      {grouped.locationMatches.map((r) => {
                        const el = renderResult(r, flatIdx);
                        flatIdx++;
                        return el;
                      })}
                    </div>
                  </div>
                )}
                {grouped.categoryMatches.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1">Category Matches</p>
                    <div className="space-y-1">
                      {grouped.categoryMatches.map((r) => {
                        const el = renderResult(r, flatIdx);
                        flatIdx++;
                        return el;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* No Results */}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">No results found</p>
              <div className="text-center py-6 text-gray-500">
                <p className="text-base">
                  No experiences match &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-sm mt-2">
                  Try different keywords or browse our popular experiences
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
