import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturedGamesSection from '../components/landing/FeaturedGamesSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import FooterCTA from '../components/landing/FooterCTA';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-arcade-darker text-white overflow-x-hidden font-sans selection:bg-arcade-red/30">
      <HeroSection />
      <StatsSection />
      <FeaturedGamesSection />
      <FeaturesSection />
      <FooterCTA />
    </div>
  );
};

export default LandingPage;
