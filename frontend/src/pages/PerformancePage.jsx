import { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowLeft, TrendingUp, Award, Calendar, Target, Star, Filter, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const PerformancePage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Admin cannot manage performance
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  const [athlete, setAthlete] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState(null);
  const [formData, setFormData] = useState({});
  const fetchedRef = useRef(false);

  const canEdit = ['admin', 'coach', 'sport_coordinator'].includes(user?.role);

  const sportMetrics = {
    basketball: {
      label: 'Basketball Stats',
      metrics: ['points', 'assists', 'rebounds', 'steals', 'blocks', 'turnovers'],
      statsCards: [
        { key: 'points', label: 'Total Points', color: 'blue' },
        { key: 'assists', label: 'Total Assists', color: 'green' },
        { key: 'rebounds', label: 'Total Rebounds', color: 'purple' },
        { key: 'steals', label: 'Total Steals', color: 'orange' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('points') || 0} pts`
    },
    football: {
      label: 'Football Stats',
      metrics: ['touchdowns', 'passingYards', 'rushingYards', 'tackles', 'sacks', 'interceptions'],
      statsCards: [
        { key: 'touchdowns', label: 'Touchdowns', color: 'blue' },
        { key: 'passingYards', label: 'Pass Yards', color: 'green' },
        { key: 'rushingYards', label: 'Rush Yards', color: 'purple' },
        { key: 'tackles', label: 'Tackles', color: 'orange' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('touchdowns') || 0} TD`
    },
    volleyball: {
      label: 'Volleyball Stats',
      metrics: ['kills', 'digs', 'aces', 'blocks', 'assists', 'serviceErrors'],
      statsCards: [
        { key: 'kills', label: 'Total Kills', color: 'blue' },
        { key: 'digs', label: 'Total Digs', color: 'green' },
        { key: 'aces', label: 'Total Aces', color: 'purple' },
        { key: 'blocks', label: 'Total Blocks', color: 'orange' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('kills') || 0} kills`
    },
    swimming: {
      label: 'Swimming Stats',
      metrics: ['time', 'distance', 'strokes', 'lapCount', 'rank'],
      statsCards: [
        { key: 'bestTime', label: 'Best Time', color: 'blue' },
        { key: 'eventsCompleted', label: 'Events', color: 'green' },
        { key: 'goldMedals', label: 'Gold', color: 'yellow' },
        { key: 'silverMedals', label: 'Silver', color: 'gray' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('time') || '-'}s`
    },
    athletics: {
      label: 'Athletics Stats',
      metrics: ['time', 'distance', 'height', 'position', 'personalBest'],
      statsCards: [
        { key: 'eventsCompleted', label: 'Events', color: 'blue' },
        { key: 'goldMedals', label: 'Gold', color: 'yellow' },
        { key: 'personalBests', label: 'PBs', color: 'green' },
        { key: 'recordsBroken', label: 'Records', color: 'purple' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('position') || '-'} place`
    },
    badminton: {
      label: 'Badminton Stats',
      metrics: ['points', 'wins', 'losses', 'aces', 'smashes'],
      statsCards: [
        { key: 'matchesWon', label: 'Wins', color: 'green' },
        { key: 'matchesLost', label: 'Losses', color: 'red' },
        { key: 'winRate', label: 'Win Rate', color: 'blue' },
        { key: 'tournamentsWon', label: 'Titles', color: 'purple' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('wins') || 0}-${perf.statistics?.customMetrics?.get('losses') || 0}`
    },
    tennis: {
      label: 'Tennis Stats',
      metrics: ['setsWon', 'gamesWon', 'aces', 'doubleFaults', 'breakPoints'],
      statsCards: [
        { key: 'matchesWon', label: 'Matches', color: 'green' },
        { key: 'setsWon', label: 'Sets', color: 'blue' },
        { key: 'gamesWon', label: 'Games', color: 'purple' },
        { key: 'aces', label: 'Aces', color: 'yellow' },
      ],
      getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('setsWon') || 0} sets`
    },
  };

  const defaultMetrics = {
    label: 'Performance Stats',
    metrics: ['score', 'rating'],
    statsCards: [
      { key: 'totalScore', label: 'Total Score', color: 'blue' },
      { key: 'averageRating', label: 'Avg Rating', color: 'green' },
      { key: 'eventsPlayed', label: 'Events', color: 'purple' },
      { key: 'bestScore', label: 'Best', color: 'orange' },
    ],
    getDisplay: (perf) => `${perf.statistics?.customMetrics?.get('score') || 0} pts`
  };

  const getStatValue = (perf, key) => {
    return perf.statistics?.customMetrics?.get(key) ?? perf.statistics?.[key] ?? '-';
  };

  const calculateTotals = (sport) => {
    const currentSport = sportMetrics[sport?.toLowerCase()] || defaultMetrics;
    const totals = {};
    currentSport.statsCards.forEach(card => {
      if (card.key === 'winRate') {
        const wins = performances.reduce((sum, p) => sum + (getStatValue(p, 'wins') || 0), 0);
        const losses = performances.reduce((sum, p) => sum + (getStatValue(p, 'losses') || 0), 0);
        totals[card.key] = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) + '%' : '0%';
      } else if (card.key === 'bestTime') {
        const times = performances.map(p => getStatValue(p, 'time')).filter(t => t && t > 0);
        totals[card.key] = times.length ? Math.min(...times) + 's' : '-';
      } else if (card.key === 'averageRating') {
        const ratings = performances.map(p => getStatValue(p, 'rating')).filter(r => r);
        totals[card.key] = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '-';
      } else if (card.key === 'totalScore') {
        totals[card.key] = performances.reduce((sum, p) => sum + (getStatValue(p, 'score') || 0), 0);
      } else if (card.key === 'bestScore') {
        const scores = performances.map(p => getStatValue(p, 'score')).filter(s => s && s > 0);
        totals[card.key] = scores.length ? Math.max(...scores) : 0;
      } else if (card.key === 'eventsPlayed' || card.key === 'eventsCompleted') {
        totals[card.key] = performances.length;
      } else {
        totals[card.key] = performances.reduce((sum, p) => sum + (getStatValue(p, card.key) || 0), 0);
      }
    });
    return totals;
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let athleteId = id;
      
      // For athlete role - get their own profile
      if (!athleteId && user?.role === 'athlete') {
        const profileRes = await api.get(`/athletes/user/${user._id}`);
        if (profileRes.data) {
          setAthlete(profileRes.data);
          athleteId = profileRes.data._id;
        }
      } 
      // For admin/coach/sport_coordinator with id - get specific athlete
      else if (id) {
        const profileRes = await api.get(`/athletes/${id}`);
        setAthlete(profileRes.data);
      }
      // For coach/admin with no id - show athletes list they manage
      else if ((user?.role === 'coach' || user?.role === 'admin' || user?.role === 'sport_coordinator') && !id) {
        const athletesRes = await api.get('/athletes');
        setAthletes(athletesRes.data.athletes || []);
        setLoading(false);
        return;
      }

      if (athleteId) {
        const perfRes = await api.get(`/athletes/${athleteId}/performance`);
        setPerformances(perfRes.data.performances || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    const initialData = {};
    currentSport.metrics.forEach(m => {
      initialData[m] = '';
    });
    setFormData(initialData);
    setEditingPerformance(null);
    setShowAddModal(true);
  };

  const openEditModal = (perf) => {
    const editData = {};
    currentSport.metrics.forEach(m => {
      editData[m] = getStatValue(perf, m) || '';
    });
    setFormData(editData);
    setEditingPerformance(perf);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      const customMetrics = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          const numValue = parseFloat(formData[key]);
          customMetrics[key] = isNaN(numValue) ? formData[key] : numValue;
        }
      });

      const payload = {
        athleteId: athlete._id,
        statistics: { customMetrics }
      };

      if (editingPerformance) {
        await api.put(`/athletes/performance/${editingPerformance._id}`, payload);
      } else {
        await api.post(`/athletes/${athlete._id}/performance`, payload);
      }

      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save performance:', error);
      alert('Failed to save performance record');
    }
  };

  const handleDelete = async (performanceId) => {
    if (!confirm('Are you sure you want to delete this performance record?')) return;
    try {
      await api.delete(`/athletes/performance/${performanceId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete performance:', error);
      alert('Failed to delete performance record');
    }
  };

  const currentSport = sportMetrics[athlete?.sport?.primary?.toLowerCase()] || defaultMetrics;
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700' },
    gray: { bg: 'bg-slate-50', text: 'text-slate-700' },
  };

  const totals = calculateTotals(athlete?.sport?.primary);

  const filteredPerformances = filter === 'all' 
    ? performances 
    : performances.filter(p => p.eventId?.title?.toLowerCase().includes(filter.toLowerCase()));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Performance Records</h1>
            <p className="text-slate-500">
              {athlete ? `${athlete.userId?.firstName} ${athlete.userId?.lastName}` : 'My Performance'}
            </p>
          </div>
        </div>
      </div>

      {athlete && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {athlete.userId?.firstName?.charAt(0)}{athlete.userId?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {athlete.userId?.firstName} {athlete.userId?.lastName}
              </h2>
              <p className="text-slate-500 capitalize">{athlete.sport?.primary} - {athlete.sport?.position || 'Athlete'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Athlete List for Coaches/Admins */}
      {!athlete && athletes.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-slate-800">Manage Athlete Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Athlete</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Sport</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Position</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map(ath => (
                  <tr key={ath._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {ath.userId?.firstName?.charAt(0)}{ath.userId?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{ath.userId?.firstName} {ath.userId?.lastName}</p>
                          <p className="text-sm text-slate-500">{ath.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-800 capitalize">{ath.sport?.primary || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-800">{ath.sport?.position || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/performance/${ath._id}`}>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                          View Performance
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {performances.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentSport.statsCards.map((card) => (
              <div key={card.key} className={`p-4 rounded-lg ${colorMap[card.color].bg}`}>
                <p className="text-sm text-slate-600">{card.label}</p>
                <p className={`text-2xl font-bold ${colorMap[card.color].text}`}>
                  {totals[card.key] || 0}
                </p>
              </div>
            ))}
          </div>

          {canEdit && athlete && (
            <div className="mb-4">
              <Button onClick={() => openAddModal()}>
                <Plus size={18} className="mr-2" />
                Add Performance Record
              </Button>
            </div>
          )}

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-800">{currentSport.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by event..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Performance</th>
                    {currentSport.metrics.slice(0, 4).map(m => (
                      <th key={m} className="text-left py-3 px-4 text-sm font-medium text-slate-500 capitalize">
                        {m.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformances.map((perf) => (
                    <tr key={perf._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {perf.createdAt ? new Date(perf.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {perf.eventId?.title || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {perf.eventId?.type || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-purple-600">
                        {currentSport.getDisplay ? currentSport.getDisplay(perf) : '-'}
                      </td>
                      {currentSport.metrics.slice(0, 4).map(m => (
                        <td key={m} className="py-3 px-4 text-sm text-slate-800">
                          {getStatValue(perf, m) || 0}
                        </td>
                      ))}
                      {canEdit && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(perf)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(perf._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPerformances.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No performances match your filter
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Award size={64} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Performance Records</h3>
            <p className="text-slate-500">Your performance data will appear here once recorded by coaches.</p>
          </div>
        </Card>
      )}
    </div>
  );

  /* Add/Edit Performance Modal */
  if (showAddModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingPerformance ? 'Edit Performance' : 'Add Performance Record'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Enter the performance statistics for {athlete?.userId?.firstName} {athlete?.userId?.lastName}
          </p>
          <div className="space-y-3 mb-6">
            {currentSport.metrics.map(m => (
              <div key={m}>
                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                  {m.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  value={formData[m] || ''}
                  onChange={(e) => setFormData({ ...formData, [m]: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${m}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingPerformance ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default PerformancePage;