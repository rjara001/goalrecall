import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import fs from "fs";
import path from "path";

async function generateMasterPlanDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "CAREER OS — PLAN MAESTRO & ESPECIFICACIÓN",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Centro Único de Trayectoria, Ingestor de Ofertas & Generador de CVs Personalizados",
                italics: true,
                color: "555555",
                size: 24,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Divider
          new Paragraph({
            text: "─────────────────────────────────────────────────────────────",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Section 1: Executive Summary
          new Paragraph({
            text: "1. Declaración de Visión y Propósito",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Career OS ",
                bold: true,
              }),
              new TextRun({
                text: "es una plataforma integral diseñada para ingenieros y líderes técnicos que resuelve de raíz la fragmentación de la carrera profesional. El principio rector es: ",
              }),
              new TextRun({
                text: "«Registra tus empresas y logros una sola vez en una fuente de verdad única; carga cualquier oferta laboral y genera instantáneamente una versión personalizada y optimizada para esa vacante».",
                bold: true,
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 2: El Problema Actual
          new Paragraph({
            text: "2. Diagnóstico del Problema Actual",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Desincronización y Mantenimiento Manual: ",
                bold: true,
              }),
              new TextRun({
                text: "Cuando un profesional completa un logro técnico de impacto en su trabajo, debe actualizar manualmente su CV general, sus diferentes variantes (Backend, Full-Stack, Tech Lead, etc.), su portafolio web y LinkedIn. Mantener múltiples documentos Word o PDF desactualizados es una carga constante.",
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Falta de Adaptación a Ofertas Específicas (Tailoring): ",
                bold: true,
              }),
              new TextRun({
                text: "Cada reclutador y sistema ATS busca palabras clave, tecnologías y enfoques distintos. Un CV genérico es descartado rápidamente; pero adaptar un CV a mano para cada empresa toma horas de edición repetitiva.",
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Pérdida de Trazabilidad en Postulaciones: ",
                bold: true,
              }),
              new TextRun({
                text: "Tras semanas de postular, el candidato no recuerda qué versión de CV envió a qué empresa, qué requisitos pedían originalmente, ni qué preguntas técnicas le formularon durante las entrevistas.",
              }),
            ],
            spacing: { after: 240 },
          }),

          // Section 3: Arquitectura Conceptual
          new Paragraph({
            text: "3. Arquitectura del Sistema: Modelo de 3 Capas",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "CAPA 1: Single Source of Truth (Fuente Central de Verdad)",
                bold: true,
                size: 22,
                color: "2E4057",
              }),
            ],
            spacing: { before: 100, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Estructura Jerárquica Dual: ",
                bold: true,
              }),
              new TextRun({
                text: "Todo logro técnico, habilidad o viñeta siempre cuelga de una ",
              }),
              new TextRun({
                text: "Experiencia / Empresa",
                bold: true,
              }),
              new TextRun({
                text: " (incluyendo empresas formales o contenedores para 'Proyectos Personales / Consultoría'). La Experiencia aporta el contexto macro (empresa, cargo, periodo, ubicación), mientras que los Logros aportan las métricas atómicas cuantificadas.",
              }),
            ],
            spacing: { after: 160 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "CAPA 2: Ingestor de Ofertas & Generador de Variantes",
                bold: true,
                size: 22,
                color: "2E4057",
              }),
            ],
            spacing: { before: 100, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Las variantes son VISTAS dinámicas que nacen de una Oferta Laboral: ",
                bold: true,
              }),
              new TextRun({
                text: "El usuario pega el texto o enlace de una vacante. El motor analiza los requisitos técnicos solicitados (ej. Go, microservicios, pagos, alta concurrencia) y selecciona/prioriza automáticamente de la base de verdad los logros más relevantes para ese puesto, sugiriendo el titular y resumen ejecutivo más efectivo.",
              }),
            ],
            spacing: { after: 160 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "CAPA 3: Exportación Multi-Formato & Application Tracker",
                bold: true,
                size: 22,
                color: "2E4057",
              }),
            ],
            spacing: { before: 100, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Exportación Inmediata: ",
                bold: true,
              }),
              new TextRun({
                text: "Generación de PDF ATS-compliant (1 a 2 páginas sin elementos incompatibles con filtros automáticos) y archivo DOCX editable.",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Seguimiento de Postulaciones: ",
                bold: true,
              }),
              new TextRun({
                text: "Cada postulación queda registrada con la oferta cargada, la versión exacta del CV exportado, notas del proceso y banco de preguntas de entrevista.",
              }),
            ],
            spacing: { after: 240 },
          }),

          // Section 4: Desglose de Mini-Features
          new Paragraph({
            text: "4. Hoja de Ruta: Desglose de Mini-Features Secuenciales",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Mini-Feature 1: Modelo Dual de Datos (Experiencias + Logros Vinculados)",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 80, after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Creación formal de la entidad WorkExperience (empresa, rol, fechas, ubicación, contexto).\n• Relación 1-a-N: Los logros atómicos pertenecen estrictamente a una experiencia o a un contenedor de proyectos personales.\n• Migración de los datos actuales en almacenamiento local y sincronización con el extractor de CV.",
              }),
            ],
            spacing: { after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Mini-Feature 2: Gestor Visual de Trayectoria (Empresas & Logros)",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 80, after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Interfaz para gestionar la cronología de empresas y roles.\n• Capacidad de agregar, editar o reorganizar experiencias y crear nuevos logros directamente bajo cada empresa.\n• Filtro rápido por empresa/tecnología.",
              }),
            ],
            spacing: { after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Mini-Feature 3: Ingestor de Ofertas Laborales & Matcher Inteligente",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 80, after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Interfaz para pegar la descripción de una vacante (Job Description).\n• Extracción de requerimientos clave, stack tecnológico y nivel de seniority de la oferta.\n• Algoritmo de coincidencia que selecciona los logros reales más pertinentes del historial del usuario para esa oferta.",
              }),
            ],
            spacing: { after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Mini-Feature 4: Vista Previa de CV Adaptado & Exportador (PDF + DOCX)",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 80, after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Visualizador en tiempo real de la versión adaptada a la oferta.\n• Capacidad de activar/desactivar o reordenar viñetas antes de exportar.\n• Motor de exportación a PDF ATS-compliant (1-2 páginas) y DOCX.",
              }),
            ],
            spacing: { after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Mini-Feature 5: Módulo de Aplicaciones & Seguimiento (Job Tracker)",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 80, after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Ficha de postulación con empresa, oferta original y versión de CV utilizada.\n• Registro de etapas (Postulado, Entrevista Técnica, Negociación, etc.).\n• Banco de preguntas de entrevista y notas de seguimiento.",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Section 5: Regla de Oro de Veracidad
          new Paragraph({
            text: "5. Principios de Calidad y Veracidad Estricta",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "1. Cero Datos Ficticios: ",
                bold: true,
              }),
              new TextRun({
                text: "El sistema jamás inventará métricas, empresas o porcentajes que no hayan sido validados o registrados por el candidato.\n",
              }),
              new TextRun({
                text: "2. Control Total del Usuario: ",
                bold: true,
              }),
              new TextRun({
                text: "El usuario tiene la última palabra sobre qué viñetas incluir en cada CV generado y puede afinar cualquier texto antes de exportar.\n",
              }),
              new TextRun({
                text: "3. Privacidad Absoluta (Local-First): ",
                bold: true,
              }),
              new TextRun({
                text: "Los datos de empresas, compensaciones, ofertas y proyectos permanecen en el sandbox privado del usuario.",
              }),
            ],
            spacing: { after: 300 },
          }),

          // Footer info
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Documento generado por Career OS Architecture Engine · Versión 1.0",
                italics: true,
                size: 18,
                color: "888888",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.resolve(publicDir, "Career_OS_Plan_Maestro.docx");
  const rootPath = path.resolve(process.cwd(), "Career_OS_Plan_Maestro.docx");
  
  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(rootPath, buffer);
  console.log(`Documento DOCX generado exitosamente en:\n - ${outputPath}\n - ${rootPath}`);
}

generateMasterPlanDocx().catch(console.error);
