export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  emoji: string;
  price: number;
}

export const avatars: Avatar[] = [
  {
    id: 'avatar-01',
    name: 'Cosmic Explorer',
    imageUrl: '/avatars/cosmic-explorer.png',
    emoji: '🧑‍🚀',
    price: 0, // Default avatar is free
  },
  {
    id: 'avatar-02',
    name: 'Galactic Knight',
    imageUrl: '/avatars/galactic-knight.png',
    emoji: '⚔️',
    price: 75,
  },
  {
    id: 'avatar-03',
    name: 'Quantum Thinker',
    imageUrl: '/avatars/quantum-thinker.png',
    emoji: '🧠',
    price: 100,
  },
  {
    id: 'avatar-04',
    name: 'Star Captain',
    imageUrl: '/avatars/star-captain.png',
    emoji: '⭐',
    price: 125,
  },
  {
    id: 'avatar-05',
    name: 'Nebula Navigator',
    imageUrl: '/avatars/nebula-navigator.png',
    emoji: '🧭',
    price: 150,
  },
  {
    id: 'avatar-06',
    name: 'Celestial Sage',
    imageUrl: '/avatars/celestial-sage.png',
    emoji: '🦉',
    price: 200,
  },
];
