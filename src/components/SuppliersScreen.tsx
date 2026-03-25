import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Supplier } from "@/data/products";
import { Plus, Trash2, Edit2, Truck, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SuppliersScreenProps {
  suppliers: Supplier[];
  onAdd: (s: Omit<Supplier, "id">) => void;
  onUpdate: (s: Supplier) => void;
  onDelete: (id: string) => void;
}

const emptySupplier = { company: "", contact: "", phone: "", email: "", address: "" };

export default function SuppliersScreen({ suppliers, onAdd, onUpdate, onDelete }: SuppliersScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptySupplier);
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter((s) =>
    s.company.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.company.trim()) return;
    if (editing) {
      onUpdate({ ...editing, ...form });
      setEditing(null);
    } else {
      onAdd(form);
    }
    setForm(emptySupplier);
    setShowForm(false);
  };

  const startEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ company: s.company, contact: s.contact, phone: s.phone, email: s.email, address: s.address });
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-secondary" />
          <h2 className="font-display font-bold text-xl text-foreground">🚛 Proveedores</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptySupplier); }}
          className="neo-button px-4 py-2 bg-secondary text-secondary-foreground font-bold text-sm flex items-center gap-1"
        >
          {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo</>}
        </motion.button>
      </div>

      <div className="neo-inset px-3 py-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="border-none bg-transparent"
        />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="neo-card p-4 mb-4 space-y-3"
          >
            <h3 className="font-bold text-sm text-foreground">{editing ? "✏️ Editar Proveedor" : "➕ Nuevo Proveedor"}</h3>
            {(["company", "contact", "phone", "email", "address"] as const).map((key) => (
              <Input
                key={key}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={{ company: "Empresa", contact: "Contacto", phone: "Teléfono", email: "Correo", address: "Dirección" }[key]}
                className="neo-inset border-none"
              />
            ))}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="neo-button w-full py-3 bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Guardar"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No hay proveedores registrados</p>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="neo-card p-3 flex items-center gap-3">
              <span className="text-2xl">🏭</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{s.company}</p>
                <p className="text-[10px] text-muted-foreground">Contacto: {s.contact} • {s.phone}</p>
                <p className="text-[10px] text-muted-foreground">{s.email}</p>
              </div>
              <button onClick={() => startEdit(s)} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-primary" />
              </button>
              <button onClick={() => onDelete(s.id)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
