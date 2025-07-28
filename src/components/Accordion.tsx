import { useState } from 'react';
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export const Accordion = ({ title, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-lg mb-2 overflow-hidden transition-all duration-300 border border-transparent hover:border-primary/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-primary/5 transition-colors duration-200"
      >
        <span className="font-semibold text-primary">{title}</span>
        <ChevronDown
          className={`transform transition-transform duration-300 text-primary/70 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-4 pt-2 text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
