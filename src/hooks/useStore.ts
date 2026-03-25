import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Product,
  CartItem,
  Sale,
  IvaCondition,
  Client,
  Supplier,
  BusinessSettings,
  DEFAULT_SETTINGS,
  SYNGENTA_CATALOG,
} from "@/data/products";
import {
  getProducts,
  getSales,
  getClients,
  getSuppliers,
  getSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  createSale,
  createClient,
  updateClient,
  deleteClient,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  updateSettings,
  recordInventoryMovement,
} from "@/lib/googleApi";

export function useStore() {
  // Estado local con datos iniciales del catálogo
  const [inventory, setInventory] = useState<Product[]>([...SYNGENTA_CATALOG]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ivaCondition, setIvaCondition] = useState<IvaCondition>("aplica");
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({ ...DEFAULT_SETTINGS });

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos desde Google Sheets al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Cargar productos
        const productsResponse = await getProducts();
        if (productsResponse.success && productsResponse.data && productsResponse.data.length > 0) {
          setInventory(productsResponse.data);
        }

        // Cargar ventas
        const salesResponse = await getSales();
        if (salesResponse.success && salesResponse.data) {
          setSales(salesResponse.data);
        }

        // Cargar clientes
        const clientsResponse = await getClients();
        if (clientsResponse.success && clientsResponse.data) {
          setClients(clientsResponse.data);
        }

        // Cargar proveedores
        const suppliersResponse = await getSuppliers();
        if (suppliersResponse.success && suppliersResponse.data) {
          setSuppliers(suppliersResponse.data);
        }

        // Cargar configuración
        const settingsResponse = await getSettings();
        if (settingsResponse.success && settingsResponse.data) {
          setSettings(settingsResponse.data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudo cargar los datos. Verifica tu conexión a internet.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Cart
  const addToCart = useCallback((productId: string, qty = 1) => {
    const product = inventory.find((p) => p.id === productId);
    if (!product || (!product.isExternal && product.stock < qty)) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === productId);
      if (existing) {
        return prev.map((c) => c.product.id === productId ? { ...c, quantity: c.quantity + qty } : c);
      }
      return [...prev, { product, quantity: qty }];
    });
  }, [inventory]);

  const addExternalProduct = useCallback((name: string, price: number, qty: number) => {
    const externalProduct: Product = {
      id: `ext-${Date.now()}`, name, category: "externo", price, stock: 999,
      unit: "Pza", minStock: 0, emoji: "📦", barcode: "", isExternal: true,
    };
    setCart((prev) => [...prev, { product: externalProduct, quantity: qty }]);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((c) => (c.product.id === productId ? { ...c, quantity: qty } : c)));
  }, [removeFromCart]);

  const cartSubtotal = useMemo(() => cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0), [cart]);
  const cartIva = useMemo(() => ivaCondition === "aplica" ? cartSubtotal * 0.16 : 0, [cartSubtotal, ivaCondition]);
  const cartTotal = useMemo(() => cartSubtotal + cartIva, [cartSubtotal, cartIva]);

  const finalizeSale = useCallback(async () => {
    if (cart.length === 0) return null;
    
    const saleData: Omit<Sale, "createdAt"> = {
      id: `V-${Date.now()}`,
      items: [...cart],
      subtotal: cartSubtotal,
      iva: cartIva,
      total: cartTotal,
      date: new Date().toLocaleString("es-MX"),
      ivaCondition,
    };

    try {
      // Guardar venta en Google Sheets
      const saleResponse = await createSale(saleData);
      if (!saleResponse.success || !saleResponse.data) {
        console.error("Error guardando venta:", saleResponse.error);
        // Si falla la API, guardar localmente de todos modos
      }

      // Actualizar inventario localmente
      setInventory((prev) => prev.map((p) => {
        const cartItem = cart.find((c) => c.product.id === p.id);
        if (cartItem && !cartItem.product.isExternal) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      }));

      // Registrar movimiento de inventario para cada producto
      for (const cartItem of cart) {
        if (!cartItem.product.isExternal) {
          await recordInventoryMovement({
            productId: cartItem.product.id,
            productName: cartItem.product.name,
            type: "sale",
            quantity: -cartItem.quantity,
            previousStock: cartItem.product.stock,
            newStock: cartItem.product.stock - cartItem.quantity,
            reason: `Venta ${saleData.id}`,
            userId: "pos",
            saleId: saleData.id,
          });
        }
      }

      // Actualizar lista de ventas localmente
      const sale = { ...saleData, createdAt: new Date() } as Sale;
      setSales((prev) => [sale, ...prev]);
      setCart([]);
      return sale;
    } catch (err) {
      console.error("Error finalizando venta:", err);
      // En caso de error, aún permitir la venta localmente
      const sale = { ...saleData, createdAt: new Date() } as Sale;
      setSales((prev) => [sale, ...prev]);
      setInventory((prev) => prev.map((p) => {
        const cartItem = cart.find((c) => c.product.id === p.id);
        if (cartItem && !cartItem.product.isExternal) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      }));
      setCart([]);
      return sale;
    }
  }, [cart, cartSubtotal, cartIva, cartTotal, ivaCondition]);

  const clearCart = useCallback(() => setCart([]), []);

  // Inventory CRUD
  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    const newProduct = { ...p, id: `prod-${Date.now()}` } as Product;

    console.log("📦 Intentando guardar producto:", newProduct);

    try {
      const response = await createProduct(p);
      console.log("📦 Respuesta de Google Sheets:", response);

      if (response.success && response.data) {
        console.log("✅ Producto guardado en Google Sheets:", response.data);
        setInventory((prev) => [...prev, response.data!]);
      } else {
        console.warn("⚠️ Error en API, guardando localmente:", response.error);
        // Fallback local
        setInventory((prev) => [...prev, newProduct]);
      }
    } catch (err) {
      console.error("❌ Error agregando producto:", err);
      setInventory((prev) => [...prev, newProduct]);
    }
  }, []);

  const updateProduct = useCallback(async (p: Product) => {
    console.log("📦 Intentando actualizar producto:", p);

    try {
      const response = await updateProduct(p);
      console.log("📦 Respuesta de Google Sheets:", response);

      if (response.success && response.data) {
        console.log("✅ Producto actualizado en Google Sheets:", response.data);
        setInventory((prev) => prev.map((item) => item.id === p.id ? response.data! : item));
      } else {
        console.warn("⚠️ Error en API, actualizando localmente:", response.error);
        setInventory((prev) => prev.map((item) => item.id === p.id ? p : item));
      }
    } catch (err) {
      console.error("❌ Error actualizando producto:", err);
      setInventory((prev) => prev.map((item) => item.id === p.id ? p : item));
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const response = await deleteProduct(id);
      if (response.success) {
        setInventory((prev) => prev.filter((p) => p.id !== id));
      } else {
        setInventory((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error eliminando producto:", err);
      setInventory((prev) => prev.filter((p) => p.id !== id));
    }
  }, []);

  // Clients CRUD
  const addClient = useCallback(async (c: Omit<Client, "id">) => {
    const newClient = { ...c, id: `cli-${Date.now()}` };
    
    try {
      const response = await createClient(c);
      if (response.success && response.data) {
        setClients((prev) => [...prev, response.data]);
      } else {
        setClients((prev) => [...prev, newClient]);
      }
    } catch (err) {
      console.error("Error agregando cliente:", err);
      setClients((prev) => [...prev, newClient]);
    }
  }, []);

  const updateClient = useCallback(async (c: Client) => {
    try {
      const response = await updateClient(c);
      if (response.success && response.data) {
        setClients((prev) => prev.map((item) => item.id === c.id ? response.data! : item));
      } else {
        setClients((prev) => prev.map((item) => item.id === c.id ? c : item));
      }
    } catch (err) {
      console.error("Error actualizando cliente:", err);
      setClients((prev) => prev.map((item) => item.id === c.id ? c : item));
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const response = await deleteClient(id);
      if (response.success) {
        setClients((prev) => prev.filter((c) => c.id !== id));
      } else {
        setClients((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  }, []);

  // Suppliers CRUD
  const addSupplier = useCallback(async (s: Omit<Supplier, "id">) => {
    const newSupplier = { ...s, id: `sup-${Date.now()}` };
    
    try {
      const response = await createSupplier(s);
      if (response.success && response.data) {
        setSuppliers((prev) => [...prev, response.data]);
      } else {
        setSuppliers((prev) => [...prev, newSupplier]);
      }
    } catch (err) {
      console.error("Error agregando proveedor:", err);
      setSuppliers((prev) => [...prev, newSupplier]);
    }
  }, []);

  const updateSupplier = useCallback(async (s: Supplier) => {
    try {
      const response = await updateSupplier(s);
      if (response.success && response.data) {
        setSuppliers((prev) => prev.map((item) => item.id === s.id ? response.data! : item));
      } else {
        setSuppliers((prev) => prev.map((item) => item.id === s.id ? s : item));
      }
    } catch (err) {
      console.error("Error actualizando proveedor:", err);
      setSuppliers((prev) => prev.map((item) => item.id === s.id ? s : item));
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      const response = await deleteSupplier(id);
      if (response.success) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      } else {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error eliminando proveedor:", err);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  }, []);

  // Settings
  const saveSettings = useCallback(async (newSettings: BusinessSettings) => {
    try {
      const response = await updateSettings(newSettings);
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setSettings(newSettings);
      }
    } catch (err) {
      console.error("Error guardando configuración:", err);
      setSettings(newSettings);
    }
  }, []);

  const lowStockProducts = inventory.filter((p) => p.stock <= p.minStock * 1.15 && p.stock > 0);
  const outOfStockProducts = inventory.filter((p) => p.stock === 0);

  return {
    inventory, cart, sales, ivaCondition, setIvaCondition,
    addToCart, addExternalProduct, removeFromCart, updateCartQty,
    cartSubtotal, cartIva, cartTotal, finalizeSale, clearCart,
    lowStockProducts, outOfStockProducts,
    clients, addClient, updateClient, deleteClient,
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    settings, setSettings: saveSettings,
    addProduct, updateProduct, deleteProduct,
    loading, error,
  };
}
