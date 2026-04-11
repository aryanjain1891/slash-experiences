export interface Experience {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | number;
  location: string;
  latitude: string | null;
  longitude: string | null;
  duration: string;
  participants: string;
  availability: string;
  category: string;
  trending: boolean | null;
  featured: boolean | null;
  romantic: boolean | null;
  adventurous: boolean | null;
  group_activity: boolean | null;
  tags: string | null;
  exp_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}
