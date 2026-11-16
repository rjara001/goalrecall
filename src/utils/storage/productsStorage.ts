import { Product } from "../../types";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-myfeedin",
    userId: "usr-guest",
    title: "Myfeedin",
    tagline: "Widget Multi-Tenant de Feedback",
    description:
      "Sistema de captura de feedback e integración por correo en tiempo real para aplicaciones SaaS. Widget embebible con carga asíncrona ligera.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    liveUrl: "https://myfeedin.com",
    repoUrl: "https://github.com/alexmorgan/myfeedin-core",
    techStack: ["React", "Web Components", "Firebase", "Resend", "Tailwind CSS"],
    isPublic: true,
    createdAt: "2026-03-15T12:00:00.000Z",
    badge: "SaaS / Propio",
    relatedAchievementIds: [],
  },
  {
    id: "prod-sentinel",
    userId: "usr-guest",
    title: "CloudTrace Sentinel",
    tagline: "Motor de Observabilidad & Detección de Anomalías p99",
    description:
      "Pipeline distribuido para ingestión de telemetría en tiempo real y alertas tempranas de degradación con Redis Cluster y OpenTelemetry.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    liveUrl: "https://sentinel.cloudtrace.io",
    repoUrl: "https://github.com/alexmorgan/cloudtrace-sentinel",
    techStack: ["Go", "Redis Cluster", "OpenTelemetry", "Prometheus", "Docker"],
    isPublic: true,
    createdAt: "2026-01-20T10:30:00.000Z",
    badge: "Open Source / Infra",
    relatedAchievementIds: [],
  },
];

export const getStoredProducts = (): Product[] => {
  return workspaceState.products;
};

export const saveProducts = (products: Product[]): void => {
  workspaceState.products = products;
  notifyCloudSync();
};

export const addProduct = (product: Omit<Product, "id" | "createdAt">): Product => {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    isPublic: product.isPublic ?? true,
  };
  saveProducts([newProduct, ...getStoredProducts()]);
  return newProduct;
};

export const updateProduct = (updated: Product): void => {
  saveProducts(
    getStoredProducts().map((p) =>
      p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p
    )
  );
};

export const deleteProduct = (id: string): void => {
  saveProducts(getStoredProducts().filter((p) => p.id !== id));
};

export const toggleProductPublic = (id: string): Product | null => {
  const current = getStoredProducts();
  const index = current.findIndex((p) => p.id === id);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      isPublic: !current[index].isPublic,
      updatedAt: new Date().toISOString(),
    };
    saveProducts(current);
    return current[index];
  }
  return null;
};
