import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, to }) => {
  const cardContent = (
    <div className="group glass rounded-xl p-6 flex flex-col items-center text-center transform group-hover:-translate-y-2 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 border border-transparent group-hover:border-primary/10 h-full">
      <div className="p-3 bg-primary/10 rounded-full mb-4 transition-colors duration-300 group-hover:bg-primary/20">
        <div className="transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (to) {
    return (
      <Link 
        to={to} 
        className="block h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};
