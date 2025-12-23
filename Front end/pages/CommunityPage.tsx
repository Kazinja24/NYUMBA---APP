import React, { useState, useEffect } from 'react';
import { Calculator, Users, BookOpen, AlertTriangle, MessageCircle, ThumbsUp, Plus } from 'lucide-react';
import { Language, ForumPost } from '../types';
import { TRANSLATIONS } from '../constants';
import Button from '../components/Button';
import { api } from '../services/api';

interface CommunityPageProps {
  language: Language;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [income, setIncome] = useState<number | ''>('');
  const [budget, setBudget] = useState<number | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  
  // New Post State
  const [isAsking, setIsAsking] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.forum.getPosts();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  const calculateBudget = () => {
    if (typeof income === 'number') {
      setBudget(income * 0.3);
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const post: ForumPost = {
      id: 'f_' + Date.now(),
      authorName: 'You',
      title: newQuestion.title,
      content: newQuestion.content,
      category: 'GENERAL',
      likes: 0,
      comments: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setPosts([post, ...posts]);
    setIsAsking(false);
    setNewQuestion({ title: '', content: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.community}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Tools & Tips */}
          <div className="space-y-8">
            {/* Affordability Calculator */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-emerald-100 rounded-full mr-4">
                  <Calculator className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t.calculator}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.calc.incomeLabel}
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. 1000000"
                  />
                </div>

                <Button onClick={calculateBudget} className="w-full" disabled={!income}>
                  {t.calc.calculate}
                </Button>

                {budget !== null && (
                  <div className="mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-100 text-center animate-fadeIn">
                    <p className="text-sm text-emerald-800 font-medium mb-1">{t.calc.result}</p>
                    <p className="text-3xl font-bold text-emerald-600 mb-3">
                      {budget.toLocaleString()} TZS
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.calc.advice}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Static Tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <div className="flex items-center mb-4">
                 <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                 <h3 className="font-bold text-gray-900">How to Avoid Scams</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">•</span>
                  Never send money via M-Pesa/Tigo without meeting the landlord.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">•</span>
                  Verify property ownership documents if possible.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">•</span>
                  Use NIKONEKTI verified listings for safety.
                </li>
              </ul>
            </div>
            
             <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-sm p-6 text-white">
               <div className="flex items-center mb-4">
                 <BookOpen className="w-5 h-5 mr-2" />
                 <h3 className="font-bold">Tenant Rights Guide</h3>
              </div>
              <p className="text-sm opacity-90 mb-4">
                Learn about the Tanzania Rent Restriction Act and your rights as a tenant.
              </p>
              <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border-none">
                  Read Guide
              </Button>
            </div>
          </div>

          {/* Right Column: Community Forums */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                 <Users className="w-6 h-6 text-emerald-600 mr-2" />
                 <h2 className="text-xl font-bold text-gray-900">Community Forum</h2>
              </div>
              <Button size="sm" onClick={() => setIsAsking(!isAsking)}>
                 {isAsking ? 'Cancel' : 'Ask Question'}
              </Button>
            </div>

            {isAsking && (
              <form onSubmit={handlePostSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fadeIn">
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder="e.g., Is Mbezi safe?" 
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                      required
                    />
                 </div>
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-2 h-24"
                      placeholder="More details about your question..." 
                      value={newQuestion.content}
                      onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                      required
                    />
                 </div>
                 <Button type="submit" className="w-full">Post Question</Button>
              </form>
            )}

            {isLoadingPosts ? (
              <div className="text-center py-12">Loading discussions...</div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-900">{post.title}</h3>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         post.category === 'SCAM_ALERT' ? 'bg-red-100 text-red-700' : 
                         post.category === 'ADVICE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                       }`}>
                         {post.category.replace('_', ' ')}
                       </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                       <div className="flex items-center">
                          <span className="font-medium text-gray-900 mr-2">{post.authorName}</span>
                          <span>{post.date}</span>
                       </div>
                       <div className="flex items-center space-x-4">
                          <span className="flex items-center hover:text-emerald-600 cursor-pointer">
                             <ThumbsUp className="w-3 h-3 mr-1" /> {post.likes}
                          </span>
                          <span className="flex items-center hover:text-emerald-600 cursor-pointer">
                             <MessageCircle className="w-3 h-3 mr-1" /> {post.comments}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;