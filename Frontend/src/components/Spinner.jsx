// src/components/Spinner.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function Spinner({ size = 20 }) {
  return (
    <motion.div
      className="border-4 border-accent-gradient-start border-t-transparent rounded-full"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
    />
  );
}
