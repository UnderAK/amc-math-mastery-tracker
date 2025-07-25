import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="glass rounded-xl p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
      <div className="p-3 bg-primary/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
