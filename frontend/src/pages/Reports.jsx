import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Users, Trophy, Calendar, TrendingUp, FileText } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();

  // Admin cannot access reports (only user management)
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    athletes: [],
    teams: [],
    events: [],
    performance: []
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [athletesRes, teamsRes, eventsRes] = await Promise.all([
          api.get('/athletes'),
          api.get('/teams'),
          api.get('/events')
        ]);

        setReportData({
          athletes: athletesRes.data.athletes || [],
          teams: teamsRes.data.teams || [],
          events: eventsRes.data.events || [],
          performance: []
        });
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const athletesBySport = () => {
    const sports = {};
    reportData.athletes.forEach(athlete => {
      const sport = athlete.sport?.primary || 'Unknown';
      sports[sport] = (sports[sport] || 0) + 1;
    });
    return {
      labels: Object.keys(sports),
      datasets: [{
        data: Object.values(sports),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899'
        ]
      }]
    };
  };

  const athletesByYear = () => {
    const years = { 1: 0, 2: 0, 3: 0, 4: 0 };
    reportData.athletes.forEach(athlete => {
      const year = athlete.academic?.year;
      if (year && years[year] !== undefined) {
        years[year]++;
      }
    });
    return {
      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
      datasets: [{
        label: 'Athletes',
        data: Object.values(years),
        backgroundColor: '#3B82F6'
      }]
    };
  };

  const eventsByType = () => {
    const types = {};
    reportData.events.forEach(event => {
      const type = event.type || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return {
      labels: Object.keys(types),
      datasets: [{
        data: Object.values(types),
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#3B82F6',
          '#EF4444'
        ]
      }]
    };
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  const exportReport = (type) => {
    alert(`Exporting ${type} report...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500">View performance and eligibility reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{reportData.athletes.length}</p>
            <p className="text-sm text-slate-500">Total Athletes</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <Trophy className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{reportData.teams.length}</p>
            <p className="text-sm text-slate-500">Active Teams</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Calendar className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{reportData.events.length}</p>
            <p className="text-sm text-slate-500">Total Events</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">-</p>
            <p className="text-sm text-slate-500">Avg Performance</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Athletes by Sport" subtitle="Distribution across sports">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading...</div>
          ) : reportData.athletes.length > 0 ? (
            <div className="h-64">
              <Doughnut data={athletesBySport()} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>
          )}
        </Card>

        <Card title="Athletes by Year Level" subtitle="Distribution by academic year">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading...</div>
          ) : reportData.athletes.length > 0 ? (
            <div className="h-64">
              <Bar data={athletesByYear()} options={barOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>
          )}
        </Card>

        <Card title="Events by Type" subtitle="Distribution of event types">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading...</div>
          ) : reportData.events.length > 0 ? (
            <div className="h-64">
              <Doughnut data={eventsByType()} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>
          )}
        </Card>
      </div>

      <Card title="Export Reports" subtitle="Download reports in various formats">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => exportReport('athletes')}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <FileText className="text-blue-600 mb-2" size={24} />
            <p className="font-medium text-slate-800">Athletes Report</p>
            <p className="text-sm text-slate-500">CSV / PDF</p>
          </button>
          <button
            onClick={() => exportReport('teams')}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <Trophy className="text-emerald-600 mb-2" size={24} />
            <p className="font-medium text-slate-800">Teams Report</p>
            <p className="text-sm text-slate-500">CSV / PDF</p>
          </button>
          <button
            onClick={() => exportReport('attendance')}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <Calendar className="text-amber-600 mb-2" size={24} />
            <p className="font-medium text-slate-800">Attendance Report</p>
            <p className="text-sm text-slate-500">CSV / PDF</p>
          </button>
          <button
            onClick={() => exportReport('eligibility')}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <TrendingUp className="text-purple-600 mb-2" size={24} />
            <p className="font-medium text-slate-800">Eligibility Report</p>
            <p className="text-sm text-slate-500">CSV / PDF</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
