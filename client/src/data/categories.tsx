import {
  Apple,
  Laptop,
  Smartphone,
  Tv,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  Monitor,
  Speaker,
  Printer,
  TabletSmartphone,
  Battery,
  Cpu,
  HardDrive,
  Mouse,
  Keyboard,
  Mic,
  Router,
  UsbIcon,
} from "lucide-react";

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  icon?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: any;
  subcategories: SubCategory[];
  color?: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Smartphones",
    slug: "smartphones",
    icon: Smartphone,
    color: "#FF6B6B",
    subcategories: [
      { id: "1-1", name: "iPhone", slug: "iphone", icon: Apple },
      { id: "1-2", name: "Samsung Galaxy", slug: "samsung-galaxy" },
      { id: "1-3", name: "OnePlus", slug: "oneplus" },
      { id: "1-4", name: "Xiaomi", slug: "xiaomi" },
      { id: "1-5", name: "Oppo", slug: "oppo" },
      { id: "1-6", name: "Vivo", slug: "vivo" },
      { id: "1-7", name: "Realme", slug: "realme" },
      { id: "1-8", name: "Nokia", slug: "nokia" },
    ],
  },
  {
    id: "2",
    name: "Laptops & Computers",
    slug: "laptops",
    icon: Laptop,
    color: "#4ECDC4",
    subcategories: [
      { id: "2-1", name: "Gaming Laptops", slug: "gaming-laptops" },
      { id: "2-2", name: "Business Laptops", slug: "business-laptops" },
      { id: "2-3", name: "MacBooks", slug: "macbooks" },
      { id: "2-4", name: "Chromebooks", slug: "chromebooks" },
      { id: "2-5", name: "Desktop PCs", slug: "desktop-pcs" },
      { id: "2-6", name: "All-in-One PCs", slug: "all-in-one" },
      { id: "2-7", name: "Workstations", slug: "workstations" },
    ],
  },
  {
    id: "3",
    name: "TVs & Audio",
    slug: "tv-audio",
    icon: Tv,
    color: "#95E1D3",
    subcategories: [
      { id: "3-1", name: "Smart TVs", slug: "smart-tvs" },
      { id: "3-2", name: "LED TVs", slug: "led-tvs" },
      { id: "3-3", name: "4K TVs", slug: "4k-tvs" },
      { id: "3-4", name: "Soundbars", slug: "soundbars" },
      { id: "3-5", name: "Home Theater", slug: "home-theater" },
      { id: "3-6", name: "Speakers", slug: "speakers" },
    ],
  },
  {
    id: "4",
    name: "Wearables",
    slug: "wearables",
    icon: Watch,
    color: "#F38181",
    subcategories: [
      { id: "4-1", name: "Smart Watches", slug: "smart-watches" },
      { id: "4-2", name: "Fitness Bands", slug: "fitness-bands" },
      { id: "4-3", name: "Smart Glasses", slug: "smart-glasses" },
    ],
  },
  {
    id: "5",
    name: "Audio & Headphones",
    slug: "audio",
    icon: Headphones,
    color: "#AA96DA",
    subcategories: [
      { id: "5-1", name: "Wireless Earbuds", slug: "wireless-earbuds" },
      { id: "5-2", name: "Headphones", slug: "headphones" },
      { id: "5-3", name: "Gaming Headsets", slug: "gaming-headsets" },
      { id: "5-4", name: "Speakers", slug: "portable-speakers" },
    ],
  },
  {
    id: "6",
    name: "Cameras",
    slug: "cameras",
    icon: Camera,
    color: "#FCBAD3",
    subcategories: [
      { id: "6-1", name: "DSLR Cameras", slug: "dslr-cameras" },
      { id: "6-2", name: "Mirrorless Cameras", slug: "mirrorless" },
      { id: "6-3", name: "Action Cameras", slug: "action-cameras" },
      { id: "6-4", name: "Security Cameras", slug: "security-cameras" },
      { id: "6-5", name: "Camera Accessories", slug: "camera-accessories" },
    ],
  },
  {
    id: "7",
    name: "Gaming",
    slug: "gaming",
    icon: Gamepad2,
    color: "#A8D8EA",
    subcategories: [
      { id: "7-1", name: "PlayStation", slug: "playstation" },
      { id: "7-2", name: "Xbox", slug: "xbox" },
      { id: "7-3", name: "Nintendo", slug: "nintendo" },
      { id: "7-4", name: "Gaming Accessories", slug: "gaming-accessories" },
      { id: "7-5", name: "VR Headsets", slug: "vr-headsets" },
    ],
  },
  {
    id: "8",
    name: "Computer Accessories",
    slug: "accessories",
    icon: Mouse,
    color: "#FFD93D",
    subcategories: [
      { id: "8-1", name: "Keyboards", slug: "keyboards" },
      { id: "8-2", name: "Mouse", slug: "mouse" },
      { id: "8-3", name: "Monitors", slug: "monitors" },
      { id: "8-4", name: "Printers", slug: "printers" },
      { id: "8-5", name: "Storage Devices", slug: "storage" },
      { id: "8-6", name: "Cables & Adapters", slug: "cables" },
    ],
  },
  {
    id: "9",
    name: "Networking",
    slug: "networking",
    icon: Router,
    color: "#6BCB77",
    subcategories: [
      { id: "9-1", name: "WiFi Routers", slug: "routers" },
      { id: "9-2", name: "Modems", slug: "modems" },
      { id: "9-3", name: "Range Extenders", slug: "extenders" },
      { id: "9-4", name: "Network Switches", slug: "switches" },
    ],
  },
  {
    id: "10",
    name: "Power & Charging",
    slug: "power",
    icon: Battery,
    color: "#FF7B54",
    subcategories: [
      { id: "10-1", name: "Power Banks", slug: "power-banks" },
      { id: "10-2", name: "UPS Systems", slug: "ups" },
      { id: "10-3", name: "Chargers", slug: "chargers" },
      { id: "10-4", name: "Surge Protectors", slug: "surge-protectors" },
    ],
  },
];
