import { useState } from "react";
import Header from "@/components/Header";
import POSScreen from "@/components/POSScreen";
import ScannerScreen from "@/components/ScannerScreen";
import AnalysisScreen from "@/components/AnalysisScreen";
import InfoScreen from "@/components/InfoScreen";
import SettingsScreen from "@/components/SettingsScreen";
import ClientsScreen from "@/components/ClientsScreen";
import SuppliersScreen from "@/components/SuppliersScreen";
import InventoryScreen from "@/components/InventoryScreen";
import TicketPDF from "@/components/TicketPDF";
import { useStore } from "@/hooks/useStore";
import { Sale } from "@/data/products";

export default function Index() {
  const [activeTab, setActiveTab] = useState("pos");
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSale, setTicketSale] = useState<Sale | null>(null);
  const store = useStore();

  const cartCount = store.cart.reduce((s, c) => s + c.quantity, 0);

  const handleFinalizeSale = () => {
    const sale = store.finalizeSale();
    if (sale) setTicketSale(sale);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab} onTabChange={setActiveTab}
        cartCount={cartCount} searchQuery={searchQuery} onSearchChange={setSearchQuery}
      />

      <main className="max-w-6xl mx-auto pb-8">
        {activeTab === "pos" && (
          <POSScreen
            inventory={store.inventory} cart={store.cart} searchQuery={searchQuery}
            ivaCondition={store.ivaCondition} onIvaConditionChange={store.setIvaCondition}
            addToCart={store.addToCart} addExternalProduct={store.addExternalProduct}
            removeFromCart={store.removeFromCart} updateCartQty={store.updateCartQty}
            cartSubtotal={store.cartSubtotal} cartIva={store.cartIva} cartTotal={store.cartTotal}
            finalizeSale={handleFinalizeSale} clearCart={store.clearCart}
          />
        )}
        {activeTab === "scanner" && (
          <ScannerScreen inventory={store.inventory} addToCart={store.addToCart} />
        )}
        {activeTab === "inventory" && (
          <InventoryScreen
            inventory={store.inventory} onAdd={store.addProduct}
            onUpdate={store.updateProduct} onDelete={store.deleteProduct}
          />
        )}
        {activeTab === "clients" && (
          <ClientsScreen
            clients={store.clients} onAdd={store.addClient}
            onUpdate={store.updateClient} onDelete={store.deleteClient}
          />
        )}
        {activeTab === "suppliers" && (
          <SuppliersScreen
            suppliers={store.suppliers} onAdd={store.addSupplier}
            onUpdate={store.updateSupplier} onDelete={store.deleteSupplier}
          />
        )}
        {activeTab === "analysis" && (
          <AnalysisScreen
            inventory={store.inventory} sales={store.sales}
            lowStockProducts={store.lowStockProducts} outOfStockProducts={store.outOfStockProducts}
          />
        )}
        {activeTab === "settings" && (
          <SettingsScreen settings={store.settings} onSave={store.setSettings} />
        )}
        {activeTab === "info" && <InfoScreen />}
      </main>

      {ticketSale && (
        <TicketPDF sale={ticketSale} settings={store.settings} onClose={() => setTicketSale(null)} />
      )}
    </div>
  );
}
