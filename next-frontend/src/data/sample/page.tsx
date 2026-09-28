/**
 * Sample Data for B2B Marketplace Storefront (Companies & Products)
 * Location: src/data/sample/page.tsx
 *
 * Used as fallback data when DB data is incomplete or unavailable.
 */

export interface ReviewItem {
  id: string;
  reviewerName: string;
  role?: string;
  companyName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CustomerItem {
  id: string;
  name: string;
  industry: string;
  location: string;
  logo?: string;
}

export interface PricingTierItem {
  minQty: number;
  maxQty: number;
  pricePerUnit: number;
  discountLabel: string;
}

export interface OptionToggleItem {
  id: string;
  label: string;
  description: string;
  price: number;
}

export interface SampleProduct {
  productId: string;
  companyId: string;
  productName: string;
  companyName: string;
  productType: string;
  typeLabel: string;
  category: string;
  pricing: string;
  basePrice: number;
  availability: string;
  productDescription: string;
  logo?: string;
  tags: string[];
  specifications: Record<string, string>;
  pricingTiers: PricingTierItem[];
  rating: number;
  reviewCount: number;
  totalSales: number;
  location: string;
  reviews: ReviewItem[];
  pastCustomers: CustomerItem[];
  contact: {
    email: string;
    phone: string;
    responseTime: string;
    address: string;
  };
  quotationOptions: OptionToggleItem[];
}

export interface SampleCompany {
  companyId: string;
  companyName: string;
  email: string;
  phone: string;
  located: string;
  founder: string;
  website: string;
  about: string;
  industry: string;
  logo?: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "PENDING";
  rating: number;
  reviewCount: number;
  establishedYear: number;
  employeeCount: string;
  customers: CustomerItem[];
  reviews: ReviewItem[];
  products: SampleProduct[];
}

// ---------------------------------------------------------------- Sample Reviews
const commonReviews: ReviewItem[] = [
  {
    id: "r1",
    reviewerName: "Vikram Malhotra",
    role: "VP of Operations",
    companyName: "Precision Dynamics Ltd",
    rating: 5,
    comment: "Exceptional build quality and zero downtime in 6 months of continuous factory operation. Highly recommended for heavy manufacturing.",
    date: "2026-08-15",
    verified: true,
  },
  {
    id: "r2",
    reviewerName: "Ananya Iyer",
    role: "Procurement Manager",
    companyName: "Apex Infra Solutions",
    rating: 5,
    comment: "Prompt delivery, robust packaging, and full compliance with ISO certification standards. Smooth transaction.",
    date: "2026-07-28",
    verified: true,
  },
  {
    id: "r3",
    reviewerName: "Rohan Deshmukh",
    role: "Plant Head",
    companyName: "Maharashtra Heavy Forge",
    rating: 4,
    comment: "Solid performance under high load conditions. Customer support team helped setup calibration within 24 hours.",
    date: "2026-07-10",
    verified: true,
  },
  {
    id: "r4",
    reviewerName: "Kavita Nair",
    role: "Quality Assurance Director",
    companyName: "Kaveri Engineering Works",
    rating: 5,
    comment: "The precision engineering met all our strict tolerance parameters. Tiers pricing offered substantial volume cost savings.",
    date: "2026-06-19",
    verified: true,
  },
  {
    id: "r5",
    reviewerName: "Sanjay Gupta",
    role: "Supply Chain Lead",
    companyName: "Northstar Industrial Systems",
    rating: 4.5,
    comment: "Great communication and transparent quotation timeline. Will definitely place follow-up bulk orders.",
    date: "2026-05-30",
    verified: true,
  },
];

// ---------------------------------------------------------------- Sample Customers
const commonCustomers: CustomerItem[] = [
  {
    id: "c-cust-1",
    name: "Tata Heavy Engineering",
    industry: "Steel & Metallurgy",
    location: "Jamshedpur, Jharkhand",
  },
  {
    id: "c-cust-2",
    name: "Mahindra Auto Forge",
    industry: "Automotive Manufacturing",
    location: "Pune, Maharashtra",
  },
  {
    id: "c-cust-3",
    name: "Larsen & Toubro Hydrocarbon",
    industry: "EPC & Heavy Equipment",
    location: "Hazira, Gujarat",
  },
  {
    id: "c-cust-4",
    name: "Reliance Industrial Energy",
    industry: "Petrochemicals",
    location: "Jamnagar, Gujarat",
  },
  {
    id: "c-cust-5",
    name: "Bharat Forge Ltd",
    industry: "Precision Forging",
    location: "Mundhwa, Pune",
  },
];

// ---------------------------------------------------------------- Sample Products
export const sampleProducts: SampleProduct[] = [
  {
    productId: "p1",
    companyId: "c1",
    productName: "Industrial CNC 5-Axis Milling Machine X-900",
    companyName: "Apex Industrial Tech Ltd",
    productType: "Machinery",
    typeLabel: "Heavy Equipment",
    category: "CNC & Metalworking",
    pricing: "₹ 4,50,000 / unit",
    basePrice: 450000,
    availability: "In Stock — Ready to ship in 3-5 business days",
    productDescription:
      "Engineered for high-precision aerospace and automotive component manufacturing. Features heavy-duty cast iron bed, automated 24-tool changer, thermal compensation sensors, and live IoT diagnostic telemetry.",
    tags: ["CNC Milling", "5-Axis", "ISO 9001 Certified", "Heavy Industry", "Automated Tool Changer"],
    specifications: {
      "Max Spindle Speed": "12,000 RPM",
      "Spindle Motor Power": "18.5 kW Heavy Duty",
      "Table Load Capacity": "1,500 kg",
      "X / Y / Z Travel": "1050 / 600 / 600 mm",
      "Tool Capacity": "24 Tool ATC Arm",
      "Control Unit": "Siemens Sinumerik 840D sl",
      "Coolant Tank Capacity": "300 Liters",
      "Machine Weight": "4,200 kg",
    },
    pricingTiers: [
      { minQty: 1, maxQty: 4, pricePerUnit: 450000, discountLabel: "Standard Base Price" },
      { minQty: 5, maxQty: 19, pricePerUnit: 415000, discountLabel: "7.7% Tier Discount" },
      { minQty: 20, maxQty: 49, pricePerUnit: 385000, discountLabel: "14.4% Tier Discount" },
      { minQty: 50, maxQty: 500, pricePerUnit: 350000, discountLabel: "22.2% Bulk Tier" },
    ],
    rating: 4.9,
    reviewCount: 38,
    totalSales: 184,
    location: "Mumbai, Maharashtra",
    reviews: commonReviews,
    pastCustomers: commonCustomers,
    contact: {
      email: "sales@apexindustrial.example.com",
      phone: "+91 98765 43210",
      responseTime: "< 2 Hours (Mon-Sat)",
      address: "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093",
    },
    quotationOptions: [
      {
        id: "oem",
        label: "Custom OEM Branding & Steel Plate Logo",
        description: "Laser engraved logo plate & corporate paint finish",
        price: 15000,
      },
      {
        id: "installation",
        label: "On-Site Installation & Calibration Training",
        description: "Certified engineer visits facility for 3-day commissioning",
        price: 35000,
      },
      {
        id: "warranty",
        label: "2-Year Extended Comprehensive Service Warranty",
        description: "Includes quarterly preventative maintenance visits & spare parts cover",
        price: 45000,
      },
      {
        id: "express",
        label: "Priority Freight Delivery & Hydraulic Unloading",
        description: "Guaranteed express dispatch within 48 hours with air-cushioned transit",
        price: 25000,
      },
    ],
  },
  {
    productId: "p2",
    companyId: "c1",
    productName: "High-Precision Steel Roller Bearings Grade-A",
    companyName: "Apex Industrial Tech Ltd",
    productType: "Components",
    typeLabel: "Industrial Spares",
    category: "Bearings & Power Transmission",
    pricing: "₹ 1,850 / box (10 units)",
    basePrice: 1850,
    availability: "In Stock — 5,000+ units available",
    productDescription:
      "Premium chrome steel spherical roller bearings engineered for ultra-low friction, high radial load capacities, and extended rotational fatigue life in severe industrial environments.",
    tags: ["Chrome Steel", "High Temperature", "Low Noise", "Precision Grade"],
    specifications: {
      "Bore Diameter": "50 mm",
      "Outer Diameter": "110 mm",
      "Width": "27 mm",
      "Basic Dynamic Load": "132 kN",
      "Material Grade": "SUJ2 High Carbon Chrome Steel",
      "Lubrication": "Pre-greased Synthetic Polyurea",
    },
    pricingTiers: [
      { minQty: 1, maxQty: 9, pricePerUnit: 1850, discountLabel: "Retail Box Price" },
      { minQty: 10, maxQty: 49, pricePerUnit: 1680, discountLabel: "9.2% Bulk Savings" },
      { minQty: 50, maxQty: 199, pricePerUnit: 1500, discountLabel: "18.9% Dealer Rate" },
      { minQty: 200, maxQty: 2000, pricePerUnit: 1350, discountLabel: "27.0% Enterprise Rate" },
    ],
    rating: 4.8,
    reviewCount: 52,
    totalSales: 1240,
    location: "Mumbai, Maharashtra",
    reviews: commonReviews,
    pastCustomers: commonCustomers,
    contact: {
      email: "spares@apexindustrial.example.com",
      phone: "+91 98765 43211",
      responseTime: "< 1 Hour",
      address: "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093",
    },
    quotationOptions: [
      {
        id: "lubricant",
        label: "High-Temp Synthetic Grease Coating",
        description: "Specialized grease rated up to 280°C operating temp",
        price: 250,
      },
      {
        id: "certification",
        label: "NABL Certified Material Inspection Report",
        description: "Batch physical & chemical metallurgical certification",
        price: 1500,
      },
    ],
  },
  {
    productId: "p3",
    companyId: "c1",
    productName: "Heavy Duty Modular Conveyor Belt Assembly 50m",
    companyName: "Apex Industrial Tech Ltd",
    productType: "Machinery",
    typeLabel: "Material Handling",
    category: "Automation & Conveyors",
    pricing: "₹ 2,75,000 / set",
    basePrice: 275000,
    availability: "Made to Order — Lead time 10-14 days",
    productDescription:
      "Modular stainless steel conveyor frame with heat-resistant vulcanized rubber belt. Ideal for mining, automotive assembly, and food processing lines.",
    tags: ["Modular Conveyor", "Material Handling", "Stainless Steel", "PLC Compatible"],
    specifications: {
      "Total Length": "50 Meters (Customizable)",
      "Belt Width": "800 mm",
      "Drive Motor": "7.5 HP Planetary Gearbox",
      "Speed Range": "0.2 - 2.5 m/s Variable Speed",
      "Structure": "304 Stainless Steel Truss Frame",
    },
    pricingTiers: [
      { minQty: 1, maxQty: 2, pricePerUnit: 275000, discountLabel: "Standard Assembly" },
      { minQty: 3, maxQty: 9, pricePerUnit: 250000, discountLabel: "9.1% Volume Discount" },
      { minQty: 10, maxQty: 50, pricePerUnit: 225000, discountLabel: "18.1% Project Rate" },
    ],
    rating: 4.7,
    reviewCount: 19,
    totalSales: 45,
    location: "Mumbai, Maharashtra",
    reviews: commonReviews,
    pastCustomers: commonCustomers,
    contact: {
      email: "automation@apexindustrial.example.com",
      phone: "+91 98765 43212",
      responseTime: "< 3 Hours",
      address: "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093",
    },
    quotationOptions: [
      {
        id: "vfd",
        label: "ABB Variable Frequency Drive (VFD) Speed Controller",
        description: "Precision speed modulation with digital remote interface",
        price: 28000,
      },
      {
        id: "sideguards",
        label: "Adjustable Stainless Steel Side Guard Rails",
        description: "Full length spill guard protection kit",
        price: 18000,
      },
    ],
  },
  {
    productId: "p4",
    companyId: "c1",
    productName: "Automated 50-Ton Servo Hydraulic Press",
    companyName: "Apex Industrial Tech Ltd",
    productType: "Machinery",
    typeLabel: "Heavy Pressing",
    category: "Metal Forming",
    pricing: "₹ 6,80,000 / unit",
    basePrice: 680000,
    availability: "In Stock — 2 units available",
    productDescription:
      "High precision servo-electric driven hydraulic press offering zero backlash, stroke repeatability within 0.01mm, and energy savings up to 40% compared to conventional presses.",
    tags: ["Hydraulic Press", "50-Ton", "Servo Drive", "Energy Efficient", "CE Marked"],
    specifications: {
      "Max Capacity": "50 Tons",
      "Stroke Length": "400 mm",
      "Daylight Opening": "600 mm",
      "Pressing Speed": "10-150 mm/s Adjustable",
      "Safety Sensors": "Dual Optical Light Curtains",
    },
    pricingTiers: [
      { minQty: 1, maxQty: 1, pricePerUnit: 680000, discountLabel: "Standard Machine" },
      { minQty: 2, maxQty: 5, pricePerUnit: 630000, discountLabel: "7.35% Multi-Unit Discount" },
    ],
    rating: 4.95,
    reviewCount: 28,
    totalSales: 62,
    location: "Mumbai, Maharashtra",
    reviews: commonReviews,
    pastCustomers: commonCustomers,
    contact: {
      email: "presses@apexindustrial.example.com",
      phone: "+91 98765 43210",
      responseTime: "< 2 Hours",
      address: "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093",
    },
    quotationOptions: [
      {
        id: "die_cushion",
        label: "Hydraulic Die Cushion Attachment",
        description: "Enhances deep drawing quality & wrinkle prevention",
        price: 55000,
      },
    ],
  },
];

// ---------------------------------------------------------------- Sample Companies
export const sampleCompanies: SampleCompany[] = [
  {
    companyId: "c1",
    companyName: "Apex Industrial Tech Ltd",
    email: "contact@apexindustrial.example.com",
    phone: "+91 98765 43210",
    located: "Mumbai, Maharashtra, India",
    founder: "Dr. Rajesh Sharma & Partners",
    website: "https://apexindustrial.example.com",
    about:
      "Apex Industrial Tech Ltd is an ISO 9001:2015 certified manufacturer of high-precision heavy machinery, CNC equipment, automated material handling conveyors, and industrial power components. Serving over 200+ enterprise clients across steel, automotive, and defense sectors globally.",
    industry: "Heavy Machinery & Industrial Engineering",
    verificationStatus: "VERIFIED",
    rating: 4.85,
    reviewCount: 137,
    establishedYear: 2008,
    employeeCount: "250-500 Employees",
    customers: commonCustomers,
    reviews: commonReviews,
    products: sampleProducts,
  },
  {
    companyId: "c2",
    companyName: "Nexa Dynamics Systems",
    email: "info@nexadynamics.example.com",
    phone: "+91 91234 56789",
    located: "Bengaluru, Karnataka, India",
    founder: "Vikramaditya Rao",
    website: "https://nexadynamics.example.com",
    about:
      "Pioneers in industrial IoT sensors, automated robotic arms, vision-guided inspection systems, and smart warehouse logistics hardware.",
    industry: "Robotics & Industrial Automation",
    verificationStatus: "VERIFIED",
    rating: 4.9,
    reviewCount: 94,
    establishedYear: 2015,
    employeeCount: "100-250 Employees",
    customers: commonCustomers.slice(0, 3),
    reviews: commonReviews.slice(0, 3),
    products: [
      {
        productId: "p5",
        companyId: "c2",
        productName: "Autonomous Mobile Robot (AMR) Payload 500kg",
        companyName: "Nexa Dynamics Systems",
        productType: "Robotics",
        typeLabel: "Warehouse AMR",
        category: "Industrial Robotics",
        pricing: "₹ 8,20,000 / unit",
        basePrice: 820000,
        availability: "In Stock — 4 units",
        productDescription:
          "LiDAR & 3D camera navigation AMR for pallet and bin transport in automated smart factories.",
        tags: ["AMR", "LiDAR", "Warehouse Automation", "Industry 4.0"],
        specifications: {
          "Payload Capacity": "500 kg",
          "Navigation": "SLAM LiDAR + 3D Depth Camera",
          "Battery Life": "8 Hours Continuous (Auto-docking)",
        },
        pricingTiers: [
          { minQty: 1, maxQty: 3, pricePerUnit: 820000, discountLabel: "Standard Base" },
          { minQty: 4, maxQty: 20, pricePerUnit: 760000, discountLabel: "7.3% Fleet Rate" },
        ],
        rating: 4.9,
        reviewCount: 14,
        totalSales: 38,
        location: "Bengaluru, Karnataka",
        reviews: commonReviews,
        pastCustomers: commonCustomers,
        contact: {
          email: "robotics@nexadynamics.example.com",
          phone: "+91 91234 56789",
          responseTime: "< 1 Hour",
          address: "Electronics City Phase 1, Bengaluru 560100",
        },
        quotationOptions: [],
      },
    ],
  },
];

// Helper functions for fallback lookups
export function getSampleCompany(companyId?: string): SampleCompany {
  if (!companyId) return sampleCompanies[0];
  const found = sampleCompanies.find(
    (c) => c.companyId.toLowerCase() === companyId.toLowerCase()
  );
  return found ?? sampleCompanies[0];
}

export function getSampleProduct(
  productId?: string,
  companyId?: string
): SampleProduct {
  const company = getSampleCompany(companyId);
  if (productId) {
    const foundProduct = sampleProducts.find(
      (p) => p.productId.toLowerCase() === productId.toLowerCase()
    );
    if (foundProduct) return foundProduct;
  }
  return company.products[0] || sampleProducts[0];
}

export default function SamplePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sample Marketplace Data</h1>
      <p className="text-sm text-muted-foreground">
        This file exports sample company and product records used as fallbacks when DB data is unavailable.
      </p>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="border p-4 rounded-lg bg-card">
          <h2 className="font-semibold text-base mb-2">Sample Companies</h2>
          <p className="text-xs text-muted-foreground">Total: {sampleCompanies.length}</p>
        </div>
        <div className="border p-4 rounded-lg bg-card">
          <h2 className="font-semibold text-base mb-2">Sample Products</h2>
          <p className="text-xs text-muted-foreground">Total: {sampleProducts.length}</p>
        </div>
      </div>
    </div>
  );
}
