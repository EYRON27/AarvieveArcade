import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Heart, Calendar, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVATAR_SEEDS = ['Aaron', 'Genevieve', 'Cupid', 'Gamer', 'Arcade', 'Retro', 'Lover', 'Pixel'];

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName,    setDisplayName]    = useState(user?.displayName    || '');
  const [girlfriendName, setGirlfriendName] = useState(user?.girlfriendName || 'Genevieve');
  const [anniversaryDate,setAnniversaryDate]= useState(user?.anniversaryDate|| '');
  const [avatarSeed,     setAvatarSeed]     = useState('');
  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !girlfriendName || !anniversaryDate) return;
    try {
      setLoading(true); setSuccess(false);
      const updates: any = { displayName, girlfriendName, anniversaryDate };
      if (avatarSeed) updates.avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}&backgroundColor=111111`;
      await updateProfile(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-arcade-darker text-white pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-300 uppercase tracking-widest mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-arcade-blue" />
            Player Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure your arcade card and game settings</p>
        </div>

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-arcade-green/10 border border-arcade-green/30 text-arcade-green rounded-lg text-xs font-bold tracking-widest uppercase text-center pixel-text"
          >
            ✓ Profile updated successfully
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Avatar card */}
          <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2.5 w-full text-center pixel-text">
              CABINET CARD
            </h3>
            <div className="relative">
              <img
                src={avatarSeed
                  ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}&backgroundColor=111111`
                  : user.avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-xl bg-arcade-dark border border-white/10 p-1 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-arcade-green rounded-full border-2 border-arcade-darker" />
            </div>
            <div className="text-center">
              <span className="text-[9px] font-bold bg-arcade-blue/15 border border-arcade-blue/30 text-arcade-blue rounded px-2 py-0.5 pixel-text">P1</span>
              <h2 className="text-sm font-bold text-white mt-1.5">{displayName}</h2>
              <p className="text-[10px] text-slate-600 truncate max-w-[140px]">{user.email}</p>
            </div>
          </div>

          {/* Settings form (col-span-2) */}
          <div className="md:col-span-2 glass-card border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold text-slate-300 border-b border-white/5 pb-3 uppercase tracking-widest pixel-text">
              Settings Panel
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">

              {/* Display Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">My Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text" required placeholder="Aaron"
                    value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-blue/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Partner Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Partner Name</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text" required placeholder="Genevieve"
                    value={girlfriendName} onChange={e => setGirlfriendName(e.target.value)}
                    className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-red/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Anniversary Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Anniversary Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="date" required
                    value={anniversaryDate} onChange={e => setAnniversaryDate(e.target.value)}
                    className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-red/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all font-mono"
                  />
                </div>
              </div>

              {/* Avatar picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_SEEDS.map(seed => (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setAvatarSeed(seed)}
                      className={`border rounded-lg p-1 transition-all bg-arcade-dark hover:bg-arcade-darker ${
                        avatarSeed === seed ? 'border-arcade-blue ring-1 ring-arcade-blue/50' : 'border-white/8'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=111111`}
                        alt={seed}
                        className="w-9 h-9 rounded-md"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                type="submit" disabled={loading}
                className="w-full mt-2 bg-arcade-blue hover:bg-arcade-blue-hover text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 text-sm tracking-widest transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

