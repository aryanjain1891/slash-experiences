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
  date: string;
  category: string;
  niche_category: string | null;
  trending: boolean | null;
  featured: boolean | null;
  romantic: boolean | null;
  adventurous: boolean | null;
  group_activity: boolean | null;
  tags: string | null;
  exp_type: string | null;
  status: string | null;
  idtag: number | null;
  created_at: string | null;
  updated_at: string | null;
}
