import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, ScanLine, CheckCircle, AlertCircle } from "lucide-react";
import Tesseract from "tesseract.js";

interface ProductImageScannerProps {
  onScanComplete: (data: { name: string; price?: number; barcode?: string; description?: string; imageBase64?: string }) => void;
  onClose: () => void;
}

export default function ProductImageScanner({ onScanComplete, onClose }: ProductImageScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{ name: string; price: string; barcode: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImage(imageUrl);
      processImage(imageUrl);
    };
    reader.onerror = () => {
      setError("Error al leer la imagen");
    };
    reader.readAsDataURL(file);
  };

  // Confirmar y enviar datos
  const handleConfirm = () => {
    if (!extractedData) return;

    onScanComplete({
      name: extractedData.name,
      price: extractedData.price ? parseFloat(extractedData.price) : 0,
      barcode: extractedData.barcode,
      imageBase64: image || undefined, // Pasar imagen para guardar en Drive
    });
  };

  // Pre-procesar imagen para mejorar OCR
  const preprocessImage = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Escalar para mejor resolución (mínimo 2048px en el lado más largo)
        const scale = Math.max(3, 3000 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Dibujar imagen escalada con mejor calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Obtener datos de imagen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convertir a escala de grises
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // R
          data[i + 1] = avg; // G
          data[i + 2] = avg; // B
        }

        ctx.putImageData(imageData, 0, 0);

        // Aplicar filtro de umbral adaptativo con mejor contraste
        const finalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const finalData = finalImageData.data;

        // Calcular umbral óptimo (método de Otsu simplificado)
        let sum = 0;
        let total = 0;
        for (let i = 0; i < finalData.length; i += 4) {
          const gray = finalData[i];
          sum += gray;
          total++;
        }
        const threshold = sum / total;

        // Aplicar umbral con mayor contraste
        for (let i = 0; i < finalData.length; i += 4) {
          const gray = finalData[i];
          // Umbral más agresivo para mejor contraste
          const val = gray > threshold ? 255 : 0;
          finalData[i] = val;     // R
          finalData[i + 1] = val; // G
          finalData[i + 2] = val; // B
        }

        ctx.putImageData(finalImageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageUrl;
    });
  };

  // Procesar imagen con OCR
  const processImage = async (imageUrl: string) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Pre-procesar imagen para mejorar precisión
      setStatus("Mejorando imagen...");
      const processedImage = await preprocessImage(imageUrl);

      // Crear worker con configuración optimizada
      const worker = await Tesseract.createWorker("spa", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setStatus(`Analizando: ${Math.round(m.progress * 100)}%`);
          } else {
            setStatus(m.status);
          }
        },
      });

      // Configurar para mejor precisión
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.- ",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      });

      // Reconocer texto
      const { data } = await worker.recognize(processedImage);

      await worker.terminate();

      const extractedData = extractProductInfo(data.text);

      setStatus("✅ Análisis completado");

      // Mostrar datos extraídos para revisión
      setExtractedData({
        name: extractedData.name || "",
        price: extractedData.price?.toString() || "0",
        barcode: extractedData.barcode || "",
      });

    } catch (err) {
      console.error("Error en OCR:", err);
      setError("Error al procesar la imagen. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Extraer información del texto OCR
  const extractProductInfo = (text: string) => {
    const lines = text.split("\n").filter(line => line.trim().length > 0);

    let name = "";
    let price: number | undefined;
    let barcode: string | undefined;
    let description = "";

    console.log("OCR Texto Original:", text);
    console.log("OCR Líneas:", lines);

    // ========================================
    // 1. BUSCAR PRECIO (Múltiples patrones)
    // ========================================
    const pricePatterns = [
      /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/,  // $1,234.56 o $1234.56
      /\$\s*(\d+\.?\d{0,2})/,                       // $123 o $123.45
      /(\d+\.?\d{0,2})\s*(?:USD|MXN|pesos|pesos)/i, // 123.45 USD/MXN
      /(\$?\s*\d{1,3}\.\d{2})/,                     // 123.45 o $123.45
    ];

    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        let priceStr = match[1].replace(/,/g, "");
        const parsedPrice = parseFloat(priceStr);
        if (!isNaN(parsedPrice) && parsedPrice > 10 && parsedPrice < 100000) {
          price = parsedPrice;
          console.log("✅ Precio detectado:", price);
          break;
        }
      }
    }

    // ========================================
    // 2. BUSCAR CÓDIGO DE BARRAS
    // ========================================
    const barcodePatterns = [
      /\b(\d{13})\b/,    // EAN-13 (13 dígitos)
      /\b(\d{12})\b/,    // UPC-A (12 dígitos)
      /\b(\d{8})\b/,     // EAN-8 (8 dígitos)
      /750\d{10}/,       // Códigos mexicanos (750 + 10)
    ];

    for (const pattern of barcodePatterns) {
      const match = text.match(pattern);
      if (match) {
        barcode = match[0];
        console.log("✅ Barcode detectado:", barcode);
        break;
      }
    }

    // ========================================
    // 3. BUSCAR NOMBRE DEL PRODUCTO
    // ========================================
    // Palabras clave que indican que NO es nombre
    const excludeKeywords = [
      'precio', 'price', 'costo', 'total', 'paga', 'ahorra',
      'codigo', 'código', 'code', 'barcode', 'ean', 'upc',
      'peso', 'weight', 'ml', 'lt', 'kg', 'g', 'oz',
      'lote', 'batch', 'exp', 'vence', 'caduca',
      'fabricado', 'hecho en', 'made in', 'importado',
      'registro', 'reg', 'sanitario', 'cofepris'
    ];

    // Buscar líneas que parezcan nombres de producto
    const nameCandidates = lines
      .map(line => line.trim())
      .filter(line => {
        const lower = line.toLowerCase();

        // Excluir líneas que:
        // 1. Sean muy cortas (< 3 chars) o muy largas (> 60 chars)
        // 2. Sean solo números
        // 3. Contengan keywords excluidas
        // 4. Sean códigos de barras
        // 5. Sean precios
        return (
          line.length >= 3 &&
          line.length <= 60 &&
          !/^\d+$/.test(line) &&
          !/^[\$.,\s\d]+$/.test(line) &&
          !line.match(/^\d{8,13}$/) && // No es barcode
          !excludeKeywords.some(keyword => lower.includes(keyword)) &&
          line.length > 0
        );
      });

    // Priorizar candidatos por posición y contenido
    if (nameCandidates.length > 0) {
      // Tomar el primer candidato que tenga palabras (no solo símbolos)
      const validName = nameCandidates.find(candidate => {
        const wordCount = candidate.split(/\s+/).length;
        const hasLetters = /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(candidate);
        return hasLetters && wordCount >= 1;
      });

      if (validName) {
        // Limpiar nombre: quitar símbolos raros pero mantener letras y números
        name = validName
          .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ°%-]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 80);

        console.log("✅ Nombre detectado:", name);
      }
    }

    // Fallback: Si no se encontró nombre, usar primeras palabras
    if (!name && text.trim().length > 0) {
      const words = text
        .split(/\s+/)
        .filter(w => w.length > 2 && /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(w));
      name = words.slice(0, 6).join(" ").substring(0, 80);
      console.log("⚠️ Nombre fallback:", name);
    }

    // ========================================
    // 4. DESCRIPCIÓN
    // ========================================
    description = lines
      .slice(0, 5)
      .join(" ")
      .substring(0, 200);

    console.log("📊 Extracción final:", { name, price, barcode, description });

    return { name, price, barcode, description };
  };

  // Capturar foto de la cámara
  const handleCameraCapture = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Tu navegador no soporta captura de cámara");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Crear video temporal para captura
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      // Capturar frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Detener stream
      stream.getTracks().forEach(track => track.stop());

      // Convertir a imagen
      const imageUrl = canvas.toDataURL("image/jpeg");
      setImage(imageUrl);
      processImage(imageUrl);

    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="neo-card p-6 w-full max-w-lg space-y-4 bg-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">
              📸 Escáner OCR de Productos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="neo-inset p-3 border-2 border-destructive/30 bg-destructive/10 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status */}
        {isProcessing && (
          <div className="neo-inset p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm font-bold text-foreground">{status}</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Analizando imagen con IA...
            </p>
          </div>
        )}

        {/* Image Preview */}
        {image && !isProcessing && (
          <div className="neo-inset rounded-lg overflow-hidden">
            <img
              src={image}
              alt="Producto escaneado"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Extracted Data Review */}
        {extractedData && !isProcessing && (
          <div className="neo-inset p-4 space-y-3 border-2 border-primary/30">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-secondary" />
              Datos Extraídos (edita si es necesario)
            </h3>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
              <input
                type="text"
                value={extractedData.name}
                onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                className="w-full mt-1 neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Precio</label>
                <input
                  type="number"
                  value={extractedData.price}
                  onChange={(e) => setExtractedData({ ...extractedData, price: e.target.value })}
                  className="w-full mt-1 neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Código de Barras</label>
                <input
                  type="text"
                  value={extractedData.barcode}
                  onChange={(e) => setExtractedData({ ...extractedData, barcode: e.target.value })}
                  className="w-full mt-1 neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isProcessing && (
          <div className="space-y-3">
            {extractedData ? (
              <>
                <button
                  onClick={handleConfirm}
                  className="neo-button w-full py-4 bg-secondary text-secondary-foreground font-bold text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  ✅ Confirmar y Rellenar Formulario
                </button>

                <button
                  onClick={() => {
                    setExtractedData(null);
                    setImage(null);
                  }}
                  className="neo-button w-full py-3 bg-muted text-foreground font-bold text-sm flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  🔄 Escanear Otra Vez
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCameraCapture}
                  className="neo-button w-full py-4 bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  📷 Tomar Foto del Producto
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o</span>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="neo-button w-full py-4 bg-secondary text-secondary-foreground font-bold text-base flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  📁 Subir Imagen desde Archivo
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}

        {/* Success Message */}
        {status === "✅ Análisis completado" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="neo-inset p-4 border-2 border-secondary/30 bg-secondary/10 rounded-lg flex items-start gap-2"
          >
            <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">
                ¡Datos extraídos exitosamente!
              </p>
              <p className="text-xs text-muted-foreground">
                El formulario se completará automáticamente...
              </p>
            </div>
          </motion.div>
        )}

        {/* Info */}
        <div className="neo-inset p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Toma una foto clara del producto con buena iluminación. 
            El sistema analizará la imagen para extraer nombre, precio y código de barras automáticamente.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
