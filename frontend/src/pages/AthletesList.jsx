import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AthletesList = () => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  useEffect(() => {
    fetchAthletes();
  }, [pagination.page, search, sportFilter, yearFilter]);

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(search && { search }),
        ...(sportFilter && { sport: sportFilter }),
        ...(yearFilter && { year: yearFilter })
      });
      
      const res = await api.get(`/athletes?${params}`);
      setAthletes(res.data.athletes || []);
      setPagination(prev => ({
        ...prev,
        page: res.data.page || 1,
        pages: res.data.pages || 1,
        total: res.data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/athletes/${id}`);
      fetchAthletes();
      setShowDeleteModal(false);
      setSelectedAthlete(null);
    } catch (error) {
      console.error('Failed to delete athlete:', error);
    }
  };

  const openDeleteModal = (athlete) => {
    setSelectedAthlete(athlete);
    setShowDeleteModal(true);
  };

  const sports = ['Basketball', 'Volleyball', 'Football', 'Swimming', 'Athletics', 'Badminton', 'Tennis', 'Baseball'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

   return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Athletes</h1>
          <p className="text-slate-500">Manage student-athlete profiles</p>
        </div>
        {(user?.role === 'coach' || user?.role === 'sport_coordinator' || user?.role === 'admin') && (
          <Link to="/athletes/add">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> Add Athlete
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No athletes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-slate-500">Loading...</td>
                 </tr>
               ) : athletes.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-8 text-center text-slate-500">No athletes found</td>
                 </tr>
               </thead>
              <tbody className="divide-y divide-slate-200">
                {athletes.map(athlete => (
                  <tr key={athlete._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {athlete.userId?.firstName?.charAt(0)}{athlete.userId?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {athlete.userId?.firstName} {athlete.userId?.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{athlete.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{athlete.sport?.primary || '-'}</td>
                     <td className="px-4 py-3 text-slate-600">{athlete.academic?.year || '-'}</td>
                     <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/athletes/${athlete._id}`}>
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye size={18} />
                          </button>
                        </Link>
                        <Link to={`/athletes/${athlete._id}/edit`}>
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => openDeleteModal(athlete)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this athlete? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(selectedAthlete._id)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthletesList;
