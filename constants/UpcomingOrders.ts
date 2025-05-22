export type UpcomingOrder = {
  id: string;
  restaurant: string;
  restaurantImage: string;
  date: string;
  time: string;
  status: 'voting' | 'ordering' | 'confirmed' | 'delivered';
  participants: {
    count: number;
    confirmed: number;
  };
  organizer: string;
};

export const upcomingOrders: UpcomingOrder[] = [
  {
    id: '1',
    restaurant: 'Voting in progress',
    restaurantImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    date: '2025-03-10',
    time: '12:30 PM',
    status: 'voting',
    participants: {
      count: 8,
      confirmed: 5
    },
    organizer: 'Alex Chen'
  },
  {
    id: '2',
    restaurant: 'Sushi Select',
    restaurantImage: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
    date: '2025-03-12',
    time: '1:00 PM',
    status: 'confirmed',
    participants: {
      count: 6,
      confirmed: 6
    },
    organizer: 'You'
  },
  {
    id: '3',
    restaurant: 'Green Garden Bowl',
    restaurantImage: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    date: '2025-03-14',
    time: '12:15 PM',
    status: 'ordering',
    participants: {
      count: 4,
      confirmed: 3
    },
    organizer: 'Taylor Kim'
  }
];