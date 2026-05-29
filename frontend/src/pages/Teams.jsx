import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Trophy, Plus, Edit, Trash2, Users, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeams();
  }, [search]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teams');
      const data = res.data;
      setTeams(Array.isArray(data) ? data : data.teams || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const filteredTeams = teams.filter(team => 
    !search || team.name?.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = ['sport_coordinator', 'coach'].includes(user?.role);

  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teams</h1>
          <p className="text-slate-500">Manage sports teams</p>
        </div>
        {canManage && (
          <Link to="/teams/add">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> Add Team
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Trophy size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No teams found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map(team => (
              <div key={team._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Trophy className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{team.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{team.sport}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{team.rosterCount || 0} members</span>
                  </div>
                </div>
<div className="flex items-center justify-end gap-2">
                   <Link to={`/teams/${team._id}`}>
                     <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Team">
                       <Eye size={18} />
                     </button>
                   </Link>
                   <Link to={`/teams/${team._id}/edit`}>
                     <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit Team">
                       <Edit size={18} />
                     </button>
                   </Link>
                   {canManage && (
                     <button 
                       onClick={() => handleDelete(team._id)}
                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                       title="Delete Team"
                     >
                       <Trash2 size={18} />
                     </button>
                   )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Teams;
