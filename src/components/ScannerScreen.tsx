import { useState } from "react";
import { Product, CATEGORY_COLORS } from "@/data/products";
import { Camera, Package, ScanBarcode, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BarcodeScanner from "./BarcodeScanner";

interface ScannerScreenProps {
  inventory: Product[];
  addToCart: (id: string) => void;
}

export default function ScannerScreen({ inventory, addToCart }: ScannerScreenProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ product: Product | null; barcode: string } | null>(null);

  const handleScan = (barcode: string) => {
    const found = inventory.find((p) => p.barcode === barcode);
    setScanResult({ product: found, barcode });
  };

  const handleAddScanned = () => {
    if (scanResult?.product) {
      addToCart(scanResult.product.id);
      setScanResult(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Scan action */}
      {!showScanner && (
        <div className="neo-card p-6 text-center">
          <ScanBarcode className="w-12 h-12 mx-auto text-primary mb-3" />
          <h2 className="font-display font-bold text-foreground mb-1">Escáner / Alta de Productos</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Escanea códigos de barras para agregar productos al ticket o dar de alta nuevos.
          </p>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowScanner(true)}
            className="neo-button px-6 py-3 bg-primary text-primary-foreground font-bold text-sm mx-auto flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            📷 ABRIR ESCÁNER
          </motion.button>
        </div>
      )}

      {/* Barcode scanner */}
      <AnimatePresence>
        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => { setShowScanner(false); setScanResult(null); }}
          />
        )}
      </AnimatePresence>

      {/* Scan result */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`neo-card p-4 border-2 ${scanResult.product ? "border-secondary" : "border-destructive/40"}`}
          >
            {scanResult.product ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{scanResult.product.emoji}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-foreground">{scanResult.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {scanResult.product.category} • ${scanResult.product.price} • Stock: {scanResult.product.stock}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Código: {scanResult.barcode}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleAddScanned}
                  className="neo-button p-3 bg-secondary text-secondary-foreground"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm font-bold text-destructive">❌ Producto no encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Código: <span className="font-mono">{scanResult.barcode}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Registra este código en la columna "Barcode" del inventario para habilitarlo.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory list */}
      <div className="neo-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-foreground">📦 Inventario Actual</h2>
        </div>
        <div className="space-y-2">
          {inventory.map((p) => {
            const colors = CATEGORY_COLORS[p.category];
            const pct = (p.stock / (p.minStock * 5)) * 100;
            const isLow = p.stock <= p.minStock;
            return (
              <div key={p.id} className="neo-inset p-2 flex items-center gap-3">
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">{p.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">{p.barcode}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? "bg-destructive" : "bg-secondary"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isLow ? "text-destructive" : "text-foreground"}`}>
                    {p.stock}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{p.unit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
