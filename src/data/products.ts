export type ProductCategory = "insecticida" | "herbicida" | "fertilizante" | "adherente" | "fungicida" | "bioestimulante" | "externo";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit: string;
  minStock: number;
  emoji: string;
  barcode: string;
  imageUrl?: string;  // URL de la imagen en Google Drive
  isExternal?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type IvaCondition = "aplica" | "exento";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  rfc: string;
  address: string;
}

export interface Supplier {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

export interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  rfc: string;
  email: string;
  slogan: string;
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Tienda El Inge",
  address: "Ébano, San Luis Potosí, México",
  phone: "(489) 123-4567",
  rfc: "XXXX000000XXX",
  email: "contacto@elinge.com",
  slogan: "Soluciones Agrícolas Profesionales",
};

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
  date: string;
  ivaCondition: IvaCondition;
  clientId?: string;
}

export const CATEGORY_COLORS: Record<ProductCategory, { bg: string; text: string; border: string }> = {
  insecticida: { bg: "bg-agro-blue-light", text: "text-agro-blue", border: "border-agro-blue" },
  fungicida: { bg: "bg-agro-blue-light", text: "text-agro-blue", border: "border-agro-blue" },
  adherente: { bg: "bg-agro-blue-light", text: "text-agro-blue", border: "border-agro-blue" },
  fertilizante: { bg: "bg-agro-green-light", text: "text-agro-green", border: "border-agro-green" },
  bioestimulante: { bg: "bg-agro-green-light", text: "text-agro-green", border: "border-agro-green" },
  herbicida: { bg: "bg-agro-yellow-light", text: "text-accent", border: "border-accent" },
  externo: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted-foreground" },
};

export const SYNGENTA_CATALOG: Product[] = [
  { id: "1", name: "Denim", category: "insecticida", price: 850, stock: 24, unit: "Lt", minStock: 5, emoji: "🛡️", barcode: "7501234560010" },
  { id: "2", name: "Ampligo", category: "insecticida", price: 1200, stock: 18, unit: "Lt", minStock: 4, emoji: "⚔️", barcode: "7501234560027" },
  { id: "3", name: "Engeo", category: "insecticida", price: 780, stock: 30, unit: "Lt", minStock: 6, emoji: "🎯", barcode: "7501234560034" },
  { id: "4", name: "Proclaim", category: "insecticida", price: 950, stock: 12, unit: "Kg", minStock: 3, emoji: "💥", barcode: "7501234560041" },
  { id: "5", name: "Gesaprim", category: "herbicida", price: 320, stock: 45, unit: "Lt", minStock: 10, emoji: "🌾", barcode: "7501234560058" },
  { id: "6", name: "Gramoxone", category: "herbicida", price: 280, stock: 38, unit: "Lt", minStock: 8, emoji: "🔥", barcode: "7501234560065" },
  { id: "7", name: "Flex", category: "herbicida", price: 450, stock: 20, unit: "Lt", minStock: 5, emoji: "💪", barcode: "7501234560072" },
  { id: "8", name: "Isabion", category: "bioestimulante", price: 680, stock: 22, unit: "Lt", minStock: 5, emoji: "🌱", barcode: "7501234560089" },
  { id: "9", name: "Bravo 720", category: "fungicida", price: 520, stock: 15, unit: "Lt", minStock: 4, emoji: "🍄", barcode: "7501234560096" },
  { id: "10", name: "Amistar", category: "fungicida", price: 1100, stock: 10, unit: "Lt", minStock: 3, emoji: "✨", barcode: "7501234560102" },
  { id: "11", name: "Adigor", category: "adherente", price: 380, stock: 28, unit: "Lt", minStock: 6, emoji: "🧲", barcode: "7501234560119" },
  { id: "12", name: "Curacron", category: "insecticida", price: 620, stock: 16, unit: "Lt", minStock: 4, emoji: "🐛", barcode: "7501234560126" },
];

export const KITS = [
  {
    id: "kit-cogollero",
    name: "Kit Gusano Cogollero",
    emoji: "🐛🛡️",
    products: ["1", "11"],
    description: "Denim + Adigor",
  },
  {
    id: "kit-maleza",
    name: "Kit Control Maleza",
    emoji: "🌾🔥",
    products: ["5", "6"],
    description: "Gesaprim + Gramoxone",
  },
  {
    id: "kit-proteccion",
    name: "Kit Protección Total",
    emoji: "✨🛡️",
    products: ["2", "10", "11"],
    description: "Ampligo + Amistar + Adigor",
  },
];
