import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import MemberSinceCounter from '../components/dashboard/MemberSinceCounter';
import QuickPlayGrid from '../components/dashboard/QuickPlayGrid';
import ProgressOverview from '../components/dashboard/ProgressOverview';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { achievements, gallery, scores, fetchInitialData } = useGameStore();

  const [memberSince, setMemberSince] = useState({ days: 0, hours: 0, mins: 0 });
  const [playtime, setPlaytime] = useState({ days: 0, hours: 0, mins: 0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (user?.uid) fetchInitialData(user.uid);
  }, [user?.uid]);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12)      setGreeting('Good morning');
    else if (hr < 17) setGreeting('Good afternoon');
    else              setGreeting('Good evening');
  }, []);

  // Account age counter
  useEffect(() => {
    const calc = () => {
      const since = new Date(user?.createdAt || Date.now());
      const diff  = Math.max(0, Date.now() - since.getTime());
      const secs  = Math.floor(diff / 1000);
      const mins  = Math.floor(secs / 60);
      const hrs   = Math.floor(mins / 60);
      const days  = Math.floor(hrs / 24);
      setMemberSince({ days, hours: hrs % 24, mins: mins % 60 });
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [user]);

  // Playtime counter
  useEffect(() => {
    const secs = user?.totalPlaytime || 0;
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    setPlaytime({ days, hours: hrs % 24, mins: mins % 60 });
  }, [user?.totalPlaytime]);

  if (!user) return null;

  const unlockedAch = achievements.filter(a => a.isUnlocked).length;
  const unlockedGal = gallery.filter(g => g.isUnlocked).length;

  // Top score across all games
  const topScore = Object.values(scores)
    .flat()
    .filter(s => s.userId === user.uid)
    .reduce((best, s) => Math.max(best, s.score), 0);

  const featuredGames = [
    { id: 'flappyBird',         title: 'Flappy Bird',      icon: '🦅', tag: 'ARCADE',  color: 'border-arcade-red/25   hover:border-arcade-red/70'   },
    { id: 'snake',              title: 'Snake',            icon: '🐍', tag: 'RETRO',   color: 'border-arcade-green/25 hover:border-arcade-green/70' },
    { id: 'ticTacToe',          title: 'Tic Tac Toe',      icon: '❌', tag: 'VS AI',   color: 'border-arcade-blue/25  hover:border-arcade-blue/70'  },
    { id: 'memoryGame',         title: 'Memory Cards',     icon: '🧠', tag: 'PUZZLE',  color: 'border-arcade-red/25   hover:border-arcade-red/70'   },
    { id: 'reactionGame',       title: 'Reaction Clicker', icon: '⚡', tag: 'REFLEX',  color: 'border-arcade-green/25 hover:border-arcade-green/70' },
    { id: 'relationshipTrivia', title: 'Arcade Trivia',    icon: '🎯', tag: 'TRIVIA',  color: 'border-arcade-blue/25  hover:border-arcade-blue/70'  },
  ];

  return (
    <div className="relative min-h-screen bg-arcade-darker text-white pb-20 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[250px] bg-arcade-red/4 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[250px] bg-arcade-blue/4 filter blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">
        
        <DashboardHeader 
          greeting={greeting}
          userDisplayName={user.displayName}
          sessionTime={memberSince}
          totalPoints={user.totalPoints}
          unlockedAch={unlockedAch}
          unlockedGal={unlockedGal}
        />

        <MemberSinceCounter sessionTime={playtime} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <QuickPlayGrid featuredGames={featuredGames} />
          
          <ProgressOverview 
            totalPoints={user.totalPoints}
            topScore={topScore || '—'}
            unlockedAch={unlockedAch}
            totalAch={achievements.length}
            achievements={achievements}
          />
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
