import React from "react";
import { Plus, Rocket } from "lucide-react";
import { LogEntry, Product } from "../../types";
import { ProductCard } from "../ProductCard";

interface TimelineProductsTabProps {
  products: Product[];
  logs: LogEntry[];
  onOpenNewProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onToggleProductPublic?: (id: string) => void;
}

export const TimelineProductsTab: React.FC<TimelineProductsTabProps> = ({
  products,
  logs,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductPublic,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            <span>Gestión de Productos & Showcase ({products.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registra tus aplicaciones, librerías y SaaS, define su stack tecnológico y vincúlalas con
            tus logros de arquitectura (Metodología Google XYZ).
          </p>
        </div>

        {onOpenNewProduct && (
          <button
            type="button"
            onClick={onOpenNewProduct}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto</span>
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-3">
          <Rocket className="w-9 h-9 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Aún no has registrado productos en tu bitácora
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Muestra tus proyectos personales, SaaS, widgets y MVPs con sus capturas de pantalla,
            repositorios y viñetas de logros técnicos.
          </p>
          {onOpenNewProduct && (
            <button
              type="button"
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Producto</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => {
            const relatedLogs = logs.filter((l) => prod.relatedAchievementIds?.includes(l.id));
            return (
              <ProductCard
                key={prod.id}
                product={prod}
                relatedLogs={relatedLogs}
                isOwner={true}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onTogglePublic={onToggleProductPublic}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
