export type MealMemory = {
  id: string;
  date: string;
  restaurant: string;
  restaurantImage: string;
  participants: number;
  totalCost: string;
  items: string[];
};

export const mealMemories: MealMemory[] = [
  {
    id: '1',
    date: '2025-01-15',
    restaurant: 'Fresh Bites Deli',
    restaurantImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    participants: 5,
    totalCost: '$87.50',
    items: ['Club Sandwich', 'Caesar Salad', 'Vegetable Wrap', 'Smoothies', 'Cookies']
  },
  {
    id: '2',
    date: '2025-01-08',
    restaurant: 'Burger Joint',
    restaurantImage: 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg',
    participants: 4,
    totalCost: '$68.20',
    items: ['Cheeseburgers', 'Fries', 'Milkshakes', 'Onion Rings']
  },
  {
    id: '3',
    date: '2024-12-20',
    restaurant: 'Spice Fusion',
    restaurantImage: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    participants: 6,
    totalCost: '$112.75',
    items: ['Butter Chicken', 'Naan', 'Biryani', 'Samosas', 'Chai']
  }
];