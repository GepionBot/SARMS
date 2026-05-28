import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/common/Card';
import { Users, Trophy, Calendar, Activity, AlertCircle, CheckCircle, TrendingUp, Award, Target } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Admin should only access user management
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  const [stats, setStats] = useState({
    athletes: 0,
    teams: 0,
    events: 0,
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [athleteProfile, setAthleteProfile] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [showPerformance, setShowPerformance] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user || fetchedRef.current) return;
    
    fetchedRef.current = true;
    fetchDashboardData();
    if (user.role === 'athlete') {
      fetchAthleteProfile();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      let upcomingEvents = [];
      if (user.role !== 'athlete') {
        const [athletesRes, teamsRes, eventsRes] = await Promise.all([
          api.get('/athletes'),
          api.get('/teams'),
          api.get('/events')
        ]);
        
        setStats({
          athletes: athletesRes.data.total || 0,
          teams: teamsRes.data.total || 0,
          events: eventsRes.data.total || 0,
          upcoming: eventsRes.data.events?.slice(0, 5) || []
        });
      } else {
        const eventsRes = await api.get('/events');
        upcomingEvents = eventsRes.data.events?.slice(0, 5) || [];
        setStats({
          athletes: 0,
          teams: 0,
          events: eventsRes.data.total || 0,
          upcoming: upcomingEvents
        });
      }
    } catch (error) {
      // Handle 403 for athletes - ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchAthleteProfile = async () => {
    if (!user?._id) return;
    
    try {
      const res = await api.get(`/athletes/user/${user._id}`);
      if (res.data) {
        setAthleteProfile(res.data);
        if (res.data._id) {
          const perfRes = await api.get(`/athletes/${res.data._id}/performance`);
          setPerformances(perfRes.data.performances || []);
        }
      }
    } catch (error) {
      // Silently handle
    }
  };

  const getRoleSpecificContent = () => {
    const role = user?.role;
    
    switch (role) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'System overview and management'
        };
      case 'coach':
        return {
          title: 'Coach Dashboard',
          subtitle: 'Team management and scheduling'
        };
      case 'sport_coordinator':
        return {
          title: 'Sport Coordinator Dashboard',
          subtitle: 'Program oversight and management'
        };
      default:
        return {
          title: 'Athlete Dashboard',
          subtitle: 'Your profile and stats'
        };
    }
  };

  const sportMetrics = {
    basketball: {
      label: 'Basketball Stats',
      metrics: ['points', 'assists', 'rebounds', 'steals', 'blocks', 'turnovers'],
      statsCards: [
        { key: 'points', label: 'Points', color: 'blue' },
        { key: 'assists', label: 'Assists', color: 'green' },
        { key: 'rebounds', label: 'Rebounds', color: 'purple' },
        { key: 'steals', label: 'Steals', color: 'orange' },
      ]
    },
    football: {
      label: 'Football Stats',
      metrics: ['touchdowns', 'passingYards', 'rushingYards', 'tackles', 'sacks', 'interceptions'],
      statsCards: [
        { key: 'touchdowns', label: 'Touchdowns', color: 'blue' },
        { key: 'passingYards', label: 'Pass Yards', color: 'green' },
        { key: 'rushingYards', label: 'Rush Yards', color: 'purple' },
        { key: 'tackles', label: 'Tackles', color: 'orange' },
      ]
    },
    volleyball: {
      label: 'Volleyball Stats',
      metrics: ['kills', 'digs', 'aces', 'blocks', 'assists', 'serviceErrors'],
      statsCards: [
        { key: 'kills', label: 'Kills', color: 'blue' },
        { key: 'digs', label: 'Digs', color: 'green' },
        { key: 'aces', label: 'Aces', color: 'purple' },
        { key: 'blocks', label: 'Blocks', color: 'orange' },
      ]
    },
    swimming: {
      label: 'Swimming Stats',
      metrics: ['time', 'distance', 'strokes', 'lapCount', 'rank'],
      statsCards: [
        { key: 'bestTime', label: 'Best Time', color: 'blue' },
        { key: 'eventsCompleted', label: 'Events', color: 'green' },
        { key: 'goldMedals', label: 'Gold', color: 'yellow' },
        { key: 'silverMedals', label: 'Silver', color: 'gray' },
      ]
    },
    athletics: {
      label: 'Athletics Stats',
      metrics: ['time', 'distance', 'height', 'position', 'personalBest'],
      statsCards: [
        { key: 'eventsCompleted', label: 'Events', color: 'blue' },
        { key: 'goldMedals', label: 'Gold', color: 'yellow' },
        { key: 'personalBests', label: 'PBs', color: 'green' },
        { key: 'recordsBroken', label: 'Records', color: 'purple' },
      ]
    },
    badminton: {
      label: 'Badminton Stats',
      metrics: ['points', 'wins', 'losses', 'aces', 'smashes'],
      statsCards: [
        { key: 'matchesWon', label: 'Wins', color: 'green' },
        { key: 'matchesLost', label: 'Losses', color: 'red' },
        { key: 'winRate', label: 'Win Rate', color: 'blue' },
        { key: 'tournamentsWon', label: 'Titles', color: 'purple' },
      ]
    },
    tennis: {
      label: 'Tennis Stats',
      metrics: ['setsWon', 'gamesWon', 'aces', 'doubleFaults', 'breakPoints'],
      statsCards: [
        { key: 'matchesWon', label: 'Matches', color: 'green' },
        { key: 'setsWon', label: 'Sets', color: 'blue' },
        { key: 'gamesWon', label: 'Games', color: 'purple' },
        { key: 'aces', label: 'Aces', color: 'yellow' },
      ]
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
    ]
  };

  const currentSport = sportMetrics[athleteProfile?.sport?.primary?.toLowerCase()] || defaultMetrics;
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700' },
    gray: { bg: 'bg-slate-50', text: 'text-slate-700' },
  };

  const getStatValue = (perf, key) => {
    return perf.statistics?.customMetrics?.get(key) ?? perf.statistics?.[key] ?? '-';
  };

  const calculateTotals = () => {
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

  const totals = calculateTotals();

  const dashboardContent = getRoleSpecificContent();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{dashboardContent.title}</h1>
        <p className="text-slate-500 text-sm sm:text-base">{dashboardContent.subtitle}</p>
      </div>

      {/* Athlete Dashboard - Teams, Events, Performance */}
      {user?.role === 'athlete' ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-emerald-100 rounded-lg">
              <Trophy className="text-emerald-600" size={20} className="sm:size-6" />
            </div>
            <div>
              <Link to="/teams" className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-slate-800 hover:text-blue-600">View</p>
                <p className="text-xs sm:text-sm text-slate-500">My Teams</p>
              </Link>
            </div>
          </Card>

          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-amber-100 rounded-lg">
              <Calendar className="text-amber-600" size={20} className="sm:size-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.events}</p>
              <p className="text-xs sm:text-sm text-slate-500">Events</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-purple-100 rounded-lg">
              <Activity className="text-purple-600" size={20} className="sm:size-6" />
            </div>
            <div>
              {athleteProfile ? (
                <button onClick={() => setShowPerformance(!showPerformance)} className="text-left">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">{performances.length}</p>
                  <p className="text-xs sm:text-sm text-slate-500">Performance Records</p>
                </button>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">-</p>
                  <p className="text-xs sm:text-sm text-slate-500">Performance</p>
                </>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* Admin/Coach Dashboard - Athletes, Teams, Events, Performance */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} className="sm:size-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.athletes}</p>
              <p className="text-xs sm:text-sm text-slate-500">Athletes</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-emerald-100 rounded-lg">
              <Trophy className="text-emerald-600" size={20} className="sm:size-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.teams}</p>
              <p className="text-xs sm:text-sm text-slate-500">Teams</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-amber-100 rounded-lg">
              <Calendar className="text-amber-600" size={20} className="sm:size-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.events}</p>
              <p className="text-xs sm:text-sm text-slate-500">Events</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 sm:gap-4 touch-manipulation">
            <div className="p-2.5 sm:p-3 bg-purple-100 rounded-lg">
              <Activity className="text-purple-600" size={20} className="sm:size-6" />
            </div>
            <div>
              <Link to="/performance" className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-slate-800 hover:text-blue-600">View</p>
                <p className="text-xs sm:text-sm text-slate-500">Performance</p>
              </Link>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="Upcoming Events" subtitle="Your scheduled events">
          {loading ? (
            <div className="text-center py-6 sm:py-8 text-slate-500 text-sm sm:text-base">Loading...</div>
          ) : stats.upcoming.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {stats.upcoming.map(event => (
                <div key={event._id} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg touch-manipulation">
                  <div>
                    <p className="font-medium text-slate-800 text-sm sm:text-base">{event.title}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{event.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-slate-700">
                      {new Date(event.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-slate-500 text-sm sm:text-base">
              No upcoming events
            </div>
          )}
        </Card>

        <Card title="Quick Actions" subtitle="Common tasks">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
            {user?.role !== 'athlete' && (
              <>
                <button className="p-3 sm:p-4 bg-slate-50 rounded-lg text-left hover:bg-slate-100 transition-colors touch-manipulation">
                  <Users className="text-blue-600 mb-1.5 sm:mb-2" size={18} className="sm:size-5" />
                  <p className="font-medium text-slate-800 text-xs sm:text-sm">Manage Athletes</p>
                  <p className="text-xs text-slate-500 hidden sm:block">View and edit profiles</p>
                </button>
                <button className="p-3 sm:p-4 bg-slate-50 rounded-lg text-left hover:bg-slate-100 transition-colors touch-manipulation">
                  <Trophy className="text-emerald-600 mb-1.5 sm:mb-2" size={18} className="sm:size-5" />
                  <p className="font-medium text-slate-800 text-xs sm:text-sm">Manage Teams</p>
                  <p className="text-xs text-slate-500 hidden sm:block">Create and update teams</p>
                </button>
              </>
            )}
            <button className="p-3 sm:p-4 bg-slate-50 rounded-lg text-left hover:bg-slate-100 transition-colors touch-manipulation">
              <Calendar className="text-amber-600 mb-1.5 sm:mb-2" size={18} className="sm:size-5" />
              <p className="font-medium text-slate-800 text-xs sm:text-sm">View Schedule</p>
              <p className="text-xs text-slate-500 hidden sm:block">Upcoming events</p>
            </button>
            {user?.role !== 'athlete' ? (
              <Link to="/performance" className="p-3 sm:p-4 bg-slate-50 rounded-lg text-left hover:bg-slate-100 transition-colors block touch-manipulation">
                <Activity className="text-purple-600 mb-1.5 sm:mb-2" size={18} className="sm:size-5" />
                <p className="font-medium text-slate-800 text-xs sm:text-sm">Performance</p>
                <p className="text-xs text-slate-500 hidden sm:block">Track athlete progress</p>
              </Link>
            ) : (
              <button className="p-3 sm:p-4 bg-slate-50 rounded-lg text-left hover:bg-slate-100 transition-colors touch-manipulation" onClick={() => setShowPerformance(true)}>
                <Activity className="text-purple-600 mb-1.5 sm:mb-2" size={18} className="sm:size-5" />
                <p className="font-medium text-slate-800 text-xs sm:text-sm">Performance</p>
                <p className="text-xs text-slate-500 hidden sm:block">Track progress</p>
              </button>
            )}
          </div>
        </Card>
      </div>

      {user?.role === 'athlete' && showPerformance && athleteProfile && (
        <Card className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={20} className="sm:size-6" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">{currentSport.label}</h3>
                <p className="text-xs sm:text-sm text-slate-500 capitalize">{athleteProfile.sport?.primary}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPerformance(false)} 
              className="text-slate-400 hover:text-slate-600 touch-manipulation"
            >
              ✕
            </button>
          </div>

          {performances.length > 0 ? (
            <>
              <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {currentSport.statsCards.map((card) => (
                  <div key={card.key} className={`p-2.5 sm:p-4 rounded-lg ${colorMap[card.color].bg}`}>
                    <p className="text-xs sm:text-sm text-slate-600">{card.label}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${colorMap[card.color].text}`}>
                      {totals[card.key] || 0}
                    </p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-500">Date</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-500">Event</th>
                      {currentSport.metrics.map(m => (
                        <th key={m} className="text-left py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-500 capitalize whitespace-nowrap">
                          {m.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {performances.slice(0, 10).map((perf) => (
                      <tr key={perf._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm text-slate-800">
                          {perf.createdAt ? new Date(perf.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm text-slate-800">
                          {perf.eventId?.title || '-'}
                        </td>
                        {currentSport.metrics.map(m => (
                          <td key={m} className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm text-slate-800">
                            {getStatValue(perf, m) || 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {performances.length > 10 && (
                <p className="text-center text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">
                  Showing 10 of {performances.length} records
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-6 sm:py-8 text-slate-500">
              <Award size={36} className="mx-auto mb-1.5 sm:mb-2 text-slate-300 sm:size-12" />
              <p className="text-sm sm:text-base">No performance records found</p>
              <p className="text-xs sm:text-sm">Your performance data will appear here once recorded</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
