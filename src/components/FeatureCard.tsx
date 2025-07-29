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
    <div className="group glass rounded-xl p-6 flex flex-col items-center text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 border border-transparent hover:border-amber-500/10 h-full">
      <div className="p-3 bg-amber-500/10 rounded-full mb-4 transition-colors duration-300 group-hover:bg-amber-500/20">
        <div className="transition-transform duration-300 group-hover:scale-110 text-amber-600">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2 text-amber-700">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (to) {
    return <Link to={to}>{cardContent}</Link>;
  }

  return cardContent;
};
