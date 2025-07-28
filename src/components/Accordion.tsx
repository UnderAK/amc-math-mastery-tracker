import { useState } from 'react';
import React from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export const Accordion = ({ title, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 px-2 flex justify-between items-center hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold">{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="p-4 pt-0 text-muted-foreground">{children}</div>}
    </div>
  );
};
