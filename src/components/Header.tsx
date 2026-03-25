import { motion } from "framer-motion";
import { Search, ScanBarcode, ShoppingCart, Package, BarChart3, MapPin, Users, Truck, Settings, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const TABS = [
  { id: "pos", label: "Caja", icon: ShoppingCart, emoji: "💰" },
  { id: "scanner", label: "Escáner", icon: ScanBarcode, emoji: "📸" },
  { id: "inventory", label: "Inventario", icon: Package, emoji: "📦" },
  { id: "clients", label: "Clientes", icon: Users, emoji: "👥" },
  { id: "suppliers", label: "Proveedores", icon: Truck, emoji: "🚛" },
  { id: "analysis", label: "Análisis", icon: BarChart3, emoji: "📊" },
  { id: "settings", label: "Ajustes", icon: Settings, emoji: "⚙️" },
];

export default function Header({ activeTab, onTabChange, cartCount, searchQuery, onSearchChange }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 neo-card rounded-none border-b border-border px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            El Inge <span className="text-primary">POS</span> <span className="text-secondary">AI</span>
            <span className="text-[10px] text-muted-foreground ml-1 font-normal">v2.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold"
            >
              {cartCount}
            </motion.span>
          )}

          {/* User info & logout */}
          {user && (
            <div className="flex items-center gap-2 ml-2">
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <UserCircle className="w-4 h-4" />
                <span className="font-medium text-foreground">{user.fullName || user.username}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                  {user.role === "admin" ? "ADMIN" : "USER"}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="neo-button w-8 h-8 flex items-center justify-center text-destructive hover:bg-destructive/10"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <div className="neo-inset flex items-center gap-2 px-3 py-2 mb-3">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Buscar producto por nombre..."
          value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <nav className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`neo-button flex-shrink-0 flex flex-col items-center gap-0.5 py-2 px-2 text-xs font-medium transition-all min-w-[3rem] ${
              activeTab === tab.id
                ? "!bg-primary !text-primary-foreground !shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)]"
                : "text-muted-foreground"
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            <span className="hidden sm:inline text-[10px]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
