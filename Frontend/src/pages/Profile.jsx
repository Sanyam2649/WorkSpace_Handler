import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, getStoredUser, deleteAccount } from '../api';
import { fetchUser } from '../reducer/thunks/userThunk'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/useToast';
import {
  Camera,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  User as UserIcon,
  Languages,
  Palette,
  Bell,
  MessageSquare,
  Smartphone
} from 'lucide-react';

const Profile = () => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      const errorMessage = 'Failed to load profile data';
      showToast(errorMessage, 'error');
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
  
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      const errorMessage = 'Please enter your password to confirm account deletion';
      showToast(errorMessage, 'error');
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      setDeletePassword('');
      showToast('Account deleted successfully', 'success');
      // The logout and redirect will be handled by the deleteAccount API
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete account. Please check your password and try again.';
      showToast(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        const errorMessage = 'Image size should be less than 5MB';
        showToast(errorMessage, 'error');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setAvatarPreview(event.target.result);
      reader.readAsDataURL(file);
      showToast('Profile picture updated', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccess('');
      
      console.log(formData , "formData");
      
      await updateProfile(formData, avatarFile);
      
      // Refresh user data in Redux store after successful update
      await dispatch(fetchUser()).unwrap();
      
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      const successMessage = 'Profile updated successfully!';
      setSuccess(successMessage);
      showToast(successMessage, 'success');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadUserData();
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setSuccess('');
    showToast('Changes discarded', 'info');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    return avatarPreview || user?.avatar?.url || null;
  };

  const handleEditProfile = () => {
    setEditing(true);
    showToast('Edit mode enabled', 'info');
  };

  const handleDeleteModalOpen = () => {
    setShowDeleteModal(true);
    showToast('Please confirm account deletion', 'warning');
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    showToast('Account deletion cancelled', 'info');
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Profile Settings</h1>
            <p className="text-base-content/70 mt-1 sm:mt-2 text-sm sm:text-base">Manage your account information and preferences</p>
          </div>


          {success && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-success/10 border border-success/20 rounded-xl flex items-start sm:items-center gap-2 sm:gap-3">
              <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-success-content text-sm sm:text-base">{success}</span>
            </div>
          )}

          <div className="bg-base-100 rounded-xl sm:rounded-2xl shadow-lg border border-base-300 overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-base-300 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content text-xl sm:text-2xl font-bold border-4 border-base-100 shadow-lg">
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
                      <label className="absolute bottom-0 right-0 bg-base-100 rounded-full p-1.5 sm:p-2 shadow-lg border border-base-300 cursor-pointer hover:bg-base-200 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <Camera size={14} className="text-base-content sm:w-4 sm:h-4" />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-base-content">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-base-content/70 text-sm sm:text-base">@{formData.username}</p>
                  </div>
                </div>

                {!editing ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleDeleteModalOpen}
                      className="px-4 sm:px-6 py-2 bg-error text-error-content rounded-xl hover:bg-error/90 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base order-2 sm:order-1"
                    >
                      <Trash2 size={16} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete Account</span>
                      <span className="sm:hidden">Delete</span>
                    </button>
                    <button
                      onClick={handleEditProfile}
                      className="px-4 sm:px-6 py-2 bg-primary text-primary-content rounded-xl hover:bg-primary/90 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2"
                    >
                      <Edit3 size={16} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleCancel}
                      className="px-4 sm:px-6 py-2 border border-base-300 text-base-content rounded-xl hover:bg-base-200 transition-all font-medium shadow-sm text-sm sm:text-base order-2 sm:order-1 flex items-center justify-center gap-2"
                    >
                      <X size={16} className="sm:w-4 sm:h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-4 sm:px-6 py-2 bg-success text-success-content rounded-xl hover:bg-success/90 disabled:bg-base-300 disabled:text-base-content/50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-success-content border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} className="sm:w-4 sm:h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2 flex items-center gap-2">
                      <UserIcon size={20} />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-base-content mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content placeholder-base-content/50 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-base-content mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content placeholder-base-content/50 text-sm sm:text-base"
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-base-content mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content placeholder-base-content/50 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Mail size={16} />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-200 text-base-content/50 cursor-not-allowed text-sm sm:text-base"
                        />
                        <p className="text-xs text-base-content/50 mt-1">Email cannot be changed</p>
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Phone size={16} />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content placeholder-base-content/50 text-sm sm:text-base"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-base-content mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content text-sm sm:text-base"
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
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2 flex items-center gap-2">
                      <Bell size={20} />
                      Preferences
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Languages size={16} />
                          Language
                        </label>
                        <select
                          name="preferences.language"
                          value={formData.preferences.language}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content text-sm sm:text-base"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Palette size={16} />
                          Theme
                        </label>
                        <select
                          name="preferences.theme"
                          value={formData.preferences.theme}
                          onChange={handleInputChange}
                          className="w-full border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base-content text-sm sm:text-base"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div>
                      <label className="block text-sm font-medium text-base-content mb-3 sm:mb-4 flex items-center gap-2">
                        <Bell size={16} />
                        Notification Preferences
                      </label>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-base-300 rounded-xl hover:bg-base-200 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="preferences.notifications.email"
                            checked={formData.preferences.notifications.email}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5 sm:mt-0 flex-shrink-0"
                          />
                          <div className="flex items-center gap-2">
                            <Mail size={18} className="text-primary flex-shrink-0" />
                            <div>
                              <span className="font-medium text-base-content text-sm sm:text-base">Email Notifications</span>
                              <p className="text-xs sm:text-sm text-base-content/70">Receive updates via email</p>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-base-300 rounded-xl hover:bg-base-200 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="preferences.notifications.sms"
                            checked={formData.preferences.notifications.sms}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5 sm:mt-0 flex-shrink-0"
                          />
                          <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-primary flex-shrink-0" />
                            <div>
                              <span className="font-medium text-base-content text-sm sm:text-base">SMS Notifications</span>
                              <p className="text-xs sm:text-sm text-base-content/70">Receive updates via SMS</p>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-base-300 rounded-xl hover:bg-base-200 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="preferences.notifications.whatsapp"
                            checked={formData.preferences.notifications.whatsapp}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5 sm:mt-0 flex-shrink-0"
                          />
                          <div className="flex items-center gap-2">
                            <MessageSquare size={18} className="text-primary flex-shrink-0" />
                            <div>
                              <span className="font-medium text-base-content text-sm sm:text-base">WhatsApp Notifications</span>
                              <p className="text-xs sm:text-sm text-base-content/70">Receive updates via WhatsApp</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-6 sm:space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2 flex items-center gap-2">
                      <UserIcon size={20} />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2">First Name</label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base">
                          {formData.firstName}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2">Last Name</label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base">
                          {formData.lastName || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2">Username</label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base">
                          @{formData.username}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Mail size={16} />
                          Email
                        </label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base">
                          {formData.email}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Phone size={16} />
                          Phone Number
                        </label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base">
                          {formData.phone || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2">Gender</label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base capitalize">
                          {formData.gender || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2 flex items-center gap-2">
                      <Bell size={20} />
                      Preferences
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Languages size={16} />
                          Language
                        </label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base capitalize">
                          {formData.preferences.language}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                          <Palette size={16} />
                          Theme
                        </label>
                        <div className="p-2.5 sm:p-3 bg-base-200 rounded-xl border border-base-300 text-base-content text-sm sm:text-base capitalize">
                          {formData.preferences.theme}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-base-content mb-3 sm:mb-4 flex items-center gap-2">
                        <Bell size={16} />
                        Notification Preferences
                      </label>
                      <div className="space-y-2">
                        {Object.entries(formData.preferences.notifications)
                          .filter(([_, enabled]) => enabled)
                          .map(([type]) => (
                            <div key={type} className="inline-flex items-center gap-2 bg-primary/20 text-primary-content px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mr-2 mb-2">
                              {type === 'email' && <Mail size={12} />}
                              {type === 'sms' && <Smartphone size={12} />}
                              {type === 'whatsapp' && <MessageSquare size={12} />}
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </div>
                          ))}
                        {Object.values(formData.preferences.notifications).every(enabled => !enabled) && (
                          <span className="text-base-content/50 text-sm flex items-center gap-2">
                            <Bell size={14} />
                            No notifications enabled
                          </span>
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-base-content/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-base-100 rounded-xl sm:rounded-2xl shadow-xl border border-error/20 max-w-md w-full p-4 sm:p-6 mx-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-error sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Delete Account</h3>
            </div>
            
            <p className="text-base-content/70 mb-3 sm:mb-4 text-sm sm:text-base">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-medium text-base-content">
                Enter your password to confirm:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full border border-error/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-base-100 focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-colors text-base-content text-sm sm:text-base"
                placeholder="Your password"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleDeleteModalClose}
                className="flex-1 px-3 sm:px-4 py-2 border border-base-300 text-base-content rounded-xl hover:bg-base-200 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <X size={16} className="sm:w-4 sm:h-4" />
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                className="flex-1 px-3 sm:px-4 py-2 bg-error text-error-content rounded-xl hover:bg-error/90 disabled:bg-base-300 disabled:text-base-content/50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-error-content border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="sm:w-4 sm:h-4" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;