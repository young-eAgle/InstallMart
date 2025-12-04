import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Search,
  LogOut,
  Heart,
  ShoppingBag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { MegaMenu } from "./MegaMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
      {/* Top Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-xs md:text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground hidden md:inline">
                📞 Support: +92-XXX-XXXXXXX
              </span>
              <Separator
                orientation="vertical"
                className="h-4 hidden md:block"
              />
              <span className="text-muted-foreground hidden md:inline">
                ✉️ info@installmart.com
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/plans"
                className="hover:text-primary transition-colors"
              >
                Easy Installments
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Link
                to="/contact"
                className="hover:text-primary transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Mega Menu */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <ShoppingBag className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">
                InstallMart
              </span>
            </Link>

            {/* Mega Menu - Desktop Only */}
            <div className="hidden lg:block">
              <MegaMenu />
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, brands, or categories..."
                className={`pl-10 pr-4 bg-muted/50 border-2 transition-all ${
                  searchFocused ? "border-primary" : "border-transparent"
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Products Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/products")}
            >
              <Package className="h-4 w-4 mr-2" />
              Products
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "superadmin") && (
                    <>
                      <Separator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/auth")}
                title="Sign in"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/wishlist")}
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Cart Button */}
            <Button
              variant="default"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* User Section */}
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMenuOpen(false);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/orders");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Sign In / Register
              </Button>
            )}

            <Separator />

            {/* Navigation Links */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/products");
                  setIsMenuOpen(false);
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                All Products
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/plans");
                  setIsMenuOpen(false);
                }}
              >
                Installment Plans
              </Button>

              {user && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/wishlist");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>

                  {(user.role === "admin" || user.role === "superadmin") && (
                    <>
                      <Separator />
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-primary"
                        onClick={() => {
                          navigate("/admin");
                          setIsMenuOpen(false);
                        }}
                      >
                        Admin Panel
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            <Separator />

            {/* Cart & Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/cart");
                  setIsMenuOpen(false);
                }}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {totalItems > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {user && (
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   ShoppingCart,
//   Menu,
//   X,
//   User,
//   Search,
//   LogOut,
//   Heart,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useCart } from "@/contexts/CartContext";
// import { useAuth } from "@/contexts/AuthContext";
// import { useWishlist } from "@/contexts/WishlistContext";
// import { MegaMenu } from "./MegaMenu";

// interface NavbarProps {
//   onSearch?: (query: string) => void;
// }

// const Navbar = ({ onSearch }: NavbarProps) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const { totalItems } = useCart();
//   const { wishlistCount } = useWishlist();
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (onSearch) {
//       onSearch(searchQuery.trim());
//     }
//   };

//   return (
//     <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           {/*<Link to="/" className="flex items-center space-x-2">
//             <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
//               <ShoppingCart className="h-6 w-6 text-primary-foreground" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               InstallMart
//             </span>
//           </Link>*/}

//           <div className="flex items-center gap-4">
//             {/* Logo */}
//             <Link to="/" className="flex items-center space-x-2">
//               <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
//                 <ShoppingCart className="h-6 w-6 text-primary-foreground" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//                 InstallMart
//               </span>
//             </Link>

//             {/* Mega Menu - Desktop Only */}
//             <div className="hidden lg:block">
//               <MegaMenu />
//             </div>
//           </div>

//           {/* Search Bar - Desktop */}
//           <div className="hidden md:flex flex-1 max-w-md mx-8">
//             <form onSubmit={handleSearch} className="relative w-full">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search products..."
//                 className="pl-10 bg-muted/50"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </form>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-6">
//             <Link
//               to="/products"
//               className="text-sm font-medium hover:text-primary transition-smooth"
//             >
//               Products
//             </Link>
//             <Link
//               to="/plans"
//               className="text-sm font-medium hover:text-primary transition-smooth"
//             >
//               Installment Plans
//             </Link>
//             {user && (
//               <>
//                 <Link
//                   to="/dashboard"
//                   className="text-sm font-medium hover:text-primary transition-smooth"
//                 >
//                   Dashboard
//                 </Link>
//                 {(user.role === "admin" || user.role === "superadmin") && (
//                   <Link
//                     to="/admin"
//                     className="text-sm font-medium hover:text-primary transition-smooth"
//                   >
//                     Admin
//                   </Link>
//                 )}
//               </>
//             )}
//             {user ? (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={logout}
//                 title="Sign out"
//               >
//                 <LogOut className="h-5 w-5" />
//               </Button>
//             ) : (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => navigate("/auth")}
//                 title="Sign in"
//               >
//                 <User className="h-5 w-5" />
//               </Button>
//             )}

//             {/* Wishlist Button */}
//             <Button
//               variant="ghost"
//               size="icon"
//               className="relative"
//               onClick={() => navigate("/wishlist")}
//               title="Wishlist"
//             >
//               <Heart className="h-5 w-5" />
//               {wishlistCount > 0 && (
//                 <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white font-medium">
//                   {wishlistCount}
//                 </span>
//               )}
//             </Button>

//             {/* Cart Button */}
//             <Button
//               variant="default"
//               size="icon"
//               className="relative"
//               onClick={() => navigate("/cart")}
//             >
//               <ShoppingCart className="h-5 w-5" />
//               {totalItems > 0 && (
//                 <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center text-accent-foreground">
//                   {totalItems}
//                 </span>
//               )}
//             </Button>
//           </div>

//           {/* Mobile Menu Button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="md:hidden"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             {isMenuOpen ? (
//               <X className="h-6 w-6" />
//             ) : (
//               <Menu className="h-6 w-6" />
//             )}
//           </Button>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 space-y-4 animate-slide-up">
//             <form onSubmit={handleSearch} className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search products..."
//                 className="pl-10 bg-muted/50"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </form>
//             <div className="flex flex-col space-y-3">
//               <Link
//                 to="/products"
//                 className="text-sm font-medium hover:text-primary transition-smooth py-2"
//               >
//                 Products
//               </Link>
//               <Link
//                 to="/plans"
//                 className="text-sm font-medium hover:text-primary transition-smooth py-2"
//               >
//                 Installment Plans
//               </Link>
//               {user && (
//                 <>
//                   <Link
//                     to="/dashboard"
//                     className="text-sm font-medium hover:text-primary transition-smooth py-2"
//                   >
//                     Dashboard
//                   </Link>
//                   <Link
//                     to="/wishlist"
//                     className="text-sm font-medium hover:text-primary transition-smooth py-2"
//                   >
//                     Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
//                   </Link>
//                   {(user.role === "admin" || user.role === "superadmin") && (
//                     <Link
//                       to="/admin"
//                       className="text-sm font-medium hover:text-primary transition-smooth py-2"
//                     >
//                       Admin Portal
//                     </Link>
//                   )}
//                 </>
//               )}
//               <div className="flex space-x-2 pt-2">
//                 {user ? (
//                   <Button variant="outline" className="flex-1" onClick={logout}>
//                     <LogOut className="h-4 w-4 mr-2" />
//                     Sign Out
//                   </Button>
//                 ) : (
//                   <Button
//                     variant="outline"
//                     className="flex-1"
//                     onClick={() => navigate("/auth")}
//                   >
//                     <User className="h-4 w-4 mr-2" />
//                     Login
//                   </Button>
//                 )}
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => navigate("/wishlist")}
//                 >
//                   <Heart className="h-4 w-4 mr-2" />
//                   Wishlist ({wishlistCount})
//                 </Button>
//                 <Button
//                   variant="default"
//                   className="flex-1"
//                   onClick={() => navigate("/cart")}
//                 >
//                   <ShoppingCart className="h-4 w-4 mr-2" />
//                   Cart ({totalItems})
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
