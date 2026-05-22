import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FooterCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-arcade-red/5" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">Ready to Play?</h2>
            <p className="text-slate-400 text-xl mb-10">Create a free account and start climbing the leaderboards today.</p>
            <button
              onClick={() => navigate('/register')}
              className="bg-arcade-red hover:bg-red-500 text-white font-black rounded-2xl px-12 py-5 text-lg tracking-widest uppercase transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.6)] hover:-translate-y-1"
            >
              Create Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-black text-center">
        <p className="pixel-text text-slate-700 text-[10px] tracking-widest uppercase">
          AARVIEVE STUDIOS — ARCADE PLATFORM v1.0
        </p>
      </footer>
    </>
  );
};

export default FooterCTA;
