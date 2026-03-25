import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PackagePlus } from "lucide-react";

interface AddExternalProductModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number, qty: number) => void;
}

export default function AddExternalProductModal({ open, onClose, onAdd }: AddExternalProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");

  const handleSubmit = () => {
    const p = parseFloat(price);
    const q = parseInt(qty);
    if (!name.trim() || isNaN(p) || p <= 0 || isNaN(q) || q <= 0) return;
    onAdd(name.trim(), p, q);
    setName("");
    setPrice("");
    setQty("1");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="neo-card p-6 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">Producto Externo</h3>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Fertilizante especial"
                  className="w-full mt-1 neo-inset p-3 text-sm text-foreground bg-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Precio ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full mt-1 neo-inset p-3 text-sm text-foreground bg-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Cantidad</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full mt-1 neo-inset p-3 text-sm text-foreground bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="neo-button w-full py-3 bg-primary text-primary-foreground font-bold text-sm"
            >
              📦 AGREGAR AL TICKET
            </motion.button>
            <p className="text-[10px] text-muted-foreground text-center">
              Este producto no afectará el inventario
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
