import { useState } from "react";
import { motion } from "framer-motion";
import { BusinessSettings } from "@/data/products";
import { Save, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SettingsScreenProps {
  settings: BusinessSettings;
  onSave: (s: BusinessSettings) => void;
}

export default function SettingsScreen({ settings, onSave }: SettingsScreenProps) {
  const [form, setForm] = useState<BusinessSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: keyof BusinessSettings; label: string; placeholder: string; emoji: string }[] = [
    { key: "businessName", label: "Nombre del Negocio", placeholder: "Tienda El Inge", emoji: "🏪" },
    { key: "address", label: "Dirección", placeholder: "Calle, Ciudad, Estado", emoji: "📍" },
    { key: "phone", label: "Teléfono", placeholder: "(489) 123-4567", emoji: "📞" },
    { key: "rfc", label: "RFC", placeholder: "XXXX000000XXX", emoji: "🧾" },
    { key: "email", label: "Correo Electrónico", placeholder: "correo@ejemplo.com", emoji: "✉️" },
    { key: "slogan", label: "Eslogan", placeholder: "Tu frase comercial", emoji: "💬" },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-6 h-6 text-primary" />
        <h2 className="font-display font-bold text-xl text-foreground">⚙️ Ajustes del Negocio</h2>
      </div>

      <div className="neo-card p-6 space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Estos datos aparecerán en los tickets de venta y documentos generados.
        </p>

        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>{f.emoji}</span> {f.label}
            </label>
            <Input
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="neo-inset border-none"
            />
          </div>
        ))}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className={`neo-button w-full py-4 font-bold text-base flex items-center justify-center gap-2 mt-4 ${
            saved ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? "✅ Guardado" : "💾 Guardar Ajustes"}
        </motion.button>
      </div>

      {/* Preview */}
      <div className="neo-card p-6 mt-6">
        <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          👁️ Vista Previa del Ticket
        </h3>
        <div className="neo-inset p-4 text-center space-y-1">
          <p className="font-display font-bold text-lg text-foreground">{form.businessName || "Nombre del Negocio"}</p>
          <p className="text-xs text-muted-foreground">{form.slogan}</p>
          <p className="text-xs text-muted-foreground">{form.address}</p>
          <p className="text-xs text-muted-foreground">Tel: {form.phone} | RFC: {form.rfc}</p>
          <p className="text-xs text-muted-foreground">{form.email}</p>
          <div className="border-t border-dashed border-border my-2" />
          <p className="text-[10px] text-muted-foreground">--- Ejemplo de ticket ---</p>
        </div>
      </div>
    </div>
  );
}
