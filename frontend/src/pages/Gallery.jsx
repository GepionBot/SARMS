import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Image, Upload, Trash2, Search, Video, FileText, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Gallery = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'image',
    sport: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const isAdmin = user?.role === 'admin';
  const canManage = ['admin', 'coach', 'sport_coordinator'].includes(user?.role);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get('/media');
      const data = res.data;
      setMedia(Array.isArray(data) ? data : data.media || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('type', uploadData.type);
    formData.append('sport', uploadData.sport);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    try {
      await api.postFormData('/media', formData);
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        type: 'image',
        sport: ''
      });
      setSelectedFile(null);
      fetchMedia();
    } catch (error) {
      console.error('Failed to upload media:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/media/${id}`);
      fetchMedia();
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const filteredMedia = (Array.isArray(media) ? media : []).filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = !search || 
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isAdmin) {
    return <Navigate to="/users" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Media Gallery</h1>
          <p className="text-slate-500">Photos, videos, and certificates</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
            <Upload size={18} />
            Upload Media
          </Button>
        )}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'image' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Image size={16} /> Images
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'video' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Video size={16} /> Videos
            </button>
            <button
              onClick={() => setFilter('document')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'document' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText size={16} /> Documents
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <Image className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">No media found</p>
            {canManage && (
              <Button onClick={() => setShowUploadModal(true)} className="mt-4">
                Upload First Media
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div key={item._id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-100 relative">
                  {item.media?.[0]?.url ? (
                    <img 
                      src={`http://localhost:3700${item.media[0].url}`} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'video' ? (
                        <Video className="text-slate-400" size={32} />
                      ) : item.type === 'document' ? (
                        <FileText className="text-slate-400" size={32} />
                      ) : (
                        <Image className="text-slate-400" size={32} />
                      )}
                    </div>
                  )}
                  {canManage && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-slate-800 truncate">{item.title}</h3>
                  <p className="text-sm text-slate-500 truncate">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 capitalize">{item.type}</span>
                    <span className="text-xs text-slate-400">{item.sport}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Upload Media</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                required
              />
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <select
                  name="type"
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Media File</label>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {selectedFile && (
                  <p className="mt-1 text-sm text-slate-500">Selected: {selectedFile.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Sport</label>
                <select
                  name="sport"
                  value={uploadData.sport}
                  onChange={(e) => setUploadData({ ...uploadData, sport: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sports</option>
                  <option value="basketball">Basketball</option>
                  <option value="volleyball">Volleyball</option>
                  <option value="football">Football</option>
                  <option value="swimming">Swimming</option>
                  <option value="athletics">Athletics</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Upload
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Gallery;