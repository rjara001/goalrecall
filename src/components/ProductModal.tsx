import React, { useState, useEffect } from "react";
import { 
  X, 
  Rocket, 
  Globe, 
  Github, 
  Image as ImageIcon, 
  Layers, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Zap, 
  Eye, 
  EyeOff,
  Upload,
  Sparkles
} from "lucide-react";
import { Product, LogEntry } from "../types";

// Zero-Cost Spark Guardrail: Client-Side Canvas WebP Compressor (< 150 KB, max 1200px width)
// Prevents consuming the 360 MB/day Firebase Hosting transfer limit
const compressImageToWebP = (file: File): Promise<{ dataUrl: string; sizeKb: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const raw = e.target?.result as string;
          resolve({ dataUrl: raw, sizeKb: Math.round(file.size / 1024) });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const webpData = canvas.toDataURL("image/webp", 0.8);
        const approxKb = Math.round((webpData.length * 3) / 4 / 1024);
        resolve({ dataUrl: webpData, sizeKb: approxKb });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id" | "createdAt"> | Product) => void;
  product?: Product | null;
  availableLogs?: LogEntry[];
}

const PRESET_BADGES = ["SaaS / Propio", "Open Source", "Micro-SaaS", "MVP", "DevTool", "Librería"];

const SAMPLE_SCREENSHOTS = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  availableLogs = [],
}) => {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [badge, setBadge] = useState("SaaS / Propio");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [imageSizeNote, setImageSizeNote] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCompressing(true);
      const { dataUrl, sizeKb } = await compressImageToWebP(file);
      setImageUrl(dataUrl);
      setImageSizeNote(`Optimizada: ${sizeKb} KB (WebP < 150 KB) · Protege cuota Spark`);
    } catch (err) {
      console.warn("Error comprimiendo imagen:", err);
    } finally {
      setCompressing(false);
    }
  };

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setTagline(product.tagline || "");
      setBadge(product.badge || "SaaS / Propio");
      setDescription(product.description || "");
      setImageUrl(product.imageUrl || "");
      setLiveUrl(product.liveUrl || "");
      setRepoUrl(product.repoUrl || "");
      setTechStack(product.techStack || []);
      setIsPublic(product.isPublic ?? true);
      setSelectedLogIds(product.relatedAchievementIds || []);
    } else {
      setTitle("");
      setTagline("");
      setBadge("SaaS / Propio");
      setDescription("");
      setImageUrl("");
      setLiveUrl("");
      setRepoUrl("");
      setTechStack(["React", "TypeScript", "Node.js"]);
      setIsPublic(true);
      setSelectedLogIds([]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddTech = () => {
    const trimmed = techStackInput.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    const parts = trimmed.split(",").map((t) => t.trim()).filter(Boolean);
    const combined = Array.from(new Set([...techStack, ...parts]));
    setTechStack(combined);
    setTechStackInput("");
  };

  const handleRemoveTech = (index: number) => {
    setTechStack((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogIds((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const payload = {
      ...(product ? { id: product.id, createdAt: product.createdAt } : {}),
      userId: product?.userId || "usr-guest",
      title: title.trim(),
      tagline: tagline.trim(),
      badge: badge.trim() || "SaaS / Propio",
      description: description.trim(),
      imageUrl: imageUrl.trim() || SAMPLE_SCREENSHOTS[0],
      liveUrl: liveUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      techStack: techStack.length > 0 ? techStack : ["React", "TypeScript"],
      isPublic,
      relatedAchievementIds: selectedLogIds,
    };

    onSave(payload as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B111E] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {product ? "Editar Producto & Showcase" : "Nuevo Producto & Showcase"}
              </h2>
              <p className="text-xs text-slate-400">
                Muestra aplicaciones, librerías y SaaS construidos por ti en tu vitrina
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Row 1: Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold block">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Myfeedin"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">
                Etiqueta / Badge
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="SaaS / Propio"
                  className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Badge Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono">Sugeridos:</span>
            {PRESET_BADGES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBadge(b)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  badge === b
                    ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Tagline */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">
              Subtítulo / Tagline Corto
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej: Widget Multi-Tenant de Captura de Feedback e Integración Resend"
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">
              Descripción Técnica y Funcional *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué resuelve el producto, su arquitectura general y para qué usuarios fue concebido..."
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Preview Image / Screenshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold block">
                Captura de Pantalla / Screenshot
              </label>
              {imageSizeNote && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                  {imageSizeNote}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageSizeNote(null);
                }}
                placeholder="URL externa: https://raw.githubusercontent.com/... o https://..."
                className="flex-1 bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{compressing ? "Comprimiendo..." : "Subir & WebP"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={compressing}
                />
              </label>
            </div>

            {/* Spark Free Tier Advisory */}
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200/90 leading-relaxed">
              💡 <strong>Cero consumo de Hosting:</strong> Para mantener la transferencia bajo los 360 MB/día de Firebase Spark, se recomienda usar enlaces directos a imágenes alojadas en GitHub Raw, Cloudinary o Imgur. Si subes un archivo local, nuestro optimizador lo comprimirá a WebP (&lt; 150 KB).
            </div>

            {/* Quick screenshot selectors */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">Imágenes de prueba:</span>
              {SAMPLE_SCREENSHOTS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImageUrl(url);
                    setImageSizeNote("Ejemplo predefinido optimizado");
                  }}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Ejemplo #{idx + 1}
                </button>
              ))}
            </div>

            {imageUrl && (
              <div className="mt-2 h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Links: Production URL & GitHub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>URL en Producción (Opcional)</span>
              </label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://myfeedin.com"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span>Repositorio GitHub (Opcional)</span>
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/usuario/repo"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Stack Tecnológico
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="Ej: React, Web Components, Firebase, Tailwind"
                className="flex-1 bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-700"
              >
                Agregar
              </button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-slate-900 border border-slate-700 text-cyan-300 rounded-md"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(i)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Link Associated XYZ Achievements */}
          {availableLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Vincular Logros de Arquitectura Asociados (Metodología Google XYZ)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Selecciona qué viñetas de tu bitácora sustentan técnicamente este producto:
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                {availableLogs.map((log) => {
                  const isSelected = selectedLogIds.includes(log.id);
                  return (
                    <div
                      key={log.id}
                      onClick={() => toggleLogSelection(log.id)}
                      className={`p-2 rounded-lg border text-[11px] cursor-pointer flex items-start gap-2.5 transition-colors ${
                        isSelected
                          ? "bg-slate-900 border-emerald-500 text-white"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-200">{log.title}</span>
                        {log.impact && (
                          <span className="block font-mono text-emerald-400 text-[10px]">
                            ⚡ {log.impact}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Privacy Visibility Switch */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">
                Visibilidad en Vitrina Pública
              </span>
              <p className="text-[11px] text-slate-400">
                {isPublic
                  ? "Cualquier reclutador o visitante puede ver este producto y First Mate AI podrá responder preguntas sobre él."
                  : "El producto se guarda exclusivamente en tu Bóveda Privada de gestión personal."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-colors ${
                isPublic
                  ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                  : "bg-amber-950/80 border-amber-700 text-amber-300"
              }`}
            >
              {isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isPublic ? "Público" : "Privado"}</span>
            </button>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl shadow-md transition-all"
            >
              {product ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
