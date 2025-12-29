
import React, { useState, useMemo } from 'react';
import { Player, CalculationState } from './types';
import { formatCurrency, parseNumber } from './utils';

const App: React.FC = () => {
  const getInitialState = (): CalculationState => ({
    courtCost: 0,
    shuttleBoxCost: 0,
    players: Array.from({ length: 5 }, (_, i) => ({
      id: (i + 1).toString(),
      name: '',
      sessions: 0,
    })),
  });

  const [state, setState] = useState<CalculationState>(getInitialState());

  // Calculations
  const totalAmount = useMemo(() => state.courtCost + state.shuttleBoxCost, [state.courtCost, state.shuttleBoxCost]);
  const totalSessions = useMemo(() => state.players.reduce((sum, p) => sum + p.sessions, 0), [state.players]);
  
  // Rounded to nearest zero (whole number)
  const costPerSession = useMemo(() => (totalSessions > 0 ? Math.round(totalAmount / totalSessions) : 0), [totalAmount, totalSessions]);

  const playersWithCosts = useMemo(() => {
    return state.players.map(player => ({
      ...player,
      // Rounded to nearest zero (whole number)
      perHead: Math.round(player.sessions * costPerSession)
    }));
  }, [state.players, costPerSession]);

  const totalPerHead = useMemo(() => playersWithCosts.reduce((sum, p) => sum + p.perHead, 0), [playersWithCosts]);

  // Handlers
  const handleCostChange = (field: 'courtCost' | 'shuttleBoxCost', value: string) => {
    setState(prev => ({ ...prev, [field]: parseNumber(value) }));
  };

  const handlePlayerChange = (id: string, field: keyof Player, value: string) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === id) {
          return {
            ...p,
            [field]: field === 'sessions' ? Math.max(0, parseInt(value) || 0) : value
          };
        }
        return p;
      })
    }));
  };

  const addPlayer = () => {
    const newId = Date.now().toString();
    setState(prev => ({
      ...prev,
      players: [...prev.players, { id: newId, name: '', sessions: 0 }]
    }));
  };

  const removePlayer = (id: string) => {
    if (state.players.length <= 1) {
      clearAll();
      return;
    }
    setState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }));
  };

  const clearAll = () => {
    setState(getInitialState());
  };

  const shareOnWhatsApp = () => {
    const activePlayers = playersWithCosts.filter(p => p.sessions > 0 || p.name.trim() !== '');
    
    let message = `🏸 *Badminton Session Summary* 🏸\n`;
    message += `--------------------------------\n`;
    message += `🏟️ *Court:* ₹${state.courtCost}\n`;
    message += `🏸 *Shuttle:* ₹${state.shuttleBoxCost}\n`;
    message += `💰 *Total Amount:* ₹${totalAmount}\n`;
    message += `--------------------------------\n`;
    message += `*Player Breakdown:*\n`;

    activePlayers.forEach((p, index) => {
      const playerName = p.name.trim() || `Player ${index + 1}`;
      message += `👤 ${playerName}: ${p.sessions} sess. -> *₹${Math.round(p.perHead)}*\n`;
    });

    message += `--------------------------------\n`;
    message += `📊 *Total Sessions:* ${totalSessions}\n`;
    message += `💸 *Cost Per Session:* ₹${Math.round(costPerSession)}\n`;
    message += `--------------------------------\n`;
    message += `_Calculated via Badminton Share Tool_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
        
        {/* Header Branding */}
        <div className="bg-slate-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Badminton Court Booking Share Calculator</h1>
          <p className="text-slate-400 text-sm mt-1">Split costs fairly based on player attendance</p>
        </div>

        <div className="p-1 md:p-6 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-sm md:text-base font-sans">
            <thead>
              {/* Main Header */}
              <tr className="bg-[#9dbce3]">
                <th colSpan={3} className="border border-slate-800 p-2 text-center font-bold text-lg uppercase">
                  Calculation
                </th>
              </tr>
              {/* Sub Headers */}
              <tr className="bg-[#9dbce3]">
                <th className="border border-slate-800 p-2 text-left w-1/3">Item</th>
                <th colSpan={2} className="border border-slate-800 p-2 text-left w-2/3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Costs Inputs */}
              <tr>
                <td className="border border-slate-800 p-2 bg-[#9dbce3] font-medium">Court</td>
                <td colSpan={2} className="border border-slate-800 p-0 relative">
                  <div className="flex items-center px-2 py-2">
                    <span className="mr-1 text-slate-500 font-semibold">₹</span>
                    <input
                      type="number"
                      value={state.courtCost || ''}
                      onChange={(e) => handleCostChange('courtCost', e.target.value)}
                      className="w-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 transition-all"
                      placeholder="0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-800 p-2 bg-[#9dbce3] font-medium">Shuttle Box</td>
                <td colSpan={2} className="border border-slate-800 p-0">
                  <div className="flex items-center px-2 py-2">
                    <span className="mr-1 text-slate-500 font-semibold">₹</span>
                    <input
                      type="number"
                      value={state.shuttleBoxCost || ''}
                      onChange={(e) => handleCostChange('shuttleBoxCost', e.target.value)}
                      className="w-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 transition-all"
                      placeholder="0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-800 p-2 bg-[#9dbce3] font-bold">Total Amount</td>
                <td colSpan={2} className="border border-slate-800 p-2 bg-yellow-400 font-bold text-right">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>

              {/* Player Table Headers */}
              <tr className="bg-[#9dbce3] font-bold">
                <td className="border border-slate-800 p-2 text-center">Name</td>
                <td className="border border-slate-800 p-2 text-center"># of Sessions</td>
                <td className="border border-slate-800 p-2 text-center">Per Head</td>
              </tr>

              {/* Player Rows */}
              {playersWithCosts.map((player) => (
                <tr key={player.id} className="group">
                  <td className="border border-slate-800 p-0">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                        className="w-full p-2 focus:outline-none focus:bg-slate-50"
                        placeholder="Player Name"
                      />
                      <button 
                        onClick={() => removePlayer(player.id)}
                        className="opacity-0 group-hover:opacity-100 px-2 text-red-500 hover:text-red-700 transition-opacity"
                        title="Remove Player"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                  <td className="border border-slate-800 p-0">
                    <input
                      type="number"
                      value={player.sessions || ''}
                      onChange={(e) => handlePlayerChange(player.id, 'sessions', e.target.value)}
                      className="w-full p-2 text-center focus:outline-none focus:bg-slate-50"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="border border-slate-800 p-2 bg-yellow-300 text-right">
                    {formatCurrency(player.perHead)}
                  </td>
                </tr>
              ))}

              {/* Footer Calculations */}
              <tr>
                <td className="border border-slate-800 p-2 bg-[#9dbce3] font-bold text-center">Total</td>
                <td className="border border-slate-800 p-2 bg-yellow-400 text-center font-bold">
                  {totalSessions}
                </td>
                <td className="border border-slate-800 p-2 bg-yellow-400 text-right font-bold">
                  {formatCurrency(totalPerHead)}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-800 p-2 bg-[#9dbce3] font-bold">Cost Per Session</td>
                <td className="border border-slate-800 p-2 bg-yellow-400 font-bold text-center">
                  {formatCurrency(costPerSession)}
                </td>
                <td className="border border-slate-800 p-2 bg-yellow-400 text-center font-bold text-green-700">
                  {costPerSession > 0 ? 'OK' : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={addPlayer}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-all active:scale-95 text-sm"
            >
              + Add Player
            </button>
            <button 
              onClick={shareOnWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition-all active:scale-95 text-sm flex items-center gap-2"
            >
              <span className="text-lg leading-none">💬</span>
              Send to WhatsApp
            </button>
            <button 
              onClick={clearAll}
              className="bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 font-bold py-2 px-4 rounded border border-slate-300 transition-all active:scale-95 text-sm"
            >
              Clear All
            </button>
          </div>
          <div className="text-xs text-slate-500 uppercase font-semibold">
            Currency: INR (₹)
          </div>
        </div>
      </div>

      <div className="mt-8 text-slate-500 text-sm flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#9dbce3] border border-slate-800"></div>
            <span>Field Label</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 border border-slate-800"></div>
            <span>Calculation</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-white border border-slate-800"></div>
            <span>Editable</span>
          </div>
        </div>
        <p>© {new Date().getFullYear()} Dusi Club Management Tool</p>
      </div>
    </div>
  );
};

export default App;
