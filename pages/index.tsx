import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [leagues, setLeagues] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLeagues() {
      const { data } = await supabase.from('leagues').select('*');
      if (data) setLeagues(data);
    }
    fetchLeagues();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 font-sans">
      <nav className="border-b border-gray-800 bg-gray-900/80 p-5 flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-xl font-black tracking-wider text-emerald-400">FUTBOL ANALİZ</div>
        <div className="flex gap-6 text-sm font-semibold">
          <Link href="/" className="text-emerald-400">Ana Sayfa</Link>
          <Link href="/admin" className="text-gray-400 hover:text-white">Yönetim Paneli</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Ligler & Takım Analizleri</h1>
        <p className="text-gray-400 mb-8">İncelemek istediğiniz ligi seçerek takımların taktik ve kadro analizlerine ulaşın.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <div key={league.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer">
              <h2 className="text-xl font-bold text-emerald-400 mb-1">{league.name}</h2>
              <p className="text-xs text-gray-400">{league.country}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
