import { CatalogItemType, CatalogItemRecord } from "@/lib/supabase";

export interface ProjectItem {
  id: string;
  slug: string;
  date: string;
  catalogType: CatalogItemType;
  highlightBadge: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  desktopImg: string;
  mobileImg: string;
  modalMobileImg: string;
  accentRGB: [number, number, number];
  description: string;
  architecture: string[];
  priceUsd: number;
  billingType: string;
  deliverables: string[];
  demoUrl?: string;
  in3dCarousel?: boolean;
}

// ============================================================================
// 1. LOS 9 PROYECTOS DEL CARRUSEL 3D (CON CLASIFICACIÓN PORTAFOLIO VS DEMO SAAS)
// ============================================================================
export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "01",
    slug: "todomax",
    date: "2026.10.28",
    catalogType: "AMBOS",
    highlightBadge: "E-Commerce Mayorista & Detal con Caché Redis y Afiliados",
    title: "Importadora TodoMax — Plataforma E-Commerce & Admin",
    subtitle: "IMPORTADORA TODOMAX / SISTEMA MAESTRO DE COMERCIO",
    category: "E-Commerce",
    tags: ["Next.js", "Redis Cache", "Panel Admin", "Afiliados"],
    desktopImg: "/projects/todomax-ordenador.png",
    mobileImg: "/projects/todomax-mobil.png",
    modalMobileImg: "/projects/todomax-mobilMD.png",
    accentRGB: [0.05, 0.45, 0.36],
    description:
      "Plataforma integral de comercio electrónico mayorista y detal diseñada para alto tráfico. Incorpora caché distribuido en Redis, sistema automatizado de comisiones para afiliados, previsualización de video en catálogo y panel administrativo en tiempo real.",
    architecture: [
      "Catálogo reactivo de alta velocidad con hidratación instantánea y búsqueda predictiva.",
      "Panel de control administrativo conectado bidireccionalmente al inventario y pedidos.",
      "Módulo de afiliados con trazabilidad de conversiones y liquidación de comisiones.",
    ],
    priceUsd: 1000,
    billingType: "Licencia E-Commerce Full Marca Blanca",
    deliverables: [
      "Tienda Virtual Next.js + Base de Datos Supabase",
      "Panel Admin de Inventario, Pedidos y Tasa BCV",
      "Módulo de Afiliados y Checkout a WhatsApp / GuiporDI Pay",
    ],
    in3dCarousel: true,
  },
  {
    id: "02",
    slug: "energykva",
    date: "2026.10.18",
    catalogType: "PORTAFOLIO",
    highlightBadge: "Sincronización Industrial ERP Firebird SQL (3.375 Equipos)",
    title: "Energy KVA — E-Commerce Industrial Conectado a ERP",
    subtitle: "ENERGY KVA / INFRAESTRUCTURA B2B & SINCRONIZACIÓN VALERY",
    category: "E-Commerce",
    tags: ["Next.js", "Supabase", "Python Sync", "Firebird SQL"],
    desktopImg: "/projects/energykva-ordenador.png",
    mobileImg: "/projects/energykva-mobil.png",
    modalMobileImg: "/projects/energykva-mobilMD.png",
    accentRGB: [0.06, 0.38, 0.56],
    description:
      "Ecosistema B2B de comercio industrial sincronizado silenciosamente cada 10 minutos con la base de datos local Firebird SQL (Valery), manteniendo 3.375 productos, existencias por depósito y precios actualizados en la nube.",
    architecture: [
      "Puente de sincronización automatizado en Python entre servidor local Firebird SQL y API Cloud.",
      "Base de datos en Supabase optimizada para miles de referencias técnicas e industriales.",
      "Flujo de órdenes corporativas con validación de comprobantes y despacho directo por WhatsApp.",
    ],
    priceUsd: 1200,
    billingType: "Desarrollo Corporativo + Conector ERP",
    deliverables: [
      "E-Commerce Industrial B2B",
      "Sincronizador Python Automático con ERP Local",
      "Panel Administrativo de Pedidos",
    ],
    in3dCarousel: true,
  },
  {
    id: "03",
    slug: "rapitravel",
    date: "2026.10.12",
    catalogType: "AMBOS",
    highlightBadge: "Super-App de Movilidad Urbana, Extraurbana y Fletes",
    title: "Rapitravel — Plataforma de Movilidad & Logística",
    subtitle: "RAPITRAVEL / ECOSISTEMA DE TRANSPORTE MULTISERVICIO",
    category: "Apps & SaaS",
    tags: ["Movilidad", "Traslado Mascotas", "Fletes", "Geolocalización"],
    desktopImg: "/projects/rapitravel-ordenador.png",
    mobileImg: "/projects/rapitravel-mobil.png",
    modalMobileImg: "/projects/rapitravel-mobilMD.png",
    accentRGB: [0.36, 0.16, 0.54],
    description:
      "Aplicación y plataforma operativa para movilidad urbana, viajes interurbanos, traslado especializado de mascotas y transporte de carga pesada, con cotización dinámica y seguimiento de unidades.",
    architecture: [
      "Arquitectura multiservicio para viajes urbanos, extraurbanos, mascotas y carga.",
      "Interfaz dual optimizada para uso táctil rápido en ruta y monitoreo desde central.",
      "Despacho ágil con cálculo inteligente de tarifas y conexión directa conductor-pasajero.",
    ],
    priceUsd: 1500,
    billingType: "Plataforma SaaS de Movilidad / Delivery Marca Blanca",
    deliverables: [
      "Web-App PWA de Pasajeros y Solicitud de Servicios",
      "Calculadora de Tarifas por Ruta y Tipo de Vehículo",
      "Panel Central de Despacho y Conductores",
    ],
    in3dCarousel: true,
  },
  {
    id: "04",
    slug: "materialesymetales",
    date: "2026.10.05",
    catalogType: "PORTAFOLIO",
    highlightBadge: "Catálogo Digital Siderúrgico y Cotizador Ferretero B2B",
    title: "Materiales y Metales Acarigua — Portal Siderúrgico",
    subtitle: "MATERIALES Y METALES ACARIGUA / ACERO & CONSTRUCCIÓN",
    category: "E-Commerce",
    tags: ["Next.js", "Catálogo B2B", "Tailwind CSS", "Siderúrgica"],
    desktopImg: "/projects/materialesymetales-ordenador.png",
    mobileImg: "/projects/materialesymetales-mobil.png",
    modalMobileImg: "/projects/materialesymetales-mobilMD.png",
    accentRGB: [0.52, 0.28, 0.08],
    description:
      "Plataforma comercial para el sector ferretero y siderúrgico que digitaliza el inventario de perfiles estructurales, láminas, tuberías y materiales de construcción con cotización inmediata.",
    architecture: [
      "Clasificación técnica por calibres, dimensiones y familias de acero estructural.",
      "Experiencia responsive dual pensada para ingenieros en obra y compradores corporativos.",
      "Embudo de cotización directa integrado al flujo comercial de ventas.",
    ],
    priceUsd: 1000,
    billingType: "Entorno Digital B2B / Ferretero",
    deliverables: [
      "Catálogo Técnico de Materiales y Perfiles",
      "Cotizador B2B Rápido",
      "Panel de Gestión de Inventario",
    ],
    in3dCarousel: true,
  },
  {
    id: "05",
    slug: "apexhub",
    date: "2026.09.24",
    catalogType: "AMBOS",
    highlightBadge: "Sistema Interactivo de Gestión para Centros Fitness",
    title: "Apex Hub Gym — Gestión Deportiva & Alto Rendimiento",
    subtitle: "APEX HUB GYM / PLATAFORMA INTERACTIVA DE ENTRENAMIENTO",
    category: "Apps & SaaS",
    tags: ["Fitness SaaS", "UI Interactiva", "Membresías", "React"],
    desktopImg: "/projects/apexhub-ordenador.png",
    mobileImg: "/projects/apexhub-mobil.png",
    modalMobileImg: "/projects/apexhub-mobilMD.png",
    accentRGB: [0.48, 0.11, 0.22],
    description:
      "Aplicación web interactiva para la administración de centros de entrenamiento, seguimiento de rutinas, planes nutricionales y control de membresías con estética deportiva de alto contraste.",
    architecture: [
      "Panel interactivo de programas de entrenamiento, métricas y evolución física.",
      "Gestión centralizada de atletas, planes de suscripción y control de acceso.",
      "Diseño visual de alta energía adaptado a pantallas de gimnasio y teléfonos móviles.",
    ],
    priceUsd: 850,
    billingType: "Sistema SaaS para Gimnasios y Centros Fitness",
    deliverables: [
      "Plataforma de Rutinas, Clases y Planes Nutricionales",
      "Control de Membresías y Pagos de Atletas",
      "Personalización Completa con el Logo del Gimnasio",
    ],
    in3dCarousel: true,
  },
  {
    id: "06",
    slug: "bkelectronics",
    date: "2026.09.15",
    catalogType: "PORTAFOLIO",
    highlightBadge: "Identidad Corporativa y E-Commerce de Tecnología",
    title: "BK Electronics — Tienda Virtual de Electrónica",
    subtitle: "BK ELECTRONICS / BRANDING & CATÁLOGO NEXT.JS",
    category: "E-Commerce",
    tags: ["Next.js", "Branding", "Electrónica", "UI/UX"],
    desktopImg: "/projects/bkelectronics-ordenador.png",
    mobileImg: "/projects/bkelectronics-mobil.png",
    modalMobileImg: "/projects/bkelectronics-mobilMD.png",
    accentRGB: [0.09, 0.30, 0.56],
    description:
      "Desarrollo integral de identidad visual y plataforma e-commerce para comercialización de equipos electrónicos y hardware, combinando velocidad de carga instantánea y fichas de producto estilo marketplace.",
    architecture: [
      "Diseño de marca e interfaz de usuario con microinteracciones de precisión.",
      "Catálogo modular en Next.js con filtrado instantáneo por categorías tecnológicas.",
      "Checkout conversacional optimizado para maximizar el cierre de ventas.",
    ],
    priceUsd: 1000,
    billingType: "E-Commerce Full + Identidad Visual",
    deliverables: [
      "Tienda Virtual Next.js de Alta Velocidad",
      "Panel Administrativo Autogestionable",
      " Integración de Carrito y Pagos",
    ],
    in3dCarousel: true,
  },
  {
    id: "07",
    slug: "jarvis",
    date: "2026.09.02",
    catalogType: "AMBOS",
    highlightBadge: "Agente Autónomo de Voz y Texto con Inteligencia Artificial",
    title: "Jarvis IA & Sofía Bot — Agentes de Voz, Texto y Ventas CRM",
    subtitle: "JARVIS & SOFÍA / AUTOMATIZACIÓN CON IA, NEON DB & WHATSAPP",
    category: "IA & Cloud",
    tags: ["IA Generativa", "WhatsApp CRM", "Telegram Voice", "Cloudflare"],
    desktopImg: "/projects/jarvis-ordenador.png",
    mobileImg: "/projects/jarvis-mobil.png",
    modalMobileImg: "/projects/jarvis-mobilMD.png",
    accentRGB: [0.05, 0.44, 0.48],
    description:
      "Ecosistema de agentes inteligentes: Jarvis (asistente ejecutivo por voz y texto con base de datos en tiempo real) y Sofía (bot cerrador de ventas para WhatsApp con calificación de leads y CRM).",
    architecture: [
      "Procesamiento multimodal de notas de voz y texto con modelos de lenguaje avanzados.",
      "Persistencia de memoria contextual sobre PostgreSQL serverless en Supabase / Neon DB.",
      "Túneles seguros en Cloudflare para ejecución de flujos de ventas 24/7 sin latencia.",
    ],
    priceUsd: 300,
    billingType: "Licencia Bot WhatsApp + CRM (Desde $200 Asistente Personal)",
    deliverables: [
      "Agente IA entrenado con el catálogo y reglas de tu negocio",
      "Conexión a Base de Datos PostgreSQL y CRM de Leads",
      "Derivación inteligente de cierres a tu WhatsApp",
    ],
    in3dCarousel: true,
  },
  {
    id: "08",
    slug: "iviluz",
    date: "2026.08.20",
    catalogType: "PORTAFOLIO",
    highlightBadge: "Plataforma Digital Ministerial y Comunidad Interactiva",
    title: "Iglesia Iviluz — Ecosistema Digital & Eventos",
    subtitle: "IGLESIA IVILUZ / PORTAL DE MEDIOS Y COMUNIDAD",
    category: "Apps & SaaS",
    tags: ["Plataforma Web", "Medios", "Eventos", "Diseño Dual"],
    desktopImg: "/projects/iviluz-ordenador.png",
    mobileImg: "/projects/iviluz-mobil.png",
    modalMobileImg: "/projects/iviluz-mobilMD.png",
    accentRGB: [0.26, 0.20, 0.54],
    description:
      "Portal digital moderno diseñado para conectar a la comunidad, gestionar eventos, centralizar transmisiones y ofrecer una experiencia de navegación cálida y veloz tanto en móvil como en escritorio.",
    architecture: [
      "Centro multimedia integrado para prédicas, recursos y agenda de actividades.",
      "Arquitectura limpia con tiempos de respuesta inmediatos en redes móviles.",
      "Sistema autogestionable para actualización continua de contenidos y noticias.",
    ],
    priceUsd: 800,
    billingType: "Portal Institucional & Eventos",
    deliverables: [
      "Plataforma Web Interactiva",
      "Agenda de Eventos y Centro Multimedia",
      "Panel de Administración de Contenidos",
    ],
    in3dCarousel: true,
  },
  {
    id: "09",
    slug: "guipordi",
    date: "2026.11.02",
    catalogType: "AMBOS",
    highlightBadge: "Arquitectura de Software, Experiencias WebGL & IA",
    title: "GuiporDI Soluciones — Entorno Inmersivo WebGL 3D + IA",
    subtitle: "GUIPORDI SOLUCIONES / ECOSISTEMAS DIGITALES A MEDIDA",
    category: "IA & Cloud",
    tags: ["WebGL / Three.js", "Next.js", "Cotizador IA", "ERP Admin"],
    desktopImg: "/projects/guipordi-ordenador.png",
    mobileImg: "/projects/guipordi-mobil.png",
    modalMobileImg: "/projects/guipordi-mobilMD.png",
    accentRGB: [0.035, 0.39, 0.25],
    description:
      "Entorno de ventas digital de ultra-lujo con motor 3D WebGL, shaders interactivos, audio espacial, cotizador autónomo con inteligencia artificial y sistema administrativo ERP integrado.",
    architecture: [
      "Renderizado WebGL en tiempo real con shaders GLSL personalizados y física óptica.",
      "Desarrollo Full-Stack 100% código propio en Next.js, TypeScript y Supabase.",
      "Diseño dual milimétrico auditado para monitores panorámicos y dispositivos móviles.",
    ],
    priceUsd: 1500,
    billingType: "Entorno WebGL 3D + Cotizador IA + ERP",
    deliverables: [
      "Escenario 3D Interactivo Personalizado",
      "Agente Cotizador IA Integrado",
      "Panel Administrativo Conectado a Base de Datos",
    ],
    in3dCarousel: true,
  },
];

// ============================================================================
// 2. PRODUCTOS SAAS ADICIONALES DEL MOSTRADOR COMERCIAL (EVENPASS & GUIPORDI PAY)
// ============================================================================
export const EXTRA_SAAS_PRODUCTS: ProjectItem[] = [
  {
    id: "10",
    slug: "guipordi-pay",
    date: "2026.11.03",
    catalogType: "DEMO_VENTA_SAAS",
    highlightBadge: "Pasarela Orgánica Zero-Fee (Binance Pay, Zelle & Pago Móvil)",
    title: "GuiporDI Pay — Pasarela Orgánica Automatizada Sin Comisiones",
    subtitle: "GUIPORDI PAY / CONCILIACIÓN AUTOMÁTICA DE PAGOS POR CORREO & IA",
    category: "IA & Cloud",
    tags: ["Zero-Fee", "Binance Pay", "Zelle", "Cloudflare Worker", "Supabase"],
    desktopImg: "/projects/guipordi-ordenador.png",
    mobileImg: "/projects/guipordi-mobil.png",
    modalMobileImg: "/projects/guipordi-mobilMD.png",
    accentRGB: [0.04, 0.55, 0.38],
    description:
      "Micro-SaaS y pasarela de pagos orgánica 100% código propio que valida automáticamente transferencias de Binance Pay, Zelle y bancos nacionales leyendo los acuses de recibo en tu correo en tiempo real. Cero comisiones por transacción y cero intermediarios bancarios.",
    architecture: [
      "Interceptor nativo en Cloudflare Email Routing + Worker que extrae monto, moneda y referencia con RegEx.",
      "Algoritmo de validación por monto único y referencia con liberación instantánea de la orden en Supabase.",
      "Módulo empaquetado listo para integrarse en cualquier tienda virtual o venderse en marca blanca.",
    ],
    priceUsd: 450,
    billingType: "Licencia Vitalicia Marca Blanca (Cero Comisiones)",
    deliverables: [
      "Módulo Checkout Multi-Moneda (Binance Pay, Zelle, Pago Móvil)",
      "Validador Automático de Correos de Confirmación",
      "Bóveda Administrativa de Conciliación en Tiempo Real",
    ],
    in3dCarousel: false,
  },
  {
    id: "11",
    slug: "evenpass-qr",
    date: "2026.11.03",
    catalogType: "DEMO_VENTA_SAAS",
    highlightBadge: "Plataforma SaaS de Tickets QR, Mapas de Zonas y Abonos",
    title: "Evenpass QR — Sistema de Boletería Masiva & Control de Acceso",
    subtitle: "EVENPASS SAAS / TICKETS CRIPTOGRÁFICOS QR & ESCÁNER EN PUERTA",
    category: "Apps & SaaS",
    tags: ["Tickets QR", "Eventos", "Escáner Móvil", "Pagos por Abonos"],
    desktopImg: "/projects/iviluz-ordenador.png",
    mobileImg: "/projects/iviluz-mobil.png",
    modalMobileImg: "/projects/iviluz-mobilMD.png",
    accentRGB: [0.32, 0.22, 0.62],
    description:
      "Plataforma completa para conciertos, convenciones, teatros y eventos corporativos. Incluye selección de zonas, alcancía de pagos por abonos, compra por lotes, cobro sin comisiones con GuiporDI Pay y escáner QR de alta velocidad en puerta.",
    architecture: [
      "Generación de entradas con firma criptográfica QR y billetera móvil PWA offline.",
      "Escáner web/móvil por cámara para protocolo con alertas semáforo anti-reingreso en <0.5s.",
      "Panel administrativo multi-evento con control de taquilla física y ventas online en vivo.",
    ],
    priceUsd: 1200,
    billingType: "Plataforma Completa Marca Blanca para Productoras y Eventos",
    deliverables: [
      "Portal de Venta de Entradas + Mapa de Zonas y Lotes",
      "Sistema de Pagos por Abonos y Pasarela Orgánica Integrada",
      "App Escáner QR de Puerta + Panel de Control de Taquilla",
    ],
    in3dCarousel: false,
  },
  {
    id: "12",
    slug: "pack-redes-pro",
    date: "2026.11.03",
    catalogType: "DEMO_VENTA_SAAS",
    highlightBadge: "Activos Visuales de Alta Conversión (Diseño & Video Ads)",
    title: "Pack Media Lab — 10 Imágenes Estratégicas o Reels Comerciales",
    subtitle: "GUIPORDI MEDIA LAB / CONTENIDO DIRECTO A VENTAS (AIDA)",
    category: "E-Commerce",
    tags: ["Diseño RRSS", "Video Reels", "Embudo AIDA", "Alta Conversión"],
    desktopImg: "/projects/bkelectronics-ordenador.png",
    mobileImg: "/projects/bkelectronics-mobil.png",
    modalMobileImg: "/projects/bkelectronics-mobilMD.png",
    accentRGB: [0.09, 0.42, 0.58],
    description:
      "Producción profesional de piezas gráficas y videos comerciales estructurados bajo metodología AIDA para multiplicar el clic y la compra en Instagram, TikTok y campañas de Meta Ads (sin servicio de Community Manager).",
    architecture: [
      "Pack de 10 Imágenes Estratégicas para Redes: 50 USDT (10% de descuento a partir de 3 packs).",
      "Videos Comerciales / Reels: 20 USDT por unidad o 100 USDT el pack de 10 videos (mitad de precio).",
      "Entrega en alta resolución optimizada para feed, historias y pauta publicitaria.",
    ],
    priceUsd: 50,
    billingType: "Desde $50 USDT (Pack 10 Imágenes) / $100 USDT (Pack 10 Videos)",
    deliverables: [
      "10 Piezas Visuales con Copywriting de Ventas AIDA",
      "Formatos Vertical (9:16) y Cuadrado/Retrato (4:5)",
      "Entrega Lista para Publicar o Pautar en Ads",
    ],
    in3dCarousel: false,
  },
];

export const ALL_INITIAL_CATALOG: ProjectItem[] = [
  ...PROJECTS_DATA,
  ...EXTRA_SAAS_PRODUCTS,
];

// Convierte un registro de Supabase (snake_case) al formato del Front-End (camelCase)
export function mapDbRecordToProjectItem(rec: CatalogItemRecord): ProjectItem {
  const rgb =
    Array.isArray(rec.accent_rgb) && rec.accent_rgb.length === 3
      ? ([
          Number(rec.accent_rgb[0]),
          Number(rec.accent_rgb[1]),
          Number(rec.accent_rgb[2]),
        ] as [number, number, number])
      : ([0.05, 0.45, 0.36] as [number, number, number]);

  return {
    id: rec.code_id || "10",
    slug: rec.slug,
    date: rec.date || "2026.11",
    catalogType: rec.catalog_type || "DEMO_VENTA_SAAS",
    highlightBadge: rec.highlight_badge || "",
    title: rec.title,
    subtitle: rec.subtitle || "",
    category: rec.category || "Apps & SaaS",
    tags: Array.isArray(rec.tags) ? rec.tags : [],
    desktopImg: rec.desktop_img || "/projects/guipordi-ordenador.png",
    mobileImg: rec.mobile_img || "/projects/guipordi-mobil.png",
    modalMobileImg: rec.modal_mobile_img || "/projects/guipordi-mobilMD.png",
    accentRGB: rgb,
    description: rec.description || "",
    architecture: Array.isArray(rec.architecture) ? rec.architecture : [],
    priceUsd: Number(rec.price_usd || 0),
    billingType: rec.billing_type || "Pago Único / Licencia Marca Blanca",
    deliverables: Array.isArray(rec.deliverables) ? rec.deliverables : [],
    demoUrl: rec.demo_url || "",
    in3dCarousel: Boolean(rec.in_3d_carousel),
  };
}