import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("barcode-reader-" + Date.now());

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          setLastScanned(decodedText);
          onScan(decodedText);
          // Brief vibration feedback
          if (navigator.vibrate) navigator.vibrate(100);
        },
        () => {
          // ignore scan failures
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      setError(
        err?.message?.includes("Permission")
          ? "Se necesita permiso para usar la cámara. Actívala en la configuración del navegador."
          : "No se pudo iniciar la cámara. Verifica que tu dispositivo tenga cámara disponible."
      );
    }
  }, [onScan]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="neo-card p-4 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground text-sm">Escáner de Código de Barras</h3>
        </div>
        <button
          onClick={() => { stopScanner(); onClose(); }}
          className="neo-button w-8 h-8 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Scanner view */}
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-video mb-3">
        <div id={containerRef.current} className="w-full h-full" />
        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <CameraOff className="w-10 h-10 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Cámara inactiva</p>
          </div>
        )}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-72 h-36 border-2 border-primary rounded-lg animate-pulse" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="neo-inset p-3 mb-3 text-xs text-destructive font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Last scanned */}
      <AnimatePresence>
        {lastScanned && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="neo-inset p-3 mb-3 flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-secondary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Último código escaneado:</p>
              <p className="text-xs font-bold text-foreground font-mono">{lastScanned}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-2">
        {!isScanning ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startScanner}
            className="neo-button flex-1 py-3 bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            📷 ESCANEAR BARCODE
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopScanner}
            className="neo-button flex-1 py-3 bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            <CameraOff className="w-4 h-4" />
            DETENER CÁMARA
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
