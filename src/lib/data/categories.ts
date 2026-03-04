import {
  Mountain,
  Palette,
  UtensilsCrossed,
  GraduationCap,
  Gem,
  Music,
  Dumbbell,
  Cpu,
  Leaf,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

export const categories: Category[] = [
  {
    id: "adventure",
    name: "Adventure",
    icon: Mountain,
    description: "Thrilling experiences for adrenaline seekers",
  },
  {
    id: "arts",
    name: "Arts",
    icon: Palette,
    description: "Creative workshops and artistic experiences",
  },
  {
    id: "dining",
    name: "Dining",
    icon: UtensilsCrossed,
    description: "Exceptional culinary experiences",
  },
  {
    id: "learning",
    name: "Learning",
    icon: GraduationCap,
    description: "Educational and skill-building activities",
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: Gem,
    description: "Premium exclusive experiences",
  },
  {
    id: "music",
    name: "Music",
    icon: Music,
    description: "Live performances and musical adventures",
  },
  {
    id: "sports",
    name: "Sports",
    icon: Dumbbell,
    description: "Athletic and competitive activities",
  },
  {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    description: "Cutting-edge tech and innovation experiences",
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: Leaf,
    description: "Relaxation and rejuvenation",
  },
];
