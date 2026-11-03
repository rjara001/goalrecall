import React, { useState, useRef } from "react";
import { 
  X, 
  Camera, 
  UploadCloud, 
  Globe, 
  Sparkles, 
  Check, 
  RotateCcw, 
  AlertCircle,
  Eye,
  UserCheck
} from "lucide-react";
import { compressAndCropAvatar } from "../utils/imageCompressor";
import { useI18n } from "../i18n";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  {
    label: "Senior Architect",
    category: "Pro",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "Lead Engineer",
    category: "Dev",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "Systems Architect",
    category: "Pro",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "Full Stack Lead",
    category: "Dev",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "Tech Director",
    category: "Lead",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "DevOps & Cloud",
    category: "Cloud",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "Cybersecurity Pro",
    category: "Sec",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
  },
  {
    label: "Product Strategist",
    category: "Exec",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
  },
];

const AVATAR_TEXTS: Record<string, {
  tabUpload: string;
  tabPresets: string;
  tabUrl: string;
  currentPreview: string;
  cropDesc: string;
  resetBtn: string;
  dragTitle: string;
  dragDesc: string;
  presetsDesc: string;
  urlLabel: string;
  loadBtn: string;
  ghPreset: string;
  ghPresetBtn: string;
  processing: string;
}> = {
  es: {
    tabUpload: "Subir Archivo Local",
    tabPresets: "Avatares Profesionales",
    tabUrl: "Enlace / URL",
    currentPreview: "Vista Previa Actual",
    cropDesc: "Recorte cuadrado automático en alta definición",
    resetBtn: "Restablecer",
    dragTitle: "Arrastra tu foto aquí o haz clic para seleccionarla",
    dragDesc: "Soporta PNG, JPG o WebP. Se recortará automáticamente al centro en formato cuadrado y se optimizará sin perder resolución.",
    presetsDesc: "Selecciona una foto profesional curada para ingenieros y arquitectos de software:",
    urlLabel: "URL de Imagen Externa (GitHub, Gravatar, LinkedIn o CDN)",
    loadBtn: "Cargar",
    ghPreset: "Usar avatar público de GitHub",
    ghPresetBtn: "Usar GitHub Demo",
    processing: "Procesando y optimizando imagen...",
  },
  en: {
    tabUpload: "Upload Local File",
    tabPresets: "Professional Avatars",
    tabUrl: "Link / URL",
    currentPreview: "Current Preview",
    cropDesc: "Automatic high-definition square crop",
    resetBtn: "Reset",
    dragTitle: "Drag your photo here or click to select",
    dragDesc: "Supports PNG, JPG, or WebP. Auto-centered square crop optimized with zero quality loss.",
    presetsDesc: "Select a curated professional photo for software engineers and architects:",
    urlLabel: "External Image URL (GitHub, Gravatar, LinkedIn or CDN)",
    loadBtn: "Load",
    ghPreset: "Use public GitHub avatar",
    ghPresetBtn: "Use GitHub Demo",
    processing: "Processing and optimizing image...",
  },
  pt: {
    tabUpload: "Carregar Ficheiro Local",
    tabPresets: "Avatares Profissionais",
    tabUrl: "Ligação / URL",
    currentPreview: "Pré-visualização Atual",
    cropDesc: "Recorte quadrado automático em alta definição",
    resetBtn: "Repor",
    dragTitle: "Arraste a sua foto aqui ou clique para selecionar",
    dragDesc: "Suporta PNG, JPG ou WebP com recorte automático centrado.",
    presetsDesc: "Selecione uma foto profissional para engenheiros:",
    urlLabel: "URL de Imagem Externa",
    loadBtn: "Carregar",
    ghPreset: "Usar avatar do GitHub",
    ghPresetBtn: "Usar Demo GitHub",
    processing: "A processar imagem...",
  },
  fr: {
    tabUpload: "Téléverser Fichier Local",
    tabPresets: "Avatars Professionnels",
    tabUrl: "Lien / URL",
    currentPreview: "Aperçu Actuel",
    cropDesc: "Recadrage carré automatique en haute définition",
    resetBtn: "Réinitialiser",
    dragTitle: "Glissez votre photo ici ou cliquez pour choisir",
    dragDesc: "Supporte PNG, JPG ou WebP avec recadrage automatique.",
    presetsDesc: "Sélectionnez une photo professionnelle :",
    urlLabel: "URL d'Image Externe",
    loadBtn: "Charger",
    ghPreset: "Utiliser l'avatar GitHub",
    ghPresetBtn: "Démo GitHub",
    processing: "Traitement de l'image...",
  },
  de: {
    tabUpload: "Lokale Datei Hochladen",
    tabPresets: "Professionelle Avatare",
    tabUrl: "Link / URL",
    currentPreview: "Aktuelle Vorschau",
    cropDesc: "Automatischer quadratischer HD-Zuschnitt",
    resetBtn: "Zurücksetzen",
    dragTitle: "Foto hierher ziehen oder zum Auswählen klicken",
    dragDesc: "Unterstützt PNG, JPG oder WebP mit automatischem Zuschnitt.",
    presetsDesc: "Wählen Sie ein professionelles Foto für Software-Ingenieure:",
    urlLabel: "Externe Bild-URL",
    loadBtn: "Laden",
    ghPreset: "Öffentlichen GitHub-Avatar verwenden",
    ghPresetBtn: "GitHub Demo",
    processing: "Bild wird optimiert...",
  },
  ja: {
    tabUpload: "ローカルファイルをアップロード",
    tabPresets: "プロフェッショナルアバター",
    tabUrl: "リンク / URL",
    currentPreview: "現在のプレビュー",
    cropDesc: "高解像度自動正方形クロップ",
    resetBtn: "リセット",
    dragTitle: "写真をドラッグ＆ドロップ、またはクリックして選択",
    dragDesc: "PNG、JPG、WebP対応。画質を落とさず自動中央クロップ。",
    presetsDesc: "エンジニア向けに厳選されたプロフェッショナル写真を選択：",
    urlLabel: "外部画像URL (GitHub, Gravatar, LinkedIn等)",
    loadBtn: "読み込む",
    ghPreset: "GitHubの公開アバターを使用",
    ghPresetBtn: "GitHubデモを使用",
    processing: "画像を処理・最適化中...",
  },
};

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSaveAvatar,
}) => {
  const { t, language } = useI18n();
  const avt = AVATAR_TEXTS[language] || AVATAR_TEXTS.en;
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "presets">("upload");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file drop / file selection with client canvas compression
  const processImageFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor selecciona un archivo de imagen (PNG, JPG, WEBP, SVG).");
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("La imagen supera el límite de 10 MB. Selecciona una imagen más liviana.");
      }

      const compressedDataUrl = await compressAndCropAvatar(file, {
        maxDimension: 300,
        quality: 0.9,
      });

      setSelectedAvatar(compressedDataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la imagen seleccionada.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = customUrl.trim();
    if (!clean) {
      setErrorMsg("Ingresa una URL de imagen válida.");
      return;
    }
    if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("data:image/")) {
      setErrorMsg("La URL debe comenzar con https:// o http://");
      return;
    }
    setSelectedAvatar(clean);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  const handleResetDefault = () => {
    const defaultUrl = PRESET_AVATARS[0].url;
    setSelectedAvatar(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {t.modals.avatarModalTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.modals.avatarModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Live Preview Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={selectedAvatar}
                  alt={userName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/60 shadow-lg shadow-cyan-950/40 bg-slate-950"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{avt.currentPreview}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {avt.cropDesc}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400 font-mono">Navbar:</span>
                  <img
                    src={selectedAvatar}
                    alt=""
                    className="w-6 h-6 rounded-md object-cover border border-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 font-mono ml-2">Cards:</span>
                  <img
                    src={selectedAvatar}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium transition-colors shrink-0"
              title="Reset avatar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{avt.resetBtn}</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{avt.tabUpload}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "presets"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{avt.tabPresets}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "url"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{avt.tabUrl}</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: File Upload */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                    : "border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/70"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h4 className="text-sm font-bold text-white mb-1">
                  {avt.dragTitle}
                </h4>
                <p className="text-slate-400 text-[11px] max-w-sm mx-auto mb-3">
                  {avt.dragDesc}
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
                  <span>Canvas 300x300</span>
                  <span>•</span>
                  <span>Fast</span>
                  <span>•</span>
                  <span className="text-cyan-300 font-medium">10 MB</span>
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-cyan-300">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">{avt.processing}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Presets Gallery */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400">
                {avt.presetsDesc}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isChosen = selectedAvatar === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(preset.url);
                        setErrorMsg(null);
                      }}
                      className={`relative p-2 rounded-xl border text-left transition-all group ${
                        isChosen
                          ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-24 object-cover rounded-lg mb-2 group-hover:scale-[1.02] transition-transform"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate block text-[11px]">
                          {preset.label}
                        </span>
                        <span className="text-[9px] font-mono text-purple-300 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800/50">
                          {preset.category}
                        </span>
                      </div>
                      {isChosen && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Direct URL */}
          {activeTab === "url" && (
            <form onSubmit={handleApplyUrl} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  {avt.urlLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder={t.modals.avatarUrlPlaceholder}
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    {avt.loadBtn}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  GitHub: <span className="font-mono text-cyan-400">https://github.com/octocat.png</span>
                </p>
              </div>

              {/* Quick Preset for Github */}
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">{avt.ghPreset}</span>
                  <span className="text-slate-400 text-[11px]">GitHub CDN</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const ghUrl = "https://github.com/octocat.png";
                    setCustomUrl(ghUrl);
                    setSelectedAvatar(ghUrl);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
                >
                  {avt.ghPresetBtn}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            {t.common.cancel}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.modals.saveAvatarBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
