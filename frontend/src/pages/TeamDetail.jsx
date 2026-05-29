import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowLeft, Users, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeamDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [allAthletes, setAllAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');

  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  useEffect(() => {
    fetchTeam();
    fetchRoster();
  }, [id]);

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    }
  };

  const fetchRoster = async () => {
    try {
      const res = await api.get(`/teams/${id}/roster`);
      setRoster(res.data || []);
    } catch (error) {
      console.error('Failed to fetch roster:', error);
    }
  };

  const fetchAllAthletes = async () => {
    try {
      const res = await api.get('/athletes');
      const athletes = res.data.athletes || res.data || [];
      const rosterAthleteIds = roster.map(r => r.athleteId?._id || r.athleteId);
      const available = athletes.filter(a => !rosterAthleteIds.includes(a._id));
      setAllAthletes(available);
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    }
  };

   const handleRemoveAthlete = async (athleteId) => {
     if (!confirm('Remove this athlete from the roster?')) return;
     setRoster(prev => prev.filter(entry => entry.athleteId?._id !== athleteId));
   };

  const handleAddAthlete = async () => {
    if (!selectedAthleteId) return;
    try {
      await api.post(`/teams/${id}/roster`, { athleteId: selectedAthleteId });
      setShowAddModal(false);
      setSelectedAthleteId('');
      fetchRoster();
    } catch (error) {
      console.error('Failed to add athlete:', error);
    }
  };

  const openAddModal = () => {
    fetchAllAthletes();
    setShowAddModal(true);
  };

  const canManage = ['sport_coordinator', 'coach'].includes(user?.role);

  if (loading && !team) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Team not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teams" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-slate-800">{team.name}</h1>
           <p className="text-slate-500 capitalize">{team.sport} Team</p>
           <p className="text-slate-500">Players: {roster.length}</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-500">Coach</p>
            <p className="font-medium">{team.coachId?.firstName} {team.coachId?.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Year</p>
            <p className="font-medium">{team.year}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Sport Coordinator</p>
            <p className="font-medium">{team.sportCoordinatorId?.firstName} {team.sportCoordinatorId?.lastName || 'N/A'}</p>
          </div>
        </div>
        {team.description && (
          <div className="mb-6">
            <p className="text-sm text-slate-500">Description</p>
            <p className="mt-1">{team.description}</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} /> Team Roster ({roster.length})
          </h2>
          {canManage && (
            <Button onClick={openAddModal} className="flex items-center gap-2">
              <Plus size={18} /> Add Athlete
            </Button>
          )}
        </div>

        {roster.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No athletes on roster</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Athlete</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Sport</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Year</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((entry) => (
                  <tr key={entry._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {entry.athleteId?.userId?.firstName?.charAt(0)}{entry.athleteId?.userId?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {entry.athleteId?.userId?.firstName} {entry.athleteId?.userId?.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{entry.athleteId?.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{entry.athleteId?.studentId || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600 capitalize">{entry.athleteId?.sport?.primary || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">Year {entry.athleteId?.academic?.year || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      {canManage && (
                        <button
                          onClick={() => handleRemoveAthlete(entry.athleteId?._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove from roster"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Athlete to Team</h3>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4"
            >
              <option value="">Select an athlete...</option>
              {allAthletes.map((athlete) => (
                <option key={athlete._id} value={athlete._id}>
                  {athlete.userId?.firstName} {athlete.userId?.lastName}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAthlete} disabled={!selectedAthleteId}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
