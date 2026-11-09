export const site = {
  name: 'Torque Moulds Factory L.L.C',
  wordmark: 'TORQUE',
  wordmarkSub: 'MOULDS FACTORY LLC',
  tagline: 'Tooling supplier for sheet-metal and fabrication shops in Dubai, UAE.',
  email: import.meta.env.PUBLIC_SALES_EMAIL?.trim() || undefined,

  whatsapp: { display: '+971 55 336 2041', number: '971553362041' },
  landline: { display: '+971 4 330 6077', number: '+97143306077' },

  address: {
    street: import.meta.env.PUBLIC_COUNTER_ADDRESS?.trim() || undefined,
    area: 'Al Quoz',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    poBox: 'P.O. Box 18840',
  },

  hours: [
    { days: 'Monday – Saturday', time: '8:00 AM – 5:30 PM' },
    { days: 'Sunday', time: 'Closed' },
  ],

  maps: {
    google: 'https://www.google.com/search?q=torque+moulds+factory+llc',
    directions: 'https://www.google.com/maps/search/?api=1&query=Torque+Moulds+Factory+LLC+Al+Quoz+Dubai',
  },
} as const;

export const counterLocation = site.address.area + ', ' + site.address.city;

export const whatsappLink = (message: string) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;

export const mailtoLink = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Torque, I'd like a quote for tooling. Machine: ... Tool: ...";

/** Page list shared by the header, footer and mobile bar. */
export const nav = [
  { href: '/products', label: 'Products', dropdown: true },
  { href: '/custom-tooling', label: 'Custom tooling' },
  { href: '/industries', label: 'Industries' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const industries = [
  { name: 'HVAC and ducting', note: 'Punches and dies for duct flanges, hangers and fittings.', category: 'cnc-punching-tools' },
  { name: 'Elevator panels', note: 'Tooling for door panels, cabin skins and landing doors.', category: 'press-brake-tools' },
  { name: 'Electrical enclosures', note: 'Boxes, gland plates and DIN rail cut-outs.', category: 'cnc-punching-tools' },
  { name: 'Signage', note: 'Letter forms, slots and mounting patterns.', category: 'press-brake-tools' },
  { name: 'Metal fabrication', note: 'Job-shop punching, bending and sawing consumables.', category: 'bandsaw-blades' },
  { name: 'Automotive and parts', note: 'Brackets, panels and repeat-production dies.', category: 'dies-and-tooling' },
];
