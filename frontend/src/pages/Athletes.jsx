import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Users, Plus, Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Athletes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Redirect unauthorized roles
  if (user?.role === 'admin' || user?.role === 'athlete') {
    return <Navigate to="/dashboard" replace />;
  }

   const fetchAthletes = async () => {
     try {
       setLoading(true);
       const res = await api.get(`/athletes?page=${page}&limit=10&search=${search}&sport=${sport}`);
       setAthletes(res.data.athletes || []);
       setTotalPages(res.data.pages || 1);
       setTotal(res.data.total || 0);
     } catch (error) {
       console.error('Failed to fetch athletes:', error);
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    fetchAthletes();
  }, [page]);

   useEffect(() => {
     const debounce = setTimeout(() => {
       setPage(1);
       fetchAthletes();
     }, 500);
     return () => clearTimeout(debounce);
   }, [search, sport]);

   const handleDelete = async (id) => {
     if (!confirm('Are you sure you want to delete this athlete?')) return;
     try {
       await api.delete(`/athletes/${id}`);
       fetchAthletes();
     } catch (error) {
       console.error('Failed to delete athlete:', error);
     }
   };

   return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Athletes</h1>
          <p className="text-slate-500">Manage student athlete profiles</p>
        </div>
        <Link to="/athletes/add">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Add Athlete
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sports</option>
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="football">Football</option>
            <option value="swimming">Swimming</option>
            <option value="athletics">Athletics</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
               <tr className="border-b border-slate-200">
                 <th className="text-left py-3 px-4 font-semibold text-slate-600">Athlete</th>
                 <th className="text-left py-3 px-4 font-semibold text-slate-600">Sport</th>
                 <th className="text-left py-3 px-4 font-semibold text-slate-600">Year Level</th>
                 <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
               </tr>
            </thead>
             <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : athletes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No athletes found</td>
                  </tr>
                ) : (
                  athletes.map((athlete) => (
                    <tr key={athlete._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-slate-600 capitalize">{athlete.sport?.primary}</td>
                      <td className="py-3 px-4 text-slate-600">Year {athlete.academic?.year}</td>
                      <td className="py-3 px-4">
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
                            onClick={() => handleDelete(athlete._id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                   ))
                 )}
               </tbody>
             </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Showing {athletes.length} of {total} athletes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={18} />
            </Button>
            <span className="px-3 py-1 text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Athletes;
