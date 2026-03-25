import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Lock, User, AlertCircle, Eye, EyeOff, Mail, CheckCircle, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login, loginWithGoogle, loading, error } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Google Sign-In
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Registro
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  // Cargar Google Sign-In
  useEffect(() => {
    // Verificar si el script de Google ya está cargado
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogle();
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, []);

  const initializeGoogle = () => {
    const google = (window as any).google;
    if (!google) return;

    google.accounts.id.initialize({
      client_id: "717364900984-dnp24s9n53kl5stl90btngmf7ppl62kl.apps.googleusercontent.com",
      callback: handleGoogleResponse,
      auto_select: false,
      allowed_parent_origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
    });

    // Renderizar botón
    const buttonContainer = document.getElementById("google-button-container");
    if (buttonContainer && google.accounts.id) {
      try {
        google.accounts.id.renderButton(buttonContainer, {
          theme: "outline",
          size: "large",
          width: 300,
          text: "signin_with",
        });
      } catch (e) {
        console.log("Error renderizando botón de Google:", e);
      }
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true);
    setLoginError(null);
    
    try {
      const result = await loginWithGoogle(response.credential);
      
      if (result.success) {
        if (result.isNewUser) {
          // Usuario nuevo registrado automáticamente
          console.log("Usuario nuevo creado:", result.user);
        }
        onLoginSuccess();
      } else {
        setLoginError(result.error || "Error autenticando con Google");
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const google = (window as any).google;
    if (google && google.accounts.id) {
      google.accounts.id.prompt();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!username.trim() || !password) {
      setLoginError("Por favor ingresa usuario y contraseña");
      return;
    }

    const result = await login(username, password);
    
    if (result.success) {
      onLoginSuccess();
    } else {
      setLoginError(result.error || "Credenciales inválidas");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const { username, email, password, fullName, phone } = registerForm;
    
    if (!username.trim() || !email || !password || !fullName) {
      setLoginError("Por favor completa los campos requeridos");
      return;
    }

    if (password.length < 6) {
      setLoginError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Aquí iría la lógica de registro
    // Por ahora, solo mostramos un mensaje
    setLoginError("Registro no disponible aún. Usa Google o credenciales admin.");
  };

  const handleDemoLogin = () => {
    setUsername("admin");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neo-card p-8 w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Leaf className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            El Inge <span className="text-primary">POS</span> <span className="text-secondary">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gestión Agroquímica v2.0
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {(error || loginError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="neo-inset p-3 border-2 border-destructive/30 bg-destructive/10 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{loginError || error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 p-1 neo-inset rounded-lg">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              mode === "login"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              mode === "register"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "login" ? (
            /* LOGIN FORM */
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Google Sign-In Button */}
              <div className="space-y-2">
                <div
                  id="google-button-container"
                  className="flex justify-center"
                />
                
                {/* Fallback button if Google script fails */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="neo-button w-full py-3 bg-white text-foreground border-2 border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar con Google
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">O con email</span>
                </div>
              </div>

              {/* Traditional Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Usuario
                  </label>
                  <div className="neo-inset flex items-center gap-2 px-3 py-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu usuario"
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Contraseña
                  </label>
                  <div className="neo-inset flex items-center gap-2 px-3 py-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || googleLoading}
                  className="neo-button w-full py-3 bg-primary text-primary-foreground font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      INICIAR SESIÓN
                    </>
                  )}
                </motion.button>
              </form>

              {/* Demo Credentials */}
              <div className="neo-inset p-4 rounded-lg space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  🔑 Acceso de Prueba
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <span className="text-muted-foreground">Usuario:</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded">admin</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <span className="text-muted-foreground">Contraseña:</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded">admin123</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDemoLogin}
                  className="w-full mt-2 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  📋 Copiar credenciales
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* REGISTER FORM */
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center p-4 neo-inset rounded-lg">
                <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground mb-1">
                  Registro Simplificado
                </p>
                <p className="text-xs text-muted-foreground">
                  Usa tu cuenta de Google para registro automático y más seguro
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="neo-button w-full py-3 bg-white text-foreground border-2 border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Registrarse con Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">O registro manual</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    placeholder="usuario123"
                    className="w-full neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••"
                    className="w-full neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="(489) 123-4567"
                    className="w-full neo-inset p-2 text-sm text-foreground bg-transparent outline-none rounded-lg"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="neo-button w-full py-3 bg-secondary text-secondary-foreground font-bold text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  REGISTRARME
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground">
          Desarrollado con ❤️ por Rodrigo H. | Powered by Lovable
        </p>
      </motion.div>
    </div>
  );
}
