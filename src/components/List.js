'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { CheckCircle, Play, BookmarkPlus, Hourglass, PauseCircle, XCircle } from 'lucide-react';

const LISTS = [
  { key: 'viewed',   label: 'Viewed',                  icon: CheckCircle,  accent: 'text-green-400' },
  { key: 'current',  label: 'Reading / Watching Now',  icon: Play,         accent: 'text-emerald-400' },
  { key: 'planned',  label: 'Will Read / Watch',       icon: BookmarkPlus, accent: 'text-blue-400' },
  { key: 'awaiting', label: 'Awaiting',                icon: Hourglass,    accent: 'text-amber-400' },
  { key: 'delayed',  label: 'Delayed',                 icon: PauseCircle,  accent: 'text-purple-400' },
  { key: 'dropped',  label: 'Dropped',                 icon: XCircle,      accent: 'text-red-400' },
];

// Color schemes per content type
const COLOR_SCHEMES = {
  anime: {
    gradient: 'from-purple-600 to-violet-600',
    activeGradient: 'from-purple-600/30 to-violet-600/30',
    activeBorder: 'border-purple-500/50',
    hoverBg: 'hover:bg-purple-500/10',
  },
  donghua: {
    gradient: 'from-green-600 to-emerald-600',
    activeGradient: 'from-green-600/30 to-emerald-600/30',
    activeBorder: 'border-green-500/50',
    hoverBg: 'hover:bg-green-500/10',
  },
  manga: {
    gradient: 'from-blue-600 to-cyan-600',
    activeGradient: 'from-blue-600/30 to-cyan-600/30',
    activeBorder: 'border-blue-500/50',
    hoverBg: 'hover:bg-blue-500/10',
  },
  manhwa: {
    gradient: 'from-pink-600 to-rose-600',
    activeGradient: 'from-pink-600/30 to-rose-600/30',
    activeBorder: 'border-pink-500/50',
    hoverBg: 'hover:bg-pink-500/10',
  },
  manhua: {
    gradient: 'from-yellow-600 to-amber-600',
    activeGradient: 'from-yellow-600/30 to-amber-600/30',
    activeBorder: 'border-yellow-500/50',
    hoverBg: 'hover:bg-yellow-500/10',
  },
  novel: {
    gradient: 'from-indigo-600 to-blue-600',
    activeGradient: 'from-indigo-600/30 to-blue-600/30',
    activeBorder: 'border-indigo-500/50',
    hoverBg: 'hover:bg-indigo-500/10',
  },
  hentai: {
    gradient: 'from-red-600 to-pink-600',
    activeGradient: 'from-red-600/30 to-pink-600/30',
    activeBorder: 'border-red-500/50',
    hoverBg: 'hover:bg-red-500/10',
  },
};

export default function List({
  uid,
  contentType,
  currentUser,
  isDark = true,
}) {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  const colors = COLOR_SCHEMES[contentType] || COLOR_SCHEMES.anime;

  const total = useMemo(
    () => Object.values(counts).reduce((s, n) => s + n, 0),
    [counts]
  );

  useEffect(() => {
    if (!uid) return;
    const fetchData = async () => {
      setLoading(true);
      
      if (currentUser?.id) {
        const { data } = await supabase
          .from('user_lists')
          .select('status')
          .eq('user_id', currentUser.id)
          .eq('content_uid', uid)
          .single();
        if (data?.status) setCurrentStatus(data.status);
      }
      
      const { data: all } = await supabase
        .from('user_lists')
        .select('status')
        .eq('content_uid', uid);
      const next = {};
      all?.forEach(r => {
        if (r.status) next[r.status] = (next[r.status] || 0) + 1;
      });
      setCounts(next);
      setLoading(false);
    };
    fetchData();
  }, [uid, currentUser?.id]);

  const setStatus = async (statusKey) => {
    if (!currentUser?.id) {
      alert('Please log in to manage your list.');
      return;
    }
    
    setSaving(true);
    
    // Toggle off if clicking the same status
    if (currentStatus === statusKey) {
      const { error } = await supabase
        .from('user_lists')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('content_uid', uid);
        
      if (!error) {
        setCounts(prev => {
          const next = { ...prev };
          next[statusKey] = Math.max(0, (next[statusKey] || 1) - 1);
          return next;
        });
        setCurrentStatus(null);
      }
    } else {
      const { error } = await supabase
        .from('user_lists')
        .upsert(
          {
            user_id: currentUser.id,
            content_uid: uid,
            content_type: contentType,
            status: statusKey,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,content_uid' }
        );
        
      if (!error) {
        setCounts(prev => {
          const next = { ...prev };
          if (currentStatus) next[currentStatus] = Math.max(0, (next[currentStatus] || 1) - 1);
          next[statusKey] = (next[statusKey] || 0) + 1;
          return next;
        });
        setCurrentStatus(statusKey);
      } else {
        console.error(error);
      }
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-3`}>
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-12 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* List Options */}
      <div className="space-y-2">
        {LISTS.map(item => {
          const Icon = item.icon;
          const active = currentStatus === item.key;
          const count = counts[item.key] || 0;
          
          return (
            <button
              key={item.key}
              onClick={() => setStatus(item.key)}
              disabled={saving}
              className={`w-full group relative overflow-hidden rounded-xl transition-all ${
                active
                  ? `bg-gradient-to-r ${colors.activeGradient} border-2 ${colors.activeBorder} shadow-lg`
                  : isDark
                  ? 'bg-white/5 border border-white/10 hover:border-white/20'
                  : 'bg-black/5 border border-black/10 hover:border-black/20'
              } ${colors.hoverBg} disabled:opacity-50`}
            >
              <div className="relative z-10 flex items-center gap-3 px-4 py-3">
                <Icon size={20} className={item.accent} />
                <span className={`flex-1 text-left font-bold text-sm ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {item.label}
                </span>
                
                {/* Count Badge */}
                {count > 0 && (
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
                  }`}>
                    {count}
                  </div>
                )}
                
                {/* Active Indicator */}
                {active && (
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors.gradient} animate-pulse shadow-lg`} />
                )}
              </div>
              
              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </button>
          );
        })}
      </div>

      {/* Popularity Stats */}
      {total > 0 && (
        <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
          <p className={`text-xs font-bold mb-3 ${isDark ? 'text-white/60' : 'text-black/60'} uppercase tracking-wide`}>
            Community Stats • {total} user{total !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2.5">
            {LISTS.map(item => {
              const count = counts[item.key] || 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              
              if (count === 0) return null;
              
              return (
                <div key={item.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-medium ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      {item.label}
                    </span>
                    <span className={`font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      {count} • {pct}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r"
                      style={{
                        width: `${pct}%`,
                        backgroundImage: 
                          item.key === 'dropped' ? 'linear-gradient(to right, #f87171, #ef4444)' :
                          item.key === 'delayed' ? 'linear-gradient(to right, #a78bfa, #8b5cf6)' :
                          item.key === 'awaiting' ? 'linear-gradient(to right, #fbbf24, #f59e0b)' :
                          item.key === 'planned' ? 'linear-gradient(to right, #60a5fa, #3b82f6)' :
                          item.key === 'current' ? 'linear-gradient(to right, #34d399, #10b981)' :
                          'linear-gradient(to right, #22c55e, #16a34a)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}