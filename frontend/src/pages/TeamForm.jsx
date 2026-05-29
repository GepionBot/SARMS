import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Save, ArrowLeft } from 'lucide-react';

const TeamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    description: '',
    year: new Date().getFullYear()
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      navigate('/users', { replace: true });
      return;
    }
    if (isEdit) {
      const fetchTeam = async () => {
        try {
          const res = await api.get(`/teams/${id}`);
          setFormData(res.data);
        } catch (err) {
          console.error('Failed to fetch team:', err);
        }
        setInitialLoading(false);
      };
      fetchTeam();
    } else {
      setInitialLoading(false);
    }
  }, [id, isEdit, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/teams/${id}`, formData);
      } else {
        await api.post('/teams', formData);
      }
      navigate('/teams');
    } catch (error) {
      console.error('Team form error:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save team';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teams">
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? 'Edit Team' : 'Add New Team'}
          </h1>
          <p className="text-slate-500">
            {isEdit ? 'Update team information' : 'Create a new team'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}
        <Card title="Team Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Team Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div>
              <label className="text-sm font-medium text-slate-700">Sport</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Sport</option>
                <option value="basketball">Basketball</option>
                <option value="volleyball">Volleyball</option>
                <option value="football">Football</option>
                <option value="swimming">Swimming</option>
                <option value="athletics">Athletics</option>
                <option value="badminton">Badminton</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>
            <Input
              label="Founded Year"
              name="year"
              type="number"
              value={formData.year || new Date().getFullYear()}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Link to="/teams">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save size={18} />
            {isEdit ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;
