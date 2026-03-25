import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CATEGORY_COLORS, KITS, IvaCondition } from "@/data/products";
import { CartItem } from "@/data/products";
import { Minus, Plus, Trash2, ShoppingBag, ScanBarcode, Camera, PackagePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import BarcodeScanner from "./BarcodeScanner";
import AddExternalProductModal from "./AddExternalProductModal";

interface POSScreenProps {
  inventory: Product[];
  cart: CartItem[];
  searchQuery: string;
  ivaCondition: IvaCondition;
  onIvaConditionChange: (c: IvaCondition) => void;
  addToCart: (id: string, qty?: number) => void;
  addExternalProduct: (name: string, price: number, qty: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  cartSubtotal: number;
  cartIva: number;
  cartTotal: number;
  finalizeSale: () => any;
  clearCart: () => void;
}

function ProductButton({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const colors = CATEGORY_COLORS[product.category];
  const lowStock = product.stock <= product.minStock;

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onAdd}
      className={`neo-button p-3 flex flex-col items-center gap-1 border-2 ${colors.border} ${colors.bg} relative overflow-hidden`}
    >
      {lowStock && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive animate-pulse-alert" />
      )}
      <span className="text-2xl">{product.emoji}</span>
      <span className={`text-xs font-bold ${colors.text}`}>{product.name}</span>
      <span className="text-[10px] text-muted-foreground">${product.price}</span>
      <span className="text-[10px] text-muted-foreground">Stock: {product.stock}</span>
    </motion.button>
  );
}

export default function POSScreen({
  inventory, cart, searchQuery, ivaCondition, onIvaConditionChange,
  addToCart, addExternalProduct, removeFromCart,
  updateCartQty, cartSubtotal, cartIva, cartTotal, finalizeSale, clearCart,
}: POSScreenProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [showExternalModal, setShowExternalModal] = useState(false);

  const filtered = searchQuery
    ? inventory.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : inventory;

  const handleBarcodeScan = (barcode: string) => {
    const product = inventory.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product.id);
      setScanFeedback(`✅ ${product.emoji} ${product.name} agregado`);
      setTimeout(() => setScanFeedback(null), 2500);
    } else {
      setScanFeedback(`❌ Código ${barcode} no encontrado`);
      setTimeout(() => setScanFeedback(null), 3000);
    }
  };

  const handleFinalize = () => {
    finalizeSale();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      {/* Left: Products */}
      <div className="flex-1">
        {/* Quick actions */}
        <div className="flex gap-2 mb-4">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowScanner(!showScanner)}
            className={`neo-button flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 ${
              showScanner ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {showScanner ? (
              <><Camera className="w-4 h-4" /> CERRAR ESCÁNER</>
            ) : (
              <><ScanBarcode className="w-4 h-4" /> 📷 ESCANEAR</>
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowExternalModal(true)}
            className="neo-button py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 bg-muted text-foreground"
          >
            <PackagePlus className="w-4 h-4" /> EXTERNO
          </motion.button>
        </div>

        {/* Inline scanner */}
        <AnimatePresence>
          {showScanner && (
            <div className="mb-4">
              <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
            </div>
          )}
        </AnimatePresence>

        {/* Scan feedback */}
        <AnimatePresence>
          {scanFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="neo-card p-3 mb-3 text-center text-sm font-bold border-2 border-secondary"
            >
              {scanFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kits */}
        <div className="mb-4">
          <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">
            ⚡ Kits Rápidos
          </h2>
          <div className="flex gap-2 flex-wrap">
            {KITS.map((kit) => (
              <motion.button
                key={kit.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => kit.products.forEach((pid) => addToCart(pid))}
                className="neo-button px-4 py-3 border-2 border-primary bg-agro-blue-light flex items-center gap-2"
              >
                <span className="text-lg">{kit.emoji}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-primary">{kit.name}</div>
                  <div className="text-[10px] text-muted-foreground">{kit.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">
          🏷️ Catálogo Syngenta — Acceso Rápido
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filtered.map((product) => (
            <ProductButton
              key={product.id}
              product={product}
              onAdd={() => addToCart(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Right: Cart / Ticket */}
      <div className="lg:w-80 neo-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-foreground">🧾 Ticket de Venta</h2>
        </div>

        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Escanea o toca un producto para empezar
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-60 lg:max-h-96">
            <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground uppercase font-bold">
              <span className="flex-1">Producto</span>
              <span className="w-14 text-center">Cant.</span>
              <span className="w-14 text-right">P/U</span>
              <span className="w-16 text-right">Subtotal</span>
              <span className="w-8" />
            </div>
            {cart.map((item) => (
              <div key={item.product.id} className="neo-inset p-2 flex items-center gap-2">
                <span className="text-lg">{item.product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {item.product.name}
                    {item.product.isExternal && (
                      <span className="ml-1 text-[9px] text-muted-foreground">(ext)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground w-14 text-right">
                  ${item.product.price}
                </span>
                <span className="text-xs font-bold text-foreground w-16 text-right">
                  ${(item.product.price * item.quantity).toFixed(0)}
                </span>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* IVA Toggle Switch */}
        <div className="border-t border-border pt-3 mb-2">
          <div className="flex items-center justify-between neo-inset p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Cobrar IVA 16%</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                ivaCondition === "aplica"
                  ? "bg-secondary/20 text-secondary"
                  : "bg-destructive/20 text-destructive"
              }`}>
                {ivaCondition === "aplica" ? "🟢 Activo" : "🔴 Exento"}
              </span>
            </div>
            <Switch
              checked={ivaCondition === "aplica"}
              onCheckedChange={(checked) => onIvaConditionChange(checked ? "aplica" : "exento")}
            />
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span>${cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>IVA (16%)</span>
            <span>{ivaCondition === "exento" ? "Exento" : `$${cartIva.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground neo-inset p-2 mt-1">
            <span>TOTAL</span>
            <span className="text-primary">${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={clearCart} className="neo-button px-3 py-2 text-xs text-muted-foreground flex-1">
            🗑️ Limpiar
          </button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleFinalize}
            disabled={cart.length === 0}
            className="neo-button flex-[2] py-4 bg-secondary text-secondary-foreground font-bold text-base disabled:opacity-40"
          >
            ✅ FINALIZAR VENTA
          </motion.button>
        </div>
      </div>

      {/* External Product Modal */}
      <AddExternalProductModal
        open={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        onAdd={addExternalProduct}
      />
    </div>
  );
}
