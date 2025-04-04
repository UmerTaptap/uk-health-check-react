import React from 'react';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          &copy; WA Chump & Sons {year}
        </div>
        <div className="flex items-center">
          <a 
            href="https://www.wachump.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            Visit our website <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;