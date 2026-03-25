import { Product, CATEGORY_COLORS } from "@/data/products";
import { AlertTriangle, TrendingDown, TrendingUp, ShoppingCart } from "lucide-react";
import { Sale } from "@/data/products";

interface AnalysisScreenProps {
  inventory: Product[];
  sales: Sale[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
}

export default function AnalysisScreen({ inventory, sales, lowStockProducts, outOfStockProducts }: AnalysisScreenProps) {
  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
  const totalItems = sales.reduce((s, sale) => s + sale.items.reduce((a, i) => a + i.quantity, 0), 0);

  // Simple purchase proposal based on stock levels
  const purchaseProposal = inventory
    .filter((p) => p.stock <= p.minStock * 2)
    .map((p) => ({
      ...p,
      suggestedQty: Math.max(p.minStock * 3 - p.stock, 5),
    }))
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="p-4 space-y-4">
      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="neo-card p-4 border-2 border-destructive/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive animate-pulse-alert" />
            <h2 className="font-display font-bold text-foreground">⚠️ Alertas de Stock</h2>
          </div>
          <div className="space-y-1">
            {outOfStockProducts.map((p) => (
              <div key={p.id} className="text-xs text-destructive font-semibold">
                🔴 {p.emoji} {p.name} — SIN STOCK
              </div>
            ))}
            {lowStockProducts.map((p) => (
              <div key={p.id} className="text-xs text-accent-foreground">
                🟡 {p.emoji} {p.name} — Stock: {p.stock} (mín: {p.minStock})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neo-card p-3 text-center">
          <ShoppingCart className="w-5 h-5 mx-auto text-primary mb-1" />
          <div className="text-lg font-bold text-foreground">{sales.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Ventas</div>
        </div>
        <div className="neo-card p-3 text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-secondary mb-1" />
          <div className="text-lg font-bold text-foreground">${totalSales.toFixed(0)}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Ingreso</div>
        </div>
        <div className="neo-card p-3 text-center">
          <TrendingDown className="w-5 h-5 mx-auto text-accent mb-1" />
          <div className="text-lg font-bold text-foreground">{totalItems}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Pzas Vendidas</div>
        </div>
        <div className="neo-card p-3 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto text-destructive mb-1" />
          <div className="text-lg font-bold text-foreground">{lowStockProducts.length + outOfStockProducts.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Alertas</div>
        </div>
      </div>

      {/* Purchase Proposal */}
      <div className="neo-card p-4">
        <h2 className="font-display font-bold text-foreground mb-3">📋 Propuesta de Compra</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Basada en stock actual y temporada de siembra Primavera-Verano 2026.
        </p>
        {purchaseProposal.length === 0 ? (
          <p className="text-sm text-secondary font-semibold text-center py-4">✅ Stock saludable en todos los productos</p>
        ) : (
          <div className="space-y-2">
            {purchaseProposal.map((p) => {
              const colors = CATEGORY_COLORS[p.category];
              return (
                <div key={p.id} className={`neo-inset p-2 flex items-center gap-3 border-l-4 ${colors.border}`}>
                  <span className="text-lg">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">Stock: {p.stock} | Mín: {p.minStock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">+{p.suggestedQty} {p.unit}</p>
                    <p className="text-[10px] text-muted-foreground">${(p.suggestedQty * p.price).toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent sales */}
      {sales.length > 0 && (
        <div className="neo-card p-4">
          <h2 className="font-display font-bold text-foreground mb-3">🧾 Ventas Recientes</h2>
          <div className="space-y-2">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="neo-inset p-2 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-foreground">{sale.id}</p>
                  <p className="text-[10px] text-muted-foreground">{sale.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-secondary">${sale.total.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {sale.ivaCondition === "exento" ? "🔴 Exento" : "🟢 IVA 16%"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
