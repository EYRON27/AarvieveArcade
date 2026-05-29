import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Save, ArrowLeft, Image as ImageIcon, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage, isMockFirebase } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AVATAR_SEEDS = ['Alpha', 'Bravo', 'Delta', 'Echo', 'Foxtrot', 'Gamer', 'Pixel', 'Retro'];

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarSeed,  setAvatarSeed]  = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAvatarSeed(''); // clear seed
      
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 128;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    try {
      setLoading(true); setSuccess(false);
      const updates: Record<string, string> = { displayName: displayName.trim() };
      
      if (selectedFile) {
        // Bypass Firebase Storage completely to prevent hanging uploads if the bucket isn't configured
        updates.avatarUrl = await compressImage(selectedFile);
      } else if (avatarSeed) {
        updates.avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}&backgroundColor=111111`;
      }
      
      await updateProfile(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) { 
      console.error(e); 
      alert('Failed to save profile. Please try again.');
    }
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
            <User className="w-5 h-5 text-arcade-blue" /> Player Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your arcade identity and avatar</p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-arcade-green/10 border border-arcade-green/30 text-arcade-green rounded-lg text-xs font-bold tracking-widest uppercase text-center pixel-text"
          >
            ✓ Profile updated
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card preview */}
          <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4">
            <h3 className="pixel-text text-[9px] text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2.5 w-full text-center">
              PLAYER CARD
            </h3>
            <div className="relative">
              <img
                src={previewUrl 
                  ? previewUrl 
                  : (avatarSeed
                    ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}&backgroundColor=111111`
                    : user.avatarUrl)}
                alt={displayName}
                className="w-24 h-24 rounded-xl bg-arcade-dark border border-white/10 p-1 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-arcade-green rounded-full border-2 border-arcade-darker" />
            </div>
            <div className="text-center">
              <span className="pixel-text text-[9px] bg-arcade-blue/10 border border-arcade-blue/25 text-arcade-blue rounded px-2 py-0.5">P1</span>
              <h2 className="text-sm font-bold text-white mt-2">{displayName}</h2>
              <p className="text-[10px] text-slate-600 truncate max-w-[140px]">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-slate-600">
                <span>{user.totalPoints} pts</span>
                <span>·</span>
                <span>{user.streak}d streak</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="md:col-span-2 glass-card border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
            <h2 className="pixel-text text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3">
              ACCOUNT SETTINGS
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">

              {/* Display Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text" required placeholder="Your username"
                    value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-blue/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email <span className="text-slate-700">(read-only)</span></label>
                <input
                  type="text" readOnly value={user.email}
                  className="w-full bg-arcade-darker border border-white/5 rounded-lg py-3 px-4 text-slate-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Avatar picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Choose Avatar
                </label>
                
                {/* Custom Upload */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-bold uppercase tracking-wider transition-all
                    ${selectedFile ? 'border-arcade-blue text-arcade-blue bg-arcade-blue/10' : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  <Upload className="w-4 h-4" />
                  {selectedFile ? 'IMAGE SELECTED' : 'UPLOAD CUSTOM IMAGE'}
                </button>

                <div className="flex items-center gap-2 my-2">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">OR CHOOSE PRESET</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {AVATAR_SEEDS.map(seed => (
                    <button
                      key={seed} type="button"
                      onClick={() => {
                        setAvatarSeed(seed);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className={`border rounded-lg p-1 transition-all bg-arcade-dark hover:bg-arcade-darker ${
                        avatarSeed === seed ? 'border-arcade-blue ring-1 ring-arcade-blue/40' : 'border-white/8'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=111111`}
                        alt={seed} className="w-9 h-9 rounded-md"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full mt-2 bg-arcade-blue hover:bg-arcade-blue-hover text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 text-sm tracking-wider transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
