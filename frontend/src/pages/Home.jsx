import { Link } from 'react-router-dom';
import { GraduationCap, Users, Trophy, Calendar, Award, Shield, ArrowRight } from 'lucide-react';
import Card from '../components/common/Card';

const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Athlete Profiles',
      description: 'Comprehensive athlete data management with academic and athletic records.'
    },
    {
      icon: Trophy,
      title: 'Performance Tracking',
      description: 'Track athletic performance, statistics, and progress over time.'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Schedule and manage athletic events, practices, and competitions.'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Record awards, certificates, and accomplishments.'
    },
    {
      icon: Shield,
      title: 'Role-Based Security',
      description: 'Secure access with RBAC ensuring data protection and privacy.'
    },
    {
      icon: GraduationCap,
      title: 'Academic Eligibility',
      description: 'Monitor academic standing and eligibility requirements.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="ACLC LOGO (2).png" alt="SARMS Logo" className="text-blue-600" size={50} height={40} width={40} />
              <span className="font-bold text-xl text-slate-800">SARMS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                About
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <img src="ACLC Building.png" alt="" className="absolute top-0 left-0 w-full h-full object-cover opacity-20"/>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Student-Athlete Record Management System
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Centralized platform for ACLC College of Ormoc City to manage student-athlete 
              academic and athletic records with secure, role-based access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Features</h2>
            <p className="text-slate-500 mt-2">Everything you need to manage student-athletes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800">Ready to Get Started?</h2>
            <p className="text-slate-500 mt-2 mb-8">Join ACLC College in modernizing athlete management</p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/register" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Account
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} SARMS - ACLC College of Ormoc City, Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
