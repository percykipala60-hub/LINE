import { Category, Product, StoryDrop, SellerContact } from '../types';

export const DEFAULT_SELLER_CONTACT: SellerContact = {
  whatsappNumber: '243999999999', // Numéro configuré pour réception des commandes
  whatsappName: 'LINE Boutique Officielle',
  instagramHandle: 'line.luxury.cd',
  instagramUrl: 'https://instagram.com/line.luxury.cd',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Tous les articles', slug: 'all' },
  { id: 'cat-new', name: 'Nouveautés', slug: 'new' },
  { id: 'cat-men', name: 'Homme', slug: 'homme' },
  { id: 'cat-women', name: 'Femme', slug: 'femme' },
  { id: 'cat-street', name: 'Streetwear', slug: 'streetwear' },
  { id: 'cat-acc', name: 'Accessoires', slug: 'accessoires' },
];

export const INITIAL_STORIES: StoryDrop[] = [
  {
    id: 's1',
    title: 'Drop Éclat',
    tag: 'NEW',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    hasNew: true,
    caption: 'Nouvelle collection capsule Haute Couture & Street - Série limitée'
  },
  {
    id: 's2',
    title: 'Sweats & Hoodies',
    tag: 'TREND',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    hasNew: true,
    caption: 'Coupes oversize, 420 GSM coton peigné grand confort'
  },
  {
    id: 's3',
    title: 'Costumes & Blazers',
    tag: 'CHIC',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    hasNew: false,
    caption: 'Élégance minimale, tissus italiens structurés'
  },
  {
    id: 's4',
    title: 'Robes Soirée',
    tag: 'EXCLU',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
    hasNew: true,
    caption: 'Lignes fluides et silhouettes audacieuses'
  },
  {
    id: 's5',
    title: 'Sneakers & Caps',
    tag: 'URBAN',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    hasNew: false,
    caption: 'Accessoires de finition pour vos tenues du quotidien'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Veste Bomber Minimaliste "LINE"',
    slug: 'veste-bomber-minimaliste-line',
    categoryId: 'cat-street',
    price: 65,
    originalPrice: 85,
    currency: '$',
    description: 'Veste bomber confectionnée en nylon satiné déperlant avec doublure thermique soyeuse. Finitions bords-côtes ton sur ton, fermeture zip métallique brossé.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    isNewDrop: true,
    isTrending: true,
    rating: 4.9,
    reviewsCount: 42,
    tags: ['Streetwear', 'Unisexe', 'Hiver'],
    variants: [
      { id: 'v-1-1', productId: 'p-1', size: 'S', color: 'Noir Mat', stockQuantity: 4 },
      { id: 'v-1-2', productId: 'p-1', size: 'M', color: 'Noir Mat', stockQuantity: 8 },
      { id: 'v-1-3', productId: 'p-1', size: 'L', color: 'Noir Mat', stockQuantity: 5 },
      { id: 'v-1-4', productId: 'p-1', size: 'XL', color: 'Noir Mat', stockQuantity: 2 },
      { id: 'v-1-5', productId: 'p-1', size: 'M', color: 'Kaki Olive', stockQuantity: 3 },
      { id: 'v-1-6', productId: 'p-1', size: 'L', color: 'Kaki Olive', stockQuantity: 4 },
    ]
  },
  {
    id: 'p-2',
    name: 'Hoodie Oversize Coton Lourd 450 GSM',
    slug: 'hoodie-oversize-coton-lourd',
    categoryId: 'cat-street',
    price: 45,
    originalPrice: 55,
    currency: '$',
    description: 'Sweat à capuche coupe tombante ultra-lourde en coton biologique 450 GSM. Poche kangourou discrète, broderie signature LINE subtile sur la manche gauche.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    isNewDrop: true,
    isTrending: true,
    rating: 4.8,
    reviewsCount: 89,
    tags: ['Streetwear', 'Cozy', 'Bestseller'],
    variants: [
      { id: 'v-2-1', productId: 'p-2', size: 'S', color: 'Gris Cendre', stockQuantity: 6 },
      { id: 'v-2-2', productId: 'p-2', size: 'M', color: 'Gris Cendre', stockQuantity: 12 },
      { id: 'v-2-3', productId: 'p-2', size: 'L', color: 'Gris Cendre', stockQuantity: 7 },
      { id: 'v-2-4', productId: 'p-2', size: 'XL', color: 'Gris Cendre', stockQuantity: 3 },
      { id: 'v-2-5', productId: 'p-2', size: 'M', color: 'Noir Nuit', stockQuantity: 10 },
      { id: 'v-2-6', productId: 'p-2', size: 'L', color: 'Noir Nuit', stockQuantity: 8 },
    ]
  },
  {
    id: 'p-3',
    name: 'Ensemble Blazer & Pantalon Coupe Tailleur',
    slug: 'ensemble-blazer-pantalon-tailleur',
    categoryId: 'cat-women',
    price: 110,
    originalPrice: 140,
    currency: '$',
    description: 'Ensemble élégant contemporain composé d’un blazer croisé à revers pointus et d’un pantalon droit plissé taille haute. Tissu fluide infroissable.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    isNewDrop: false,
    isTrending: true,
    rating: 5.0,
    reviewsCount: 28,
    tags: ['Chic', 'Business', 'Luxe'],
    variants: [
      { id: 'v-3-1', productId: 'p-3', size: 'XS', color: 'Crème Beige', stockQuantity: 2 },
      { id: 'v-3-2', productId: 'p-3', size: 'S', color: 'Crème Beige', stockQuantity: 5 },
      { id: 'v-3-3', productId: 'p-3', size: 'M', color: 'Crème Beige', stockQuantity: 4 },
      { id: 'v-3-4', productId: 'p-3', size: 'S', color: 'Noir Absolu', stockQuantity: 6 },
      { id: 'v-3-5', productId: 'p-3', size: 'M', color: 'Noir Absolu', stockQuantity: 5 },
    ]
  },
  {
    id: 'p-4',
    name: 'T-Shirt Boxy Fit "Raw Signature"',
    slug: 't-shirt-boxy-fit-raw-signature',
    categoryId: 'cat-men',
    price: 25,
    originalPrice: 30,
    currency: '$',
    description: 'T-shirt épais 260 GSM au tombé net et structuré. Col rond monté ras-du-cou avec renfort anti-déformation. Coupe boxy ultra-moderne.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    isNewDrop: true,
    isTrending: false,
    rating: 4.7,
    reviewsCount: 64,
    tags: ['Basique', 'Homme', 'Streetwear'],
    variants: [
      { id: 'v-4-1', productId: 'p-4', size: 'S', color: 'Blanc Pur', stockQuantity: 15 },
      { id: 'v-4-2', productId: 'p-4', size: 'M', color: 'Blanc Pur', stockQuantity: 20 },
      { id: 'v-4-3', productId: 'p-4', size: 'L', color: 'Blanc Pur', stockQuantity: 14 },
      { id: 'v-4-4', productId: 'p-4', size: 'XL', color: 'Blanc Pur', stockQuantity: 8 },
      { id: 'v-4-5', productId: 'p-4', size: 'M', color: 'Anthracite', stockQuantity: 12 },
      { id: 'v-4-6', productId: 'p-4', size: 'L', color: 'Anthracite', stockQuantity: 10 },
    ]
  },
  {
    id: 'p-5',
    name: 'Pantalon Cargo Technique Élastiqué',
    slug: 'pantalon-cargo-technique-elastique',
    categoryId: 'cat-street',
    price: 55,
    originalPrice: 70,
    currency: '$',
    description: 'Cargo contemporain avec poches 3D à soufflets, cordon de serrage aux chevilles pour ajuster la silhouette (droit ou resserré) et taille ajustable.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    isNewDrop: false,
    isTrending: true,
    rating: 4.9,
    reviewsCount: 51,
    tags: ['Cargo', 'Techwear', 'Tendance'],
    variants: [
      { id: 'v-5-1', productId: 'p-5', size: 'S', color: 'Noir Carbone', stockQuantity: 3 },
      { id: 'v-5-2', productId: 'p-5', size: 'M', color: 'Noir Carbone', stockQuantity: 9 },
      { id: 'v-5-3', productId: 'p-5', size: 'L', color: 'Noir Carbone', stockQuantity: 6 },
      { id: 'v-5-4', productId: 'p-5', size: 'M', color: 'Vert Militaire', stockQuantity: 4 },
      { id: 'v-5-5', productId: 'p-5', size: 'L', color: 'Vert Militaire', stockQuantity: 5 },
    ]
  },
  {
    id: 'p-6',
    name: 'Casquette Broderie Minimale "LINE Studio"',
    slug: 'casquette-broderie-minimale-line-studio',
    categoryId: 'cat-acc',
    price: 20,
    originalPrice: 25,
    currency: '$',
    description: 'Casquette 6 panneaux en sergé de coton brossé, boucle arrière en métal vieilli gravé, broderie typographique LINE de précision.',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    isNewDrop: true,
    isTrending: false,
    rating: 4.8,
    reviewsCount: 33,
    tags: ['Accessoire', 'Caps', 'Unisexe'],
    variants: [
      { id: 'v-6-1', productId: 'p-6', size: 'Unique', color: 'Noir & Blanc', stockQuantity: 25 },
      { id: 'v-6-2', productId: 'p-6', size: 'Unique', color: 'Sable Désert', stockQuantity: 18 },
    ]
  }
];
