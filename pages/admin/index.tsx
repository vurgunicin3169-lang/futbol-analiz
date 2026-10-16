import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LineupBuilder, Player } from '../../components/LineupBuilder';
import Link from 'next/link';

export default function AdminDashboard() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [teamData, setTeamData] = useState({
    name: '',
    league_id: '',
    logo_url: '',
    short_description: '',
    status_tag: 'Formda',
  });

  const [sections, setSections] = useState([
    { title: 'Takımın Genel Durumu', imageUrl: '', content: '' },
    { title: 'Taktiksel Analiz', imageUrl: '', content: '' },
    { title: 'İlk 11 ve Saha Dizilişi', imageUrl: '', content: '' },
    { title: 'Öne Çıkan Oyuncular', imageUrl: '', content: '' },
    { title: 'Gelişim Alanları ve Gelecek Beklentisi', imageUrl: '', content: '' },
  ]);

  const [lineup, setLineup] = useState<{ formation: string; players: Player[] }>({
    formation: '4-3-3',
    players: [],
  });

  useEffect(() => {
    async function loadLeagues() {
      const { data } = await supabase.from('leagues').select('*');
      if (data && data.length > 0) {
        setLeagues(data);
        setTeamData((prev) => ({ ...prev, league_id: data[0].id }));
      }
    }
    loadLeagues();
  }, []);

  const handleSaveAll = async () => {
    setStatusMessage(null);
    if (!teamData.name || !teamData.league_id) {
      setStatusMessage({ type: 'error', text: 'Lütfen takım adını ve lig seçimini doldurun.' });
      return;
    }

    try {
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .upsert({
          ...teamData,
          slug: teamData.name.toLowerCase().replace(/\s+/g, '-'),
        })
        .select()
        .single();

      if (teamErr) throw teamErr;

      const analysesPayload = sections.map((sec, idx) => ({
        team_id: team.id,
        section_index: idx + 1,
        title: sec.title,
        image_url: sec.imageUrl,
        content: sec.content,
      }));

      const { error: analysisErr } = await supabase.from('team_analyses').upsert(analysesPayload);
      if (analysisErr) throw analysisErr;

      if (lineup.players.length > 0) {
        const { error: lineupErr } = await supabase.from('lineups').upsert({
          team_id: team.id,
          formation: lineup.formation,
          players: lineup.players,
        });
        if (lineupErr) throw lineupErr;
      }

      setStatusMessage({ type: 'success', text: 'Takım analizi ve İlk 11 dizilişi başarıyla kaydedildi!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Hata oluştu: ${err.message}` });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 p-6 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Yönetim Paneli</h1>
          <p className="text-xs text-gray-400">Yeni takım analizi ve diziliş ekleyin</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="bg-gray-800 hover:bg-gray-700 text-xs px-4 py-2.5 rounded-lg text-gray-300 font-semibold transition-all">
            ← Ana Sayfaya Dön
          </Link>
          <button
            onClick={handleSaveAll}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            Değişiklikleri Yayınla
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-lg mb-6 text-sm font-medium ${
            statusMessage.type === 'success' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500' : 'bg-red-900/50 text-red-300 border border-red-500'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-gray-800 pb-2">Takım Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Takım Adı</label>
            <input
              type="text"
              value={teamData.name}
              onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Örn: Galatasaray"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Bağlı Olduğu Lig</label>
            <select
              value={teamData.league_id}
              onChange={(e) => setTeamData({ ...teamData, league_id: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {leagues.map((lg) => (
                <option key={lg.id} value={lg.id}>
                  {lg.name} ({lg.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Logo Görsel URL</label>
            <input
              type="text"
              value={teamData.logo_url}
              onChange={(e) => setTeamData({ ...teamData, logo_url: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Durum Etiketi</label>
            <input
              type="text"
              value={teamData.status_tag}
              onChange={(e) => setTeamData({ ...teamData, status_tag: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Örn: Formda, Yükselişte..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <h2 className="text-base font-semibold text-white">5 Görselli Analiz Kartı</h2>
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase">Bölüm {idx + 1}</span>
            <input
              type="text"
              value={sec.title}
              onChange={(e) => {
                const newSecs = [...sections];
                newSecs[idx].title = e.target.value;
                setSections(newSecs);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm font-semibold text-white"
            />
            {idx === 2 ? (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">İlk 11 Etkileşimli Saha Düzenleyicisi:</p>
                <LineupBuilder
                  initialFormation={lineup.formation}
                  initialPlayers={lineup.players}
                  isEditable={true}
                  onSave={(formation, players) => setLineup({ formation, players })}
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder="Görsel URL (Görsel bağlantısı)"
                value={sec.imageUrl}
                onChange={(e) => {
                  const newSecs = [...sections];
                  newSecs[idx].imageUrl = e.target.value;
                  setSections(newSecs);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-gray-300"
              />
            )}
            <textarea
              rows={4}
              placeholder="Analiz detaylarınızı yazın..."
              value={sec.content}
              onChange={(e) => {
                const newSecs = [...sections];
                newSecs[idx].content = e.target.value;
                setSections(newSecs);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
