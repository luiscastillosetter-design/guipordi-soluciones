export interface ProjectItem {
  id: string;
  slug: string;
  date: string;
  highlightBadge: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  desktopImg: string;
  mobileImg: string;
  accentRGB: [number, number, number];
  description: string;
  architecture: string[];
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "01",
    slug: "todomax",
    date: "2026.10.28",
    highlightBadge: "E-Commerce Mayorista & Detal con Caché Redis y Afiliados",
    title: "Importadora TodoMax — Plataforma E-Commerce & Admin",
    subtitle: "IMPORTADORA TODOMAX / SISTEMA MAESTRO DE COMERCIO",
    category: "E-Commerce",
    tags: ["Next.js", "Redis Cache", "Panel Admin", "Afiliados"],
    desktopImg: "/projects/todomax-ordenador.png",
    mobileImg: "/projects/todomax-mobil.png",
    accentRGB: [0.05, 0.45, 0.36],
    description:
      "Plataforma integral de comercio electrónico mayorista y detal diseñada para alto tráfico. Incorpora caché distribuido en Redis, sistema automatizado de comisiones para afiliados, previsualización de video en catálogo y panel administrativo en tiempo real.",
    architecture: [
      "Catálogo reactivo de alta velocidad con hidratación instantánea y búsqueda predictiva.",
      "Panel de control administrativo conectado bidireccionalmente al inventario y pedidos.",
      "Módulo de afiliados con trazabilidad de conversiones y liquidación de comisiones.",
    ],
  },
  {
    id: "02",
    slug: "energykva",
    date: "2026.10.18",
    highlightBadge: "Sincronización Industrial ERP Firebird SQL (3.375 Equipos)",
    title: "Energy KVA — E-Commerce Industrial Conectado a ERP",
    subtitle: "ENERGY KVA / INFRAESTRUCTURA B2B & SINCRONIZACIÓN VALERY",
    category: "E-Commerce",
    tags: ["Next.js", "Supabase", "Python Sync", "Firebird SQL"],
    desktopImg: "/projects/energykva-ordenador.png",
    mobileImg: "/projects/energykva-mobil.png",
    accentRGB: [0.06, 0.38, 0.56],
    description:
      "Ecosistema B2B de comercio industrial sincronizado silenciosamente cada 10 minutos con la base de datos local Firebird SQL (Valery), manteniendo 3.375 productos, existencias por depósito y precios actualizados en la nube.",
    architecture: [
      "Puente de sincronización automatizado en Python entre servidor local Firebird SQL y API Cloud.",
      "Base de datos en Supabase optimizada para miles de referencias técnicas e industriales.",
      "Flujo de órdenes corporativas con validación de comprobantes y despacho directo por WhatsApp.",
    ],
  },
  {
    id: "03",
    slug: "rapitravel",
    date: "2026.10.12",
    highlightBadge: "Super-App de Movilidad Urbana, Extraurbana y Fletes",
    title: "Rapitravel — Plataforma de Movilidad & Logística",
    subtitle: "RAPITRAVEL / ECOSISTEMA DE TRANSPORTE MULTISERVICIO",
    category: "Apps & SaaS",
    tags: ["Movilidad", "Traslado Mascotas", "Fletes", "Geolocalización"],
    desktopImg: "/projects/rapitravel-ordenador.png",
    mobileImg: "/projects/rapitravel-mobil.png",
    accentRGB: [0.36, 0.16, 0.54],
    description:
      "Aplicación y plataforma operativa para movilidad urbana, viajes interurbanos, traslado especializado de mascotas y transporte de carga pesada, con cotización dinámica y seguimiento de unidades.",
    architecture: [
      "Arquitectura multiservicio para viajes urbanos, extraurbanos, mascotas y carga.",
      "Interfaz dual optimizada para uso táctil rápido en ruta y monitoreo desde central.",
      "Despacho ágil con cálculo inteligente de tarifas y conexión directa conductor-pasajero.",
    ],
  },
  {
    id: "04",
    slug: "materialesymetales",
    date: "2026.10.05",
    highlightBadge: "Catálogo Digital Siderúrgico y Cotizador Ferretero B2B",
    title: "Materiales y Metales Acarigua — Portal Siderúrgico",
    subtitle: "MATERIALES Y METALES ACARIGUA / ACERO & CONSTRUCCIÓN",
    category: "E-Commerce",
    tags: ["Next.js", "Catálogo B2B", "Tailwind CSS", "Siderúrgica"],
    desktopImg: "/projects/materialesymetales-ordenador.png",
    mobileImg: "/projects/materialesymetales-mobil.png",
    accentRGB: [0.52, 0.28, 0.08],
    description:
      "Plataforma comercial para el sector ferretero y siderúrgico que digitaliza el inventario de perfiles estructurales, láminas, tuberías y materiales de construcción con cotización inmediata.",
    architecture: [
      "Clasificación técnica por calibres, dimensiones y familias de acero estructural.",
      "Experiencia responsive dual pensada para ingenieros en obra y compradores corporativos.",
      "Embudo de cotización directa integrado al flujo comercial de ventas.",
    ],
  },
  {
    id: "05",
    slug: "apexhub",
    date: "2026.09.24",
    highlightBadge: "Sistema Interactivo de Gestión para Centros Fitness",
    title: "Apex Hub Gym — Gestión Deportiva & Alto Rendimiento",
    subtitle: "APEX HUB GYM / PLATAFORMA INTERACTIVA DE ENTRENAMIENTO",
    category: "Apps & SaaS",
    tags: ["Fitness SaaS", "UI Interactiva", "Membresías", "React"],
    desktopImg: "/projects/apexhub-ordenador.png",
    mobileImg: "/projects/apexhub-mobil.png",
    accentRGB: [0.48, 0.11, 0.22],
    description:
      "Aplicación web interactiva para la administración de centros de entrenamiento, seguimiento de rutinas, planes nutricionales y control de membresías con estética deportiva de alto contraste.",
    architecture: [
      "Panel interactivo de programas de entrenamiento, métricas y evolución física.",
      "Gestión centralizada de atletas, planes de suscripción y control de acceso.",
      "Diseño visual de alta energía adaptado a pantallas de gimnasio y teléfonos móviles.",
    ],
  },
  {
    id: "06",
    slug: "bkelectronics",
    date: "2026.09.15",
    highlightBadge: "Identidad Corporativa y E-Commerce de Tecnología",
    title: "BK Electronics — Tienda Virtual de Electrónica",
    subtitle: "BK ELECTRONICS / BRANDING & CATÁLOGO NEXT.JS",
    category: "E-Commerce",
    tags: ["Next.js", "Branding", "Electrónica", "UI/UX"],
    desktopImg: "/projects/bkelectronics-ordenador.png",
    mobileImg: "/projects/bkelectronics-mobil.png",
    accentRGB: [0.09, 0.30, 0.56],
    description:
      "Desarrollo integral de identidad visual y plataforma e-commerce para comercialización de equipos electrónicos y hardware, combinando velocidad de carga instantánea y fichas de producto estilo marketplace.",
    architecture: [
      "Diseño de marca e interfaz de usuario con microinteracciones de precisión.",
      "Catálogo modular en Next.js con filtrado instantáneo por categorías tecnológicas.",
      "Checkout conversacional optimizado para maximizar el cierre de ventas.",
    ],
  },
  {
    id: "07",
    slug: "jarvis",
    date: "2026.09.02",
    highlightBadge: "Agente Autónomo de Voz y Texto con Inteligencia Artificial",
    title: "Jarvis IA — Asistente Ejecutivo Multimodal",
    subtitle: "JARVIS AGENT / AUTOMATIZACIÓN CON IA, NEON DB & VOZ",
    category: "IA & Cloud",
    tags: ["IA Generativa", "Neon DB", "Telegram Voice", "Cloudflare"],
    desktopImg: "/projects/jarvis-ordenador.png",
    mobileImg: "/projects/jarvis-mobil.png",
    accentRGB: [0.05, 0.44, 0.48],
    description:
      "Agente inteligente de gestión por voz y texto capaz de procesar comandos naturales, administrar tareas operativas y consultar bases de datos en la nube en tiempo real.",
    architecture: [
      "Procesamiento multimodal de notas de voz y texto con modelos de lenguaje avanzados.",
      "Persistencia de memoria contextual sobre PostgreSQL serverless en Neon DB.",
      "Túneles seguros en Cloudflare para ejecución de flujos de trabajo sin latencia.",
    ],
  },
  {
    id: "08",
    slug: "iviluz",
    date: "2026.08.20",
    highlightBadge: "Plataforma Digital Ministerial y Comunidad Interactiva",
    title: "Iglesia Iviluz — Ecosistema Digital & Eventos",
    subtitle: "IGLESIA IVILUZ / PORTAL DE MEDIOS Y COMUNIDAD",
    category: "Apps & SaaS",
    tags: ["Plataforma Web", "Medios", "Eventos", "Diseño Dual"],
    desktopImg: "/projects/iviluz-ordenador.png",
    mobileImg: "/projects/iviluz-mobil.png",
    accentRGB: [0.26, 0.20, 0.54],
    description:
      "Portal digital moderno diseñado para conectar a la comunidad, gestionar eventos, centralizar transmisiones y ofrecer una experiencia de navegación cálida y veloz tanto en móvil como en escritorio.",
    architecture: [
      "Centro multimedia integrado para prédicas, recursos y agenda de actividades.",
      "Arquitectura limpia con tiempos de respuesta inmediatos en redes móviles.",
      "Sistema autogestionable para actualización continua de contenidos y noticias.",
    ],
  },
  {
    id: "09",
    slug: "guipordi",
    date: "2026.11.02",
    highlightBadge: "Arquitectura de Software, Experiencias WebGL & IA",
    title: "GuiporDI Soluciones — Agencia & Laboratorio de Software",
    subtitle: "GUIPORDI SOLUCIONES / ECOSISTEMAS DIGITALES A MEDIDA",
    category: "IA & Cloud",
    tags: ["WebGL / Three.js", "Next.js", "SaaS", "IA Empresarial"],
    desktopImg: "/projects/guipordi-ordenador.png",
    mobileImg: "/projects/guipordi-mobil.png",
    accentRGB: [0.035, 0.39, 0.25],
    description:
      "Casa matriz de ingeniería de software, diseño de experiencias inmersivas 3D, tiendas virtuales de alto rendimiento y automatización con inteligencia artificial para marcas líderes.",
    architecture: [
      "Renderizado WebGL en tiempo real con shaders GLSL personalizados y física óptica.",
      "Desarrollo Full-Stack 100% código propio en Next.js, TypeScript, Python y Supabase.",
      "Diseño dual milimétrico auditado para monitores panorámicos y dispositivos móviles.",
    ],
  },
];