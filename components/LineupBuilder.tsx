import React, { useState } from 'react';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  x: number;
  y: number;
}

interface LineupBuilderProps {
  initialFormation?: string;
  initialPlayers?: Player[];
  isEditable?: boolean;
  onSave?: (formation: string, players: Player[]) => void;
}

const DEFAULT_PLAYERS: Player[] = [
  { id: '1', name: 'Kaleci', number: 1, position: 'GK', x: 50, y: 90 },
  { id: '2', name: 'Sol Bek', number: 3, position: 'DEF', x: 15, y: 70 },
  { id: '3', name: 'Stoper 1', number: 4, position: 'DEF', x: 38, y: 75 },
  { id: '4', name: 'Stoper 2', number: 5, position: 'DEF', x: 62, y: 75 },
  { id: '5', name: 'Sağ Bek', number: 2, position: 'DEF', x: 85, y: 70 },
  { id: '6', name: 'Dos', number: 6, position: 'MID', x: 50, y: 55 },
  { id: '7', name: 'Merkez Orta', number: 8, position: 'MID', x: 32, y: 45 },
  { id: '8', name: 'Ofansif Orta', number: 10, position: 'MID', x: 68, y: 45 },
  { id: '9', name: 'Sol Kanat', number: 11, position: 'FWD', x: 18, y: 22 },
  { id: '10', name: 'Santrafor', number: 9, position: 'FWD', x: 50, y: 15 },
  { id: '11', name: 'Sağ Kanat', number: 7, position: 'FWD', x: 82, y: 22 },
];

export const LineupBuilder: React.FC<LineupBuilderProps> = ({
  initialFormation = '4-3-3',
  initialPlayers = DEFAULT_PLAYERS,
  isEditable = false,
  onSave,
}) => {
  const [formation, setFormation] = useState(initialFormation);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleDrag = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x: Math.round(x), y: Math.round(y) } : p))
    );
  };

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-white shadow-2xl">
      {isEditable && (
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-emerald-400">Diziliş:</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="4-3-3">4-3-3</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="4-4-2">4-4-2</option>
              <option value="3-5-2">3-5-2</option>
              <option value="3-4-3">3-4-3</option>
            </select>
          </div>

          <button
            onClick={() => onSave && onSave(formation, players)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all duration-200 shadow-lg shadow-emerald-900/30"
          >
            Dizilişi Kaydet
          </button>
        </div>
      )}

      <div className="relative w-full max-w-2xl mx-auto aspect-[2/3] md:aspect-[3/2] bg-emerald-900/40 border-4 border-emerald-500/60 rounded-xl overflow-hidden shadow-inner flex justify-center items-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_10%]" />
        <div className="absolute inset-2 border-2 border-emerald-400/30 rounded-md pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/30 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-emerald-400/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-b-2 border-x-2 border-emerald-400/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-t-2 border-x-2 border-emerald-400/30" />
        </div>

        {players.map((player) => (
          <div
            key={player.id}
            onMouseDown={(e) => handleDrag(player.id, e)}
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
            onClick={() => isEditable && setSelectedPlayer(player)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${
              isEditable ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 ${
                player.position === 'GK'
                  ? 'bg-amber-500 border-amber-300 text-black'
                  : player.position === 'DEF'
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : player.position === 'MID'
                  ? 'bg-emerald-600 border-emerald-300 text-white'
                  : 'bg-red-600 border-red-400 text-white'
              }`}
            >
              {player.number}
            </div>
            <span className="mt-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-emerald-300 border border-emerald-500/30 whitespace-nowrap shadow-md">
              {player.name}
            </span>
          </div>
        ))}
      </div>

      {isEditable && selectedPlayer && (
        <div className="mt-6 p-4 bg-gray-800/80 rounded-lg border border-gray-700 flex flex-wrap gap-4 items-center">
          <span className="text-xs font-semibold text-emerald-400 uppercase">
            Oyuncu Düzenle (#{selectedPlayer.number}):
          </span>
          <input
            type="text"
            value={selectedPlayer.name}
            onChange={(e) => handlePlayerNameChange(selectedPlayer.id, e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
            placeholder="Oyuncu İsmi"
          />
        </div>
      )}
    </div>
  );
};
