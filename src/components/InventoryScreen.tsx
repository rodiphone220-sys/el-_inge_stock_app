import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CATEGORY_COLORS, ProductCategory } from "@/data/products";
import { Plus, Trash2, Edit2, Package, X, Save, AlertTriangle, Camera, ScanLine, Barcode, Sparkles, Upload, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductImageScanner from "@/components/ProductImageScanner";
import { generateEAN13FromName, validateEAN13 } from "@/lib/barcodeGenerator";
import { uploadProductImage } from "@/lib/googleApi";

interface InventoryScreenProps {
  inventory: Product[];
  onAdd: (p: Omit<Product, "id">) => void;
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: "insecticida", label: "🔵 Insecticida" },
  { value: "herbicida", label: "🟡 Herbicida" },
  { value: "fertilizante", label: "🟢 Fertilizante" },
  { value: "fungicida", label: "🔵 Fungicida" },
  { value: "adherente", label: "🔵 Adherente" },
  { value: "bioestimulante", label: "🟢 Bioestimulante" },
];

const emptyProduct = {
  name: "", category: "insecticida" as ProductCategory, price: 0, stock: 0,
  unit: "Lt", minStock: 3, emoji: "📦", barcode: "",
};

export default function InventoryScreen({ inventory, onAdd, onUpdate, onDelete }: InventoryScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showScanner, setShowScanner] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [ocrImageData, setOcrImageData] = useState<string | null>(null); // Imagen del OCR
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const filtered = inventory.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.toString().includes(search));
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat && !p.isExternal;
  });

  // Generar código de barras automáticamente cuando cambia el nombre (solo si está vacío)
  useEffect(() => {
    if (form.name.trim() && !form.barcode && !editing) {
      const newBarcode = generateEAN13FromName(form.name);
      setForm((p) => ({ ...p, barcode: newBarcode }));
    }
  }, [form.name]);

  // Convertir texto a mayúsculas sin acentos
  const toUpperCaseNoAccents = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("⚠️ El nombre del producto es requerido");
      return;
    }

    // Validar que no exista otro producto con el mismo nombre (excepto al editar el mismo)
    const duplicateProduct = inventory.find(
      p => p.name.toUpperCase() === form.name.toUpperCase().trim() && p.id !== editing?.id
    );

    if (duplicateProduct) {
      alert(`⚠️ Ya existe un producto llamado "${duplicateProduct.name}".\nPor favor usa un nombre diferente o edita el existente.`);
      return;
    }

    let imageUrl: string | undefined = undefined;

    // Si hay imagen del OCR, intentar subirla a Drive
    if (ocrImageData && !ocrImageData.includes('drive.google.com')) {
      setIsUploading(true);
      try {
        const productId = editing?.id || `prod-${Date.now()}`;
        const fileName = `product_${productId}.jpg`;

        // Limpiar el base64 (quitar el prefijo data:image/jpeg;base64,)
        const cleanBase64 = ocrImageData.includes(',')
          ? ocrImageData.split(',')[1]
          : ocrImageData;

        console.log("📤 Subiendo imagen a Drive...", {
          productId,
          fileName,
          base64Length: cleanBase64.length
        });

        const response = await uploadProductImage({
          productId,
          productName: form.name,
          base64Data: cleanBase64,
          fileName,
        });

        if (response.success && response.data) {
          imageUrl = response.data.downloadUrl;
          console.log("✅ Imagen subida exitosamente:", imageUrl);
        } else {
          console.warn("⚠️ No se pudo subir la imagen, pero el producto se guardará sin imagen.");
        }
      } catch (error) {
        console.error("❌ Error subiendo imagen:", error);
        console.log("⚠️ El producto se guardará sin imagen.");
      } finally {
        setIsUploading(false);
      }
    } else if (ocrImageData && ocrImageData.includes('drive.google.com')) {
      // Si ya es una URL de Drive (edición), mantenerla
      imageUrl = ocrImageData;
    }

    // Convertir todos los campos a mayúsculas sin acentos antes de guardar
    const formData = {
      ...form,
      name: toUpperCaseNoAccents(form.name),
      emoji: "📦", // Emoji por defecto (ya no se usa pero se mantiene por compatibilidad)
      imageUrl: imageUrl || undefined,
    };

    console.log("💾 Guardando producto:", formData);

    if (editing) {
      onUpdate({ ...editing, ...formData });
      setEditing(null);
    } else {
      onAdd(formData);
    }

    // Limpiar formulario
    setForm(emptyProduct);
    setProductImage(null);
    setOcrImageData(null);
    setShowForm(false);
  };

  // Manejar datos del escáner OCR
  const handleScanComplete = (data: { name?: string; price?: number; barcode?: string; description?: string; imageBase64?: string }) => {
    // Auto-rellenar formulario con datos escaneados
    setForm({
      ...emptyProduct,
      name: data.name || "",
      price: data.price || 0,
      barcode: data.barcode || "",
    });

    // Guardar imagen del OCR para usarla como imagen del producto
    if (data.imageBase64) {
      setOcrImageData(data.imageBase64);
      setProductImage(data.imageBase64); // Mostrar vista previa
    }

    // Abrir formulario automáticamente
    setShowForm(true);

    // Cerrar escáner
    setShowScanner(false);
  };

  // Manejar selección de imagen de producto
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    setIsUploading(true);

    try {
      // Convertir a base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        // Guardar como imagen del OCR para que se suba al guardar
        setOcrImageData(base64Data);
        setProductImage(base64Data); // Mostrar vista previa

        alert("✅ Imagen seleccionada. Se subirá automáticamente al guardar el producto.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading image:", error);
      alert("Error al cargar imagen");
      setIsUploading(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, unit: p.unit, minStock: p.minStock, emoji: p.emoji, barcode: p.barcode });
    // Si el producto tiene imagen, mostrarla
    if (p.imageUrl) {
      setProductImage(p.imageUrl);
      setOcrImageData(p.imageUrl); // Marcar como imagen existente
    }
    setShowForm(true);
  };

  const handleDelete = (p: Product) => {
    const confirmed = confirm(`⚠️ ¿Estás seguro de eliminar "${p.name}"?\n\nEsta acción no se puede deshacer.\n\nStock actual: ${p.stock}\nPrecio: $${p.price}`);
    if (confirmed) {
      onDelete(p.id);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="font-display font-bold text-xl text-foreground">📦 Inventario</h2>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowScanner(true)}
            className="neo-button px-4 py-2 bg-secondary text-secondary-foreground font-bold text-sm flex items-center gap-1"
          >
            <ScanLine className="w-4 h-4" /> OCR
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyProduct); }}
            className="neo-button px-4 py-2 bg-primary text-primary-foreground font-bold text-sm flex items-center gap-1"
          >
            {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo</>}
          </motion.button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="neo-inset flex-1 px-3 py-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto o código..." className="border-none bg-transparent" />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="neo-button px-3 py-2 text-xs font-bold bg-card text-foreground"
        >
          <option value="all">Todos</option>
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="neo-card p-4 mb-4 space-y-3 border-2 border-secondary"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground uppercase flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-secondary" />
                ✏️ EDITANDO: {editing?.name}
              </h3>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm(emptyProduct);
                  setProductImage(null);
                  setOcrImageData(null);
                  setShowForm(false);
                }}
                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Vista previa de imagen */}
            {productImage && (
              <div className="neo-inset p-3 rounded-lg flex items-center gap-3">
                <img
                  src={productImage}
                  alt="Producto"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">IMAGEN DEL PRODUCTO</p>
                  <p className="text-[10px] text-muted-foreground">✅ Imagen cargada exitosamente</p>
                </div>
              </div>
            )}

            {/* Input para subir imagen (opcional, si no se usó OCR) */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading || !!ocrImageData}
                className="neo-button flex-1 py-3 bg-muted text-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {ocrImageData ? "✅ IMAGEN DEL OCR USADA" : "📷 SUBIR IMAGEN (OPCIONAL)"}
              </button>
              {productImage && !ocrImageData && (
                <button
                  type="button"
                  onClick={() => setProductImage(null)}
                  className="neo-button px-4 py-3 bg-destructive/10 text-destructive font-bold text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
              }}
              className="hidden"
            />

            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="NOMBRE DEL PRODUCTO"
              className="neo-inset border-none uppercase"
              style={{ textTransform: "uppercase" }}
            />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ProductCategory }))} className="neo-inset p-2 text-sm bg-background text-foreground rounded-xl uppercase">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Input
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                placeholder="UNIDAD (LT, KG)"
                className="neo-inset border-none uppercase"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm((p) => ({ ...p, price: +e.target.value }))}
                placeholder="PRECIO"
                className="neo-inset border-none"
              />
              <Input
                type="number"
                value={form.stock || ""}
                onChange={(e) => setForm((p) => ({ ...p, stock: +e.target.value }))}
                placeholder="STOCK"
                className="neo-inset border-none"
              />
              <Input
                type="number"
                value={form.minStock || ""}
                onChange={(e) => setForm((p) => ({ ...p, minStock: +e.target.value }))}
                placeholder="STOCK MÍN."
                className="neo-inset border-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={form.emoji}
                onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                placeholder="EMOJI"
                className="neo-inset border-none uppercase"
                style={{ textTransform: "uppercase" }}
              />
              <Input
                value={form.barcode}
                onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))}
                placeholder="CÓDIGO DE BARRAS (AUTO-GENERADO, EDITABLE)"
                className="neo-inset border-none uppercase"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            {/* Validación de código de barras */}
            {form.barcode && form.name.trim() && (
              <div className="text-xs flex items-center gap-2">
                {validateEAN13(form.barcode) ? (
                  <span className="text-secondary font-bold flex items-center gap-1">
                    ✅ Código EAN-13 válido - El escáner podrá leerlo
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    ℹ️ Puedes editarlo o dejarlo así
                  </span>
                )}
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isUploading}
              className="neo-button w-full py-3 bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {editing ? "ACTUALIZANDO..." : "SUBIENDO IMAGEN Y GUARDANDO..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {editing ? "💾 ACTUALIZAR PRODUCTO" : "✅ GUARDAR PRODUCTO"}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {filtered.map((p) => {
          const colors = CATEGORY_COLORS[p.category];
          const lowStock = p.stock <= p.minStock;
          return (
            <div key={p.id} className={`neo-card p-3 flex items-center gap-3 border-l-4 ${colors.border}`}>
              {/* Mostrar imagen o emoji */}
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl">{p.emoji}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.category} • ${p.price} / {p.unit}</p>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${lowStock ? "text-destructive" : "text-secondary"}`}>
                    Stock: {p.stock}
                  </span>
                  {lowStock && <AlertTriangle className="w-3 h-3 text-destructive animate-pulse-alert" />}
                  <span className="text-[10px] text-muted-foreground">(mín: {p.minStock})</span>
                </div>
              </div>
              {p.barcode && <span className="text-[9px] text-muted-foreground">{p.barcode}</span>}
              <button
                onClick={() => startEdit(p)}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Editar producto"
              >
                <Edit2 className="w-3.5 h-3.5 text-primary" />
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                title="Eliminar producto"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Product Image Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <ProductImageScanner
            onScanComplete={handleScanComplete}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
