import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, getStoredUser } from '../api';
import { fetchUser } from '../reducer/thunks/userThunk'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Profile = () => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    preferences: {
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        whatsapp: false,
      },
    },
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    try {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        preferences: {
          language: user.preferences?.language || 'en',
          theme: user.preferences?.theme || 'light',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
            whatsapp: user.preferences?.notifications?.whatsapp ?? false,
          },
        },
      });
      setError('');
    } catch (err) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setFormData({
          firstName: storedUser.firstName || '',
          lastName: storedUser.lastName || '',
          username: storedUser.username || '',
          email: storedUser.email || '',
          phone: storedUser.phone || '',
          gender: storedUser.gender || '',
          preferences: {
            language: storedUser.preferences?.language || 'en',
            theme: storedUser.preferences?.theme || 'light',
            notifications: {
              email: storedUser.preferences?.notifications?.email ?? true,
              sms: storedUser.preferences?.notifications?.sms ?? false,
              whatsapp: storedUser.preferences?.notifications?.whatsapp ?? false,
            },
          },
        });
      }
      setError('Failed to load profile data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const path = name.split('.');
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [path[1]]: path[2] ? {
            ...prev.preferences[path[1]],
            [path[2]]: type === 'checkbox' ? checked : value
          } : (type === 'checkbox' ? checked : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setAvatarPreview(event.target.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateProfile(formData, avatarFile);
      
      // Refresh user data in Redux store after successful update
      await dispatch(fetchUser()).unwrap();
      
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadUserData();
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError('');
    setSuccess('');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    return avatarPreview || user?.avatar?.url || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                      {getAvatarUrl() ? (
                        <img
                          src={getAvatarUrl()}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(formData.firstName, formData.lastName)
                      )}
                    </div>
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-gray-600">@{formData.username}</p>
                    <p className="text-gray-500 text-sm mt-1">{formData.email}</p>
                  </div>
                </div>

                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Preferences
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          name="preferences.language"
                          value={formData.preferences.language}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          name="preferences.theme"
                          value={formData.preferences.theme}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Notification Preferences
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="preferences.notifications.email"
                            checked={formData.preferences.notifications.email}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">Email Notifications</span>
                            <p className="text-sm text-gray-500">Receive updates via email</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="preferences.notifications.sms"
                            checked={formData.preferences.notifications.sms}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">SMS Notifications</span>
                            <p className="text-sm text-gray-500">Receive updates via SMS</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="preferences.notifications.whatsapp"
                            checked={formData.preferences.notifications.whatsapp}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">WhatsApp Notifications</span>
                            <p className="text-sm text-gray-500">Receive updates via WhatsApp</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.firstName}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.lastName || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          @{formData.username}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.email}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.phone || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 capitalize">
                          {formData.gender || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Preferences
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 capitalize">
                          {formData.preferences.language}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 capitalize">
                          {formData.preferences.theme}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Notification Preferences</label>
                      <div className="space-y-2">
                        {Object.entries(formData.preferences.notifications)
                          .filter(([_, enabled]) => enabled)
                          .map(([type]) => (
                            <div key={type} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </div>
                          ))}
                        {Object.values(formData.preferences.notifications).every(enabled => !enabled) && (
                          <span className="text-gray-500 text-sm">No notifications enabled</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;