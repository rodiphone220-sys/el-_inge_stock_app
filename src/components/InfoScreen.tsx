import { MapPin, Phone, Clock, Leaf, Smartphone } from "lucide-react";

export default function InfoScreen() {
  return (
    <div className="p-4 space-y-4">
      <div className="neo-card p-6 text-center">
        <span className="text-5xl block mb-3">🌾</span>
        <h2 className="font-display text-2xl font-bold text-foreground">El Inge POS AI</h2>
        <p className="text-sm text-muted-foreground mt-1">Sistema de Gestión Agroquímica v2.0</p>
        <p className="text-xs text-muted-foreground mt-1">Línea Syngenta • Ébano, SLP</p>
      </div>

      <div className="neo-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Ubicación</p>
            <p className="text-xs text-muted-foreground">Ébano, San Luis Potosí, México</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Horario</p>
            <p className="text-xs text-muted-foreground">Lun-Sáb 8:00 AM - 6:00 PM</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Contacto</p>
            <p className="text-xs text-muted-foreground">Rodrigo H. • WhatsApp disponible</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Especialidad</p>
            <p className="text-xs text-muted-foreground">
              Insecticidas, herbicidas, fungicidas, fertilizantes y bioestimulantes de la línea Syngenta.
            </p>
          </div>
        </div>
      </div>

      <div className="neo-card p-4">
        <h3 className="font-display font-bold text-foreground mb-2">🗓️ Calendario Agrícola</h3>
        <div className="space-y-2">
          <div className="neo-inset p-2 flex items-center gap-2">
            <span className="text-sm">🌧️</span>
            <div>
              <p className="text-xs font-bold text-foreground">Primavera-Verano</p>
              <p className="text-[10px] text-muted-foreground">Mar-Sep • Alta demanda: Herbicidas + Insecticidas</p>
            </div>
          </div>
          <div className="neo-inset p-2 flex items-center gap-2">
            <span className="text-sm">🍂</span>
            <div>
              <p className="text-xs font-bold text-foreground">Otoño-Invierno</p>
              <p className="text-[10px] text-muted-foreground">Oct-Feb • Alta demanda: Fungicidas + Fertilizantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* PWA tip */}
      <div className="neo-card p-4 border-2 border-primary/20">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">💡 Tip: Instalar como App</p>
            <p className="text-xs text-muted-foreground">
              Abre esta página en el navegador de tu celular y usa <strong>"Agregar a pantalla de inicio"</strong> para
              tener acceso rápido con icono propio, sin barra del navegador.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Desarrollado con ❤️ por Rodrigo H. | Powered by Lovable
      </p>
    </div>
  );
}
