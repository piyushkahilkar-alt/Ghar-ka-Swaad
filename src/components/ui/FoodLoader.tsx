import { motion } from 'motion/react';
import { UtensilsCrossed, Cherry, Soup } from 'lucide-react';

export default function FoodLoader() {
  return (
    <div className="flex flex-col h-full min-h-[60vh] items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Pot */}
        <motion.div
           initial={{ y: 0 }}
           animate={{ y: [-5, 5, -5] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="absolute text-brand-primary z-10"
        >
          <Soup size={64} />
        </motion.div>
        
        {/* Steam particles */}
        <motion.div
          className="absolute -top-6 left-1/4 w-2 h-6 bg-brand-accent/40 rounded-full blur-[2px]"
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: [0, 0.8, 0], y: -20, scale: 1.5 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
        />
        <motion.div
          className="absolute -top-8 left-1/2 w-2 h-8 bg-brand-accent/40 rounded-full blur-[2px]"
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: [0, 0.8, 0], y: -25, scale: 1.5 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        <motion.div
          className="absolute -top-6 right-1/4 w-2 h-6 bg-brand-accent/40 rounded-full blur-[2px]"
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: [0, 0.8, 0], y: -20, scale: 1.5 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
        />
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-brand-primary font-serif font-medium text-lg tracking-wider"
      >
        Preparing your meal...
      </motion.p>
    </div>
  );
}
