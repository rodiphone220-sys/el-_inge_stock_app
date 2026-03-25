import { Sale, BusinessSettings } from "@/data/products";

interface TicketPDFProps {
  sale: Sale;
  settings: BusinessSettings;
  onClose: () => void;
}

export default function TicketPDF({ sale, settings, onClose }: TicketPDFProps) {
  const handlePrint = () => window.print();

  const handleDownload = () => {
    const content = document.getElementById("ticket-content");
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Ticket ${sale.id}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Courier New', monospace; width: 80mm; padding: 4mm; font-size: 11px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 4px 0; }
        .row { display: flex; justify-content: space-between; }
        .total-row { font-size: 14px; font-weight: bold; }
        h1 { font-size: 16px; margin-bottom: 2px; }
        @media print { body { width: 80mm; } }
      </style></head><body>
        ${content.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const ivaLabel = sale.ivaCondition === "aplica" ? "IVA 16%" : "EXENTO";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Ticket content */}
        <div id="ticket-content" className="p-6 font-mono text-xs text-foreground">
          <div className="text-center mb-3">
            <h1 className="font-bold text-base">{settings.businessName}</h1>
            <p className="text-[10px] text-muted-foreground">{settings.slogan}</p>
            <p className="text-[10px] text-muted-foreground">{settings.address}</p>
            <p className="text-[10px] text-muted-foreground">Tel: {settings.phone} | RFC: {settings.rfc}</p>
            <p className="text-[10px] text-muted-foreground">{settings.email}</p>
          </div>

          <div className="border-t border-dashed border-border my-2" />

          <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
            <span>Ticket: {sale.id}</span>
            <span>{sale.date}</span>
          </div>

          <div className="border-t border-dashed border-border my-1" />

          {/* Items */}
          <div className="space-y-1">
            {sale.items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="truncate flex-1">{item.product.emoji} {item.product.name}</span>
                </div>
                <div className="flex justify-between text-muted-foreground pl-4">
                  <span>{item.quantity} x ${item.product.price.toFixed(2)}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border my-2" />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{ivaLabel}:</span>
              <span>{sale.ivaCondition === "exento" ? "$0.00" : `$${sale.iva.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-border my-1" />
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border my-2" />

          <div className="text-center text-[10px] text-muted-foreground">
            <p>¡Gracias por su compra!</p>
            <p>{settings.businessName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-border">
          <button onClick={onClose} className="neo-button flex-1 py-3 text-sm font-bold text-muted-foreground">
            ✕ Cerrar
          </button>
          <button onClick={handlePrint} className="neo-button flex-1 py-3 text-sm font-bold bg-primary text-primary-foreground">
            🖨️ Imprimir
          </button>
          <button onClick={handleDownload} className="neo-button flex-1 py-3 text-sm font-bold bg-secondary text-secondary-foreground">
            📄 PDF
          </button>
        </div>
      </div>
    </div>
  );
}
