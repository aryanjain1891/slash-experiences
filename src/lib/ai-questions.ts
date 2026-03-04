export const QUESTIONS = [
  {
    id: "recipient",
    text: "Who is the experience for?",
    options: [
      "Partner",
      "Friend",
      "Parent",
      "Sibling",
      "Colleague",
      "Child",
    ],
  },
  {
    id: "occasion",
    text: "What's the occasion?",
    options: [
      "Birthday",
      "Anniversary",
      "Valentine's Day",
      "Graduation",
      "Just Because",
      "Holiday",
    ],
  },
  {
    id: "budget",
    text: "What's your budget range?",
    options: [
      "Under ₹1,000",
      "₹1,000 - ₹3,000",
      "₹3,000 - ₹5,000",
      "₹5,000 - ₹10,000",
      "₹10,000+",
    ],
  },
  {
    id: "interests",
    text: "What are they interested in?",
    options: [
      "Adventure",
      "Food & Dining",
      "Wellness & Spa",
      "Learning",
      "Arts & Culture",
      "Sports",
      "Nature",
      "Luxury",
    ],
  },
  {
    id: "personality",
    text: "How would you describe them?",
    options: [
      "Adventurous",
      "Relaxed",
      "Creative",
      "Social",
      "Romantic",
      "Intellectual",
    ],
  },
] as const;

export type Question = (typeof QUESTIONS)[number];
