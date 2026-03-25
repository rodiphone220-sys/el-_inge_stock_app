import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@/data/products";
import { Plus, Trash2, Edit2, Users, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientsScreenProps {
  clients: Client[];
  onAdd: (c: Omit<Client, "id">) => void;
  onUpdate: (c: Client) => void;
  onDelete: (id: string) => void;
}

const emptyClient = { name: "", phone: "", email: "", rfc: "", address: "" };

export default function ClientsScreen({ clients, onAdd, onUpdate, onDelete }: ClientsScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient);
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.rfc.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editing) {
      onUpdate({ ...editing, ...form });
      setEditing(null);
    } else {
      onAdd(form);
    }
    setForm(emptyClient);
    setShowForm(false);
  };

  const startEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, rfc: c.rfc, address: c.address });
    setShowForm(true);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="font-display font-bold text-xl text-foreground">👥 Clientes</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyClient); }}
          className="neo-button px-4 py-2 bg-primary text-primary-foreground font-bold text-sm flex items-center gap-1"
        >
          {showForm ? <><X className="w-4 h-4" /> Cerrar</> : <><Plus className="w-4 h-4" /> Nuevo</>}
        </motion.button>
      </div>

      <div className="neo-inset px-3 py-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente por nombre o RFC..."
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
            <h3 className="font-bold text-sm text-foreground">{editing ? "✏️ Editar Cliente" : "➕ Nuevo Cliente"}</h3>
            {(["name", "phone", "email", "rfc", "address"] as const).map((key) => (
              <Input
                key={key}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={{ name: "Nombre completo", phone: "Teléfono", email: "Correo", rfc: "RFC", address: "Dirección" }[key]}
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
          <p className="text-center text-muted-foreground py-8 text-sm">No hay clientes registrados</p>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="neo-card p-3 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.phone} • {c.email}</p>
                <p className="text-[10px] text-muted-foreground">RFC: {c.rfc}</p>
              </div>
              <button onClick={() => startEdit(c)} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-primary" />
              </button>
              <button onClick={() => onDelete(c.id)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
