import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowLeft, User, GraduationCap, Activity, Award, Image, Edit, Save, Calendar, Clock, MapPin, Users } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const SCHEDULE_TYPES = [
  { value: 'class', label: 'Class', color: '#3B82F6' },
  { value: 'study', label: 'Study Session', color: '#10B981' },
  { value: 'practice', label: 'Sports Practice', color: '#F59E0B' },
  { value: 'meeting', label: 'Meeting', color: '#8B5CF6' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

const AthleteProfile = ({ isMyProfile = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [savingInfo, setSavingInfo] = useState(false);
  const [athleteSchedules, setAthleteSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const PerformanceTab = ({ athleteId, sport }) => {
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);

    const sportMetrics = {
      basketball: {
        label: 'Basketball Stats',
        metrics: [
          { key: 'points', label: 'Points', icon: '🏀' },
          { key: 'assists', label: 'Assists', icon: '🎯' },
          { key: 'rebounds', label: 'Rebounds', icon: '📊' },
          { key: 'steals', label: 'Steals', icon: '⚡' },
          { key: 'blocks', label: 'Blocks', icon: '🛡️' },
          { key: 'turnovers', label: 'Turnovers', icon: '❌' },
        ],
        statsCards: [
          { key: 'points', label: 'Total Points', color: 'blue' },
          { key: 'assists', label: 'Total Assists', color: 'green' },
          { key: 'rebounds', label: 'Total Rebounds', color: 'purple' },
          { key: 'steals', label: 'Total Steals', color: 'orange' },
        ]
      },
      football: {
        label: 'Football Stats',
        metrics: [
          { key: 'touchdowns', label: 'Touchdowns', icon: '🏈' },
          { key: 'passingYards', label: 'Passing Yards', icon: '📏' },
          { key: 'rushingYards', label: 'Rushing Yards', icon: '🏃' },
          { key: 'tackles', label: 'Tackles', icon: '💪' },
          { key: 'sacks', label: 'Sacks', icon: '🔒' },
          { key: 'interceptions', label: 'Interceptions', icon: '✋' },
        ],
        statsCards: [
          { key: 'touchdowns', label: 'Total Touchdowns', color: 'blue' },
          { key: 'passingYards', label: 'Passing Yards', color: 'green' },
          { key: 'rushingYards', label: 'Rushing Yards', color: 'purple' },
          { key: 'tackles', label: 'Total Tackles', color: 'orange' },
        ]
      },
      volleyball: {
        label: 'Volleyball Stats',
        metrics: [
          { key: 'kills', label: 'Kills', icon: '💥' },
          { key: 'digs', label: 'Digs', icon: '⛏️' },
          { key: 'aces', label: 'Aces', icon: '🎯' },
          { key: 'blocks', label: 'Blocks', icon: '🛡️' },
          { key: 'assists', label: 'Assists', icon: '🤝' },
          { key: 'serviceErrors', label: 'Service Errors', icon: '❌' },
        ],
        statsCards: [
          { key: 'kills', label: 'Total Kills', color: 'blue' },
          { key: 'digs', label: 'Total Digs', color: 'green' },
          { key: 'aces', label: 'Total Aces', color: 'purple' },
          { key: 'blocks', label: 'Total Blocks', color: 'orange' },
        ]
      },
      swimming: {
        label: 'Swimming Stats',
        metrics: [
          { key: 'time', label: 'Time (seconds)', icon: '⏱️' },
          { key: 'distance', label: 'Distance (m)', icon: '📏' },
          { key: 'strokes', label: 'Strokes', icon: '🏊' },
          { key: 'lapCount', label: 'Lap Count', icon: '🔄' },
          { key: 'rank', label: 'Rank', icon: '🏅' },
        ],
        statsCards: [
          { key: 'bestTime', label: 'Best Time', color: 'blue' },
          { key: 'eventsCompleted', label: 'Events Completed', color: 'green' },
          { key: 'goldMedals', label: 'Gold Medals', color: 'yellow' },
          { key: 'silverMedals', label: 'Silver Medals', color: 'gray' },
        ]
      },
      athletics: {
        label: 'Athletics Stats',
        metrics: [
          { key: 'time', label: 'Time', icon: '⏱️' },
          { key: 'distance', label: 'Distance', icon: '📏' },
          { key: 'height', label: 'Height', icon: '📈' },
          { key: 'position', label: 'Position', icon: '🏅' },
          { key: 'personalBest', label: 'Personal Best', icon: '⭐' },
        ],
        statsCards: [
          { key: 'eventsCompleted', label: 'Events Completed', color: 'blue' },
          { key: 'goldMedals', label: 'Gold Medals', color: 'yellow' },
          { key: 'personalBests', label: 'Personal Bests', color: 'green' },
          { key: 'recordsBroken', label: 'Records Broken', color: 'purple' },
        ]
      },
      badminton: {
        label: 'Badminton Stats',
        metrics: [
          { key: 'points', label: 'Points', icon: '🏸' },
          { key: 'wins', label: 'Wins', icon: '🏆' },
          { key: 'losses', label: 'Losses', icon: '📉' },
          { key: 'aces', label: 'Aces', icon: '🎯' },
          { key: 'smashes', label: 'Smashes', icon: '💥' },
        ],
        statsCards: [
          { key: 'matchesWon', label: 'Matches Won', color: 'green' },
          { key: 'matchesLost', label: 'Matches Lost', color: 'red' },
          { key: 'winRate', label: 'Win Rate', color: 'blue' },
          { key: 'tournamentsWon', label: 'Tournaments Won', color: 'purple' },
        ]
      },
      tennis: {
        label: 'Tennis Stats',
        metrics: [
          { key: 'setsWon', label: 'Sets Won', icon: '🎾' },
          { key: 'gamesWon', label: 'Games Won', icon: '⭐' },
          { key: 'aces', label: 'Aces', icon: '🎯' },
          { key: 'doubleFaults', label: 'Double Faults', icon: '❌' },
          { key: 'breakPoints', label: 'Break Points', icon: '🔓' },
        ],
        statsCards: [
          { key: 'matchesWon', label: 'Matches Won', color: 'green' },
          { key: 'setsWon', label: 'Sets Won', color: 'blue' },
          { key: 'gamesWon', label: 'Games Won', color: 'purple' },
          { key: 'aces', label: 'Total Aces', color: 'yellow' },
        ]
      },
    };

    const defaultMetrics = {
      label: 'Performance Stats',
      metrics: [
        { key: 'score', label: 'Score', icon: '📊' },
        { key: 'rating', label: 'Rating', icon: '⭐' },
      ],
      statsCards: [
        { key: 'totalScore', label: 'Total Score', color: 'blue' },
        { key: 'averageRating', label: 'Avg Rating', color: 'green' },
        { key: 'eventsPlayed', label: 'Events Played', color: 'purple' },
        { key: 'bestScore', label: 'Best Score', color: 'orange' },
      ]
    };

    const currentSport = sportMetrics[sport?.toLowerCase()] || defaultMetrics;
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
        } else {
          totals[card.key] = performances.reduce((sum, p) => sum + (getStatValue(p, card.key) || 0), 0);
        }
      });
      return totals;
    };

    useEffect(() => {
      const fetchPerformance = async () => {
        try {
          const res = await api.get(`/athletes/${athleteId}/performance`);
          setPerformances(res.data.performances || []);
        } catch (error) {
          console.error('Failed to fetch performance:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPerformance();
    }, [athleteId]);

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!performances.length) {
      return (
        <div className="text-center py-8 text-slate-500">
          No performance records found
        </div>
      );
    }

    const totals = calculateTotals();

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{currentSport.label}</h3>
          <span className="text-sm text-slate-500 capitalize">({sport})</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {currentSport.statsCards.map((card) => (
            <div key={card.key} className={`p-4 rounded-lg ${colorMap[card.color].bg}`}>
              <p className="text-sm text-slate-600">{card.label}</p>
              <p className={`text-2xl font-bold ${colorMap[card.color].text}`}>
                {totals[card.key] || 0}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Event</th>
                {currentSport.metrics.map(m => (
                  <th key={m.key} className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {performances.map((perf) => (
                <tr key={perf._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-800">
                    {perf.createdAt ? new Date(perf.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-800">
                    {perf.eventId?.title || '-'}
                  </td>
                  {currentSport.metrics.map(m => (
                    <td key={m.key} className="py-3 px-4 text-sm text-slate-800">
                      {getStatValue(perf, m.key) || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        let res;
        if (isMyProfile) {
          res = await api.get(`/athletes/user/${user?._id}`);
        } else {
          res = await api.get(`/athletes/${id}`);
        }
        setAthlete(res.data);
      } catch (error) {
        console.error('Failed to fetch athlete:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAthlete();
  }, [id, isMyProfile, user?._id]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!athlete) return;
      setScheduleLoading(true);
      try {
        const res = await api.get(`/schedules?athleteId=${athlete._id}`);
        setAthleteSchedules(res.data.schedules || []);
      } catch (error) {
        console.error('Failed to fetch athlete schedules:', error);
      } finally {
        setScheduleLoading(false);
      }
    };

    if (athlete && activeTab === 'schedule') {
      fetchSchedules();
    }
  }, [athlete, activeTab]);

  const handleNestedInfoChange = (field, value) => {
    setAthlete(prev => ({
      ...prev,
      information: {
        ...prev?.information,
        [field]: value
      }
    }));
  };

  const handleInformationSubmit = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await api.put(`/athletes/${athlete._id}`, { information: athlete.information });
      setAthlete(res.data);
    } catch (error) {
      console.error('Failed to update information:', error);
    } finally {
      setSavingInfo(false);
    }
  };

  const canViewPerformance = ['coach', 'sport_coordinator', 'admin'].includes(user?.role);
  const canViewSchedule = isMyProfile;

  const groupedSchedules = DAYS.reduce((acc, day) => {
    acc[day] = athleteSchedules.filter(s => s.dayOfWeek === day);
    return acc;
  }, {});

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'physical', label: 'Physical', icon: Activity },
    ...(canViewPerformance ? [{ id: 'performance', label: 'Performance', icon: Award }] : []),
    ...(canViewSchedule ? [{ id: 'schedule', label: 'Schedule', icon: Calendar }] : []),
    { id: 'information', label: 'Information', icon: Edit },
    { id: 'media', label: 'Media', icon: Image },
  ];

  const canEdit = ['admin', 'coach', 'sport_coordinator'].includes(user?.role);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!athlete) {
    if (isMyProfile && user?.role === 'athlete') {
      return <Navigate to="/athletes/add" replace />;
    }
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-500">Profile not found</p>
          <Link to={isMyProfile ? "/dashboard" : "/athletes"}>
            <Button className="mt-4">{isMyProfile ? 'Back to Dashboard' : 'Back to Athletes'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={isMyProfile ? "/dashboard" : "/athletes"}>
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {athlete.userId?.firstName} {athlete.userId?.lastName}
            </h1>
            <p className="text-slate-500">{isMyProfile ? 'My Profile' : 'Athlete Profile'}</p>
          </div>
        </div>
        {isMyProfile && athlete?._id ? (
          <Link to={`/athletes/${athlete._id}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit size={18} />
              Edit Profile
            </Button>
          </Link>
        ) : (
          canEdit && (
            <Link to={`/athletes/${id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit size={18} />
                Edit Profile
              </Button>
            </Link>
          )
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-blue-600" size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {athlete.userId?.firstName} {athlete.userId?.lastName}
              </h2>
              <p className="text-slate-500 capitalize">{athlete.sport?.primary}</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID</span>
                <span className="font-medium text-slate-800">{athlete.academic?.studentId || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Year Level</span>
                <span className="font-medium text-slate-800">Year {athlete.academic?.year || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Position</span>
                <span className="font-medium text-slate-800">{athlete.sport?.position || '-'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Date of Birth</p>
                    <p className="font-medium text-slate-800">
                      {athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Gender</p>
                    <p className="font-medium text-slate-800 capitalize">{athlete.gender || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-medium text-slate-800">
                    {athlete.address?.street ? `${athlete.address.street}, ${athlete.address.city}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Emergency Contact</p>
                  <p className="font-medium text-slate-800">
                    {athlete.emergencyContact?.name || '-'} ({athlete.emergencyContact?.relationship})
                  </p>
                  <p className="text-sm text-slate-500">{athlete.emergencyContact?.phone}</p>
                </div>
              </div>
            )}

            {/* Academic Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Student ID</p>
                    <p className="font-medium text-slate-800">{athlete.academic?.studentId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Year Level</p>
                    <p className="font-medium text-slate-800">Year {athlete.academic?.year || '-'}</p>
                  </div>
                </div>
                {athlete.academic?.courses?.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Courses</p>
                    <div className="space-y-2">
                      {athlete.academic.courses.map((course, idx) => (
                        <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-800">{course.name}</span>
                          <span className="text-sm text-slate-500">{course.grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {athlete.academic?.adviser && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Academic Adviser</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="font-medium text-slate-800">{athlete.academic.adviser.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Department</p>
                        <p className="font-medium text-slate-800">{athlete.academic.adviser.department || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Physical Tab */}
            {activeTab === 'physical' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Height</p>
                  <p className="font-medium text-slate-800">{athlete.physical?.height || '-'} cm</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Weight</p>
                  <p className="font-medium text-slate-800">{athlete.physical?.weight || '-'} kg</p>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <PerformanceTab athleteId={athlete._id} sport={athlete.sport?.primary} />
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {scheduleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : athleteSchedules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>No schedules found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {DAYS.map(day => (
                      <div key={day}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{DAY_LABELS[day]}</h3>
                        {groupedSchedules[day].length === 0 ? (
                          <p className="text-slate-500 text-sm">No schedules for {DAY_LABELS[day]}</p>
                        ) : (
                          <div className="space-y-3">
                            {groupedSchedules[day].map(schedule => (
                              <div
                                key={schedule._id}
                                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                style={{ borderLeft: `4px solid ${schedule.color}` }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-slate-800">{schedule.title}</h4>
                                      <span
                                        className="text-xs px-2 py-0.5 rounded-full text-white"
                                        style={{ backgroundColor: schedule.color }}
                                      >
                                        {SCHEDULE_TYPES.find(t => t.value === schedule.type)?.label || schedule.type}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                      <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {schedule.startTime} - {schedule.endTime}
                                      </span>
                                      {schedule.location && (
                                        <span className="flex items-center gap-1">
                                          <MapPin size={14} />
                                          {schedule.location}
                                        </span>
                                      )}
                                      {schedule.instructor && (
                                        <span className="flex items-center gap-1">
                                          <Users size={14} />
                                          {schedule.instructor}
                                        </span>
                                      )}
                                    </div>
                                    {schedule.notes && (
                                      <p className="text-sm text-slate-500 mt-2">{schedule.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Information Tab */}
            {activeTab === 'information' && (
              <div className="space-y-4">
                {isMyProfile ? (
                  <form onSubmit={handleInformationSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Bio</label>
                      <textarea
                        name="bio"
                        value={athlete.information?.bio || ''}
                        onChange={(e) => handleNestedInfoChange('bio', e.target.value)}
                        placeholder="Enter a brief biography"
                        rows={3}
                        className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Goals</label>
                      <textarea
                        name="goals"
                        value={athlete.information?.goals || ''}
                        onChange={(e) => handleNestedInfoChange('goals', e.target.value)}
                        placeholder="Enter athletic or academic goals"
                        rows={3}
                        className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Achievements</label>
                      <textarea
                        name="achievements"
                        value={athlete.information?.achievements || ''}
                        onChange={(e) => handleNestedInfoChange('achievements', e.target.value)}
                        placeholder="Enter notable achievements"
                        rows={3}
                        className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Additional Notes</label>
                      <textarea
                        name="additionalNotes"
                        value={athlete.information?.additionalNotes || ''}
                        onChange={(e) => handleNestedInfoChange('additionalNotes', e.target.value)}
                        placeholder="Enter any additional notes"
                        rows={3}
                        className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" loading={savingInfo} className="flex items-center gap-2">
                        <Save size={18} />
                        Save Information
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    {athlete.information?.bio && (
                      <div>
                        <p className="text-sm text-slate-500">Bio</p>
                        <p className="font-medium text-slate-800">{athlete.information.bio}</p>
                      </div>
                    )}
                    {athlete.information?.goals && (
                      <div>
                        <p className="text-sm text-slate-500">Goals</p>
                        <p className="font-medium text-slate-800">{athlete.information.goals}</p>
                      </div>
                    )}
                    {athlete.information?.achievements && (
                      <div>
                        <p className="text-sm text-slate-500">Achievements</p>
                        <p className="font-medium text-slate-800">{athlete.information.achievements}</p>
                      </div>
                    )}
                    {athlete.information?.additionalNotes && (
                      <div>
                        <p className="text-sm text-slate-500">Additional Notes</p>
                        <p className="font-medium text-slate-800">{athlete.information.additionalNotes}</p>
                      </div>
                    )}
                    {!athlete.information?.bio && !athlete.information?.goals &&
                     !athlete.information?.achievements && !athlete.information?.additionalNotes && (
                      <div className="text-center py-8 text-slate-500">
                        No additional information available
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="text-center py-8 text-slate-500">
                Media gallery will be displayed here
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthleteProfile;
