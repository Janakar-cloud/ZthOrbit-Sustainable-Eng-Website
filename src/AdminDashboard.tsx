import { useState } from 'react'
import './AdminDashboard.css'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

interface VideoUpload {
  title: string
  description: string
  category: string
  file: File | null
  thumbnail: File | null
}

interface PodcastUpload {
  title: string
  description: string
  episode: string
  file: File | null
  cover: File | null
}

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  profilePicture?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  twitter?: string
}

interface Video {
  id: number
  title: string
  category: string
  views: number
  duration: string
  uploadDate: string
  status: string
  description?: string
}

interface Podcast {
  id: number
  title: string
  episode: string
  listens: number
  duration: string
  uploadDate: string
  status: string
  description?: string
}

interface UserFormData {
  name: string
  email: string
  role: string
  status: string
  profilePicture: string
  instagram: string
  facebook: string
  linkedin: string
  twitter: string
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'videos' | 'podcasts' | 'analytics'>('dashboard')
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'manage'>('upload')
  const [videoData, setVideoData] = useState<VideoUpload>({
    title: '',
    description: '',
    category: 'sustainability',
    file: null,
    thumbnail: null
  })
  const [podcastData, setPodcastData] = useState<PodcastUpload>({
    title: '',
    description: '',
    episode: '',
    file: null,
    cover: null
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // State for CRUD operations
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15', profilePicture: '', instagram: '@johndoe', facebook: 'john.doe', linkedin: 'johndoe', twitter: '@johndoe' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', joinDate: '2024-02-20', profilePicture: '', instagram: '@janesmith', facebook: 'jane.smith', linkedin: 'janesmith', twitter: '@janesmith' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', status: 'Active', joinDate: '2024-03-10', profilePicture: '', instagram: '@mikej', facebook: 'mike.johnson', linkedin: 'mikejohnson', twitter: '@mikej' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Editor', status: 'Inactive', joinDate: '2024-01-05', profilePicture: '', instagram: '@sarahw', facebook: 'sarah.williams', linkedin: 'sarahwilliams', twitter: '@sarahw' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Viewer', status: 'Active', joinDate: '2024-04-12', profilePicture: '', instagram: '@tombrown', facebook: 'tom.brown', linkedin: 'tombrown', twitter: '@tombrown' }
  ])

  const [videos, setVideos] = useState<Video[]>([
    { id: 1, title: 'Sustainable Energy Solutions', category: 'Sustainability', views: 12543, duration: '15:30', uploadDate: '2024-01-20', status: 'Published', description: 'Exploring renewable energy solutions' },
    { id: 2, title: 'Leadership in Green Tech', category: 'Leadership', views: 8921, duration: '22:15', uploadDate: '2024-02-05', status: 'Published', description: 'Leaders driving sustainable technology' },
    { id: 3, title: 'Innovation in Climate Action', category: 'Innovation', views: 15678, duration: '18:45', uploadDate: '2024-03-10', status: 'Published', description: 'Innovative approaches to climate change' },
    { id: 4, title: 'Corporate Sustainability', category: 'Environment', views: 6432, duration: '20:00', uploadDate: '2024-03-25', status: 'Draft', description: 'How corporations embrace sustainability' },
    { id: 5, title: 'Future of Green Economy', category: 'Technology', views: 11234, duration: '25:30', uploadDate: '2024-04-01', status: 'Published', description: 'Economic models for sustainable future' }
  ])

  const [podcasts, setPodcasts] = useState<Podcast[]>([
    { id: 1, title: 'Conversations on Sustainability', episode: 'Episode 12', listens: 5432, duration: '45:20', uploadDate: '2024-01-18', status: 'Published', description: 'Deep dive into sustainability topics' },
    { id: 2, title: 'Green Leadership Today', episode: 'Episode 08', listens: 3876, duration: '38:15', uploadDate: '2024-02-15', status: 'Published', description: 'Interviews with green leaders' },
    { id: 3, title: 'Climate Action Insights', episode: 'Episode 15', listens: 6789, duration: '52:30', uploadDate: '2024-03-05', status: 'Published', description: 'Insights on climate action strategies' },
    { id: 4, title: 'Sustainable Business Models', episode: 'Episode 03', listens: 2145, duration: '41:10', uploadDate: '2024-03-20', status: 'Draft', description: 'Business models for sustainability' },
    { id: 5, title: 'Tech for Good', episode: 'Episode 20', listens: 8901, duration: '48:00', uploadDate: '2024-04-10', status: 'Published', description: 'Technology driving positive change' }
  ])

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showPodcastModal, setShowPodcastModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // User form state
  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
    profilePicture: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  })

  // CRUD Operations for Users
  const handleAddUser = () => {
    setEditingUser(null)
    setUserForm({
      name: '',
      email: '',
      role: 'Viewer',
      status: 'Active',
      profilePicture: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      twitter: ''
    })
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profilePicture: user.profilePicture || '',
      instagram: user.instagram || '',
      facebook: user.facebook || '',
      linkedin: user.linkedin || '',
      twitter: user.twitter || ''
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId))
      alert('User deleted successfully!')
    }
  }

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      alert('Please fill in all required fields')
      return
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...userForm } 
          : u
      ))
      alert('User updated successfully!')
    } else {
      // Add new user
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...userForm,
        joinDate: new Date().toISOString().split('T')[0]
      }
      setUsers([...users, newUser])
      alert('User added successfully!')
    }
    setShowUserModal(false)
  }

  // CRUD Operations for Videos
  const handleEditVideo = (video: Video) => {
    setEditingVideo(video)
    setVideoData({
      title: video.title,
      description: video.description || '',
      category: video.category.toLowerCase(),
      file: null,
      thumbnail: null
    })
    setShowVideoModal(true)
  }

  const handleDeleteVideo = (videoId: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== videoId))
      alert('Video deleted successfully!')
    }
  }

  const handleUpdateVideo = () => {
    if (!videoData.title || !videoData.description) {
      alert('Please fill in all required fields')
      return
    }

    if (editingVideo) {
      setVideos(videos.map(v => 
        v.id === editingVideo.id 
          ? { 
              ...v, 
              title: videoData.title,
              description: videoData.description,
              category: videoData.category.charAt(0).toUpperCase() + videoData.category.slice(1)
            } 
          : v
      ))
      alert('Video updated successfully!')
      setShowVideoModal(false)
      setEditingVideo(null)
      setVideoData({
        title: '',
        description: '',
        category: 'sustainability',
        file: null,
        thumbnail: null
      })
    }
  }

  const handleToggleVideoStatus = (videoId: number) => {
    setVideos(videos.map(v => 
      v.id === videoId 
        ? { ...v, status: v.status === 'Published' ? 'Draft' : 'Published' } 
        : v
    ))
  }

  // CRUD Operations for Podcasts
  const handleEditPodcast = (podcast: Podcast) => {
    setEditingPodcast(podcast)
    setPodcastData({
      title: podcast.title,
      description: podcast.description || '',
      episode: podcast.episode,
      file: null,
      cover: null
    })
    setShowPodcastModal(true)
  }

  const handleDeletePodcast = (podcastId: number) => {
    if (confirm('Are you sure you want to delete this podcast?')) {
      setPodcasts(podcasts.filter(p => p.id !== podcastId))
      alert('Podcast deleted successfully!')
    }
  }

  const handleUpdatePodcast = () => {
    if (!podcastData.title || !podcastData.description || !podcastData.episode) {
      alert('Please fill in all required fields')
      return
    }

    if (editingPodcast) {
      setPodcasts(podcasts.map(p => 
        p.id === editingPodcast.id 
          ? { 
              ...p, 
              title: podcastData.title,
              description: podcastData.description,
              episode: podcastData.episode
            } 
          : p
      ))
      alert('Podcast updated successfully!')
      setShowPodcastModal(false)
      setEditingPodcast(null)
      setPodcastData({
        title: '',
        description: '',
        episode: '',
        file: null,
        cover: null
      })
    }
  }

  const handleTogglePodcastStatus = (podcastId: number) => {
    setPodcasts(podcasts.map(p => 
      p.id === podcastId 
        ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } 
        : p
    ))
  }

  // Search functionality
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    const files = e.target.files
    if (files && files[0]) {
      setVideoData({ ...videoData, [type]: files[0] })
    }
  }

  const handlePodcastFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'cover') => {
    const files = e.target.files
    if (files && files[0]) {
      setPodcastData({ ...podcastData, [type]: files[0] })
    }
  }

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
          setVideoData({
            title: '',
            description: '',
            category: 'sustainability',
            file: null,
            thumbnail: null
          })
          alert('Video uploaded successfully!')
        }, 500)
      }
    }, 200)
  }

  const handlePodcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
          setPodcastData({
            title: '',
            description: '',
            episode: '',
            file: null,
            cover: null
          })
          alert('Podcast uploaded successfully!')
        }, 500)
      }
    }, 200)
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo-section">
            <div className="admin-logo-icon">
              <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="admin-logo-image" />
            </div>
            <h1 className="admin-logo">Admin Dashboard</h1>
          </div>
          <button className="back-btn" onClick={() => onNavigate('home')}>
            <span className="material-icons">arrow_back</span>
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          <div className="dashboard-header">
            <h2 className="dashboard-title">Admin Control Panel</h2>
            <p className="dashboard-subtitle">Manage users, content, and analytics</p>
          </div>

          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="material-icons">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="material-icons">people</span>
              <span>Users</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <span className="material-icons">video_library</span>
              <span>Videos</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'podcasts' ? 'active' : ''}`}
              onClick={() => setActiveTab('podcasts')}
            >
              <span className="material-icons">podcast</span>
              <span>Podcasts</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="material-icons">analytics</span>
              <span>Analytics</span>
            </button>
          </div>

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="stats-grid">
                <div className="stat-card-large">
                  <span className="material-icons stat-icon">video_library</span>
                  <div className="stat-content">
                    <h4 className="stat-number">{videos.length}</h4>
                    <p className="stat-label">Total Videos</p>
                    <p className="stat-change positive">+3 this month</p>
                  </div>
                </div>
                <div className="stat-card-large">
                  <span className="material-icons stat-icon">podcast</span>
                  <div className="stat-content">
                    <h4 className="stat-number">{podcasts.length}</h4>
                    <p className="stat-label">Total Podcasts</p>
                    <p className="stat-change positive">+2 this month</p>
                  </div>
                </div>
                <div className="stat-card-large">
                  <span className="material-icons stat-icon">people</span>
                  <div className="stat-content">
                    <h4 className="stat-number">{users.length}</h4>
                    <p className="stat-label">Total Users</p>
                    <p className="stat-change positive">+12 this month</p>
                  </div>
                </div>
                <div className="stat-card-large">
                  <span className="material-icons stat-icon">visibility</span>
                  <div className="stat-content">
                    <h4 className="stat-number">{videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</h4>
                    <p className="stat-label">Total Views</p>
                    <p className="stat-change positive">+15% this month</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3 className="section-title">Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="material-icons activity-icon video">video_library</span>
                    <div className="activity-details">
                      <p className="activity-title">New video published: "{videos[0].title}"</p>
                      <p className="activity-time">2 hours ago</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="material-icons activity-icon user">person_add</span>
                    <div className="activity-details">
                      <p className="activity-title">New user registered: {users[4].name}</p>
                      <p className="activity-time">5 hours ago</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="material-icons activity-icon podcast">podcast</span>
                    <div className="activity-details">
                      <p className="activity-title">Podcast uploaded: "{podcasts[0].title}"</p>
                      <p className="activity-time">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header-with-action">
                <h3 className="section-title">User Management</h3>
                <div className="header-actions">
                  <div className="search-box">
                    <span className="material-icons">search</span>
                    <input
                      type="text"
                      placeholder="Search by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="add-btn" onClick={handleAddUser}>
                    <span className="material-icons">person_add</span>
                    <span>Add User</span>
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Social Links</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td className="title-cell">{user.name}</td>
                          <td>{user.email}</td>
                          <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                          <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                          <td>{user.joinDate}</td>
                          <td>
                            <div className="social-links">
                              {user.instagram && <span className="material-icons social-icon" title="Instagram">camera_alt</span>}
                              {user.facebook && <span className="material-icons social-icon" title="Facebook">facebook</span>}
                              {user.linkedin && <span className="material-icons social-icon" title="LinkedIn">business</span>}
                              {user.twitter && <span className="material-icons social-icon" title="Twitter">chat</span>}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="icon-btn view" title="View" onClick={() => alert(`Viewing ${user.name}'s profile`)}>
                                <span className="material-icons">visibility</span>
                              </button>
                              <button className="icon-btn edit" title="Edit" onClick={() => handleEditUser(user)}>
                                <span className="material-icons">edit</span>
                              </button>
                              <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteUser(user.id)}>
                                <span className="material-icons">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Videos Section */}
          {activeTab === 'videos' && (
            <div className="content-section">
              <div className="sub-tab-navigation">
                <button 
                  className={`sub-tab-btn ${activeSubTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('upload')}
                >
                  <span className="material-icons">upload</span>
                  <span>Upload Video</span>
                </button>
                <button 
                  className={`sub-tab-btn ${activeSubTab === 'manage' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('manage')}
                >
                  <span className="material-icons">list</span>
                  <span>Manage Videos</span>
                </button>
              </div>

              {activeSubTab === 'upload' && (
                <div className="upload-section">
                  <div className="upload-card">
                    <div className="card-header">
                      <span className="material-icons card-icon">upload_file</span>
                      <h3 className="card-title">Upload Video</h3>
                    </div>

                    <form onSubmit={handleVideoSubmit} className="upload-form">
                      <div className="form-group">
                        <label htmlFor="video-title">Video Title *</label>
                        <input
                          type="text"
                          id="video-title"
                          value={videoData.title}
                          onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                          placeholder="Enter video title"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="video-description">Description *</label>
                        <textarea
                          id="video-description"
                          value={videoData.description}
                          onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                          placeholder="Enter video description"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="video-category">Category *</label>
                        <select
                          id="video-category"
                          value={videoData.category}
                          onChange={(e) => setVideoData({ ...videoData, category: e.target.value })}
                          required
                        >
                          <option value="sustainability">Sustainability</option>
                          <option value="leadership">Leadership</option>
                          <option value="innovation">Innovation</option>
                          <option value="environment">Environment</option>
                          <option value="technology">Technology</option>
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="video-file">Video File *</label>
                          <div className="file-upload-wrapper">
                            <input
                              type="file"
                              id="video-file"
                              accept="video/*"
                              onChange={(e) => handleVideoFileChange(e, 'file')}
                              required
                            />
                            <div className="file-upload-display">
                              <span className="material-icons">video_file</span>
                              <span className="file-name">
                                {videoData.file ? videoData.file.name : 'Choose video file'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="video-thumbnail">Thumbnail *</label>
                          <div className="file-upload-wrapper">
                            <input
                              type="file"
                              id="video-thumbnail"
                              accept="image/*"
                              onChange={(e) => handleVideoFileChange(e, 'thumbnail')}
                              required
                            />
                            <div className="file-upload-display">
                              <span className="material-icons">image</span>
                              <span className="file-name">
                                {videoData.thumbnail ? videoData.thumbnail.name : 'Choose thumbnail'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isUploading && (
                        <div className="upload-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{uploadProgress}%</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isUploading}
                      >
                        <span className="material-icons">cloud_upload</span>
                        <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeSubTab === 'manage' && (
                <div className="manage-section">
                  <h3 className="section-title">Video Library</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Views</th>
                          <th>Duration</th>
                          <th>Upload Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.map(video => (
                          <tr key={video.id}>
                            <td className="title-cell">{video.title}</td>
                            <td>{video.category}</td>
                            <td className="views-cell">
                              <span className="material-icons small-icon">visibility</span>
                              {video.views.toLocaleString()}
                            </td>
                            <td>{video.duration}</td>
                            <td>{video.uploadDate}</td>
                            <td>
                              <span 
                                className={`status-badge ${video.status.toLowerCase()}`}
                                onClick={() => handleToggleVideoStatus(video.id)}
                                style={{ cursor: 'pointer' }}
                                title="Click to toggle status"
                              >
                                {video.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button className="icon-btn view" title="View" onClick={() => alert(`Playing: ${video.title}`)}>
                                  <span className="material-icons">play_arrow</span>
                                </button>
                                <button className="icon-btn edit" title="Edit" onClick={() => handleEditVideo(video)}>
                                  <span className="material-icons">edit</span>
                                </button>
                                <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteVideo(video.id)}>
                                  <span className="material-icons">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Podcasts Section */}
          {activeTab === 'podcasts' && (
            <div className="content-section">
              <div className="sub-tab-navigation">
                <button 
                  className={`sub-tab-btn ${activeSubTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('upload')}
                >
                  <span className="material-icons">upload</span>
                  <span>Upload Podcast</span>
                </button>
                <button 
                  className={`sub-tab-btn ${activeSubTab === 'manage' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('manage')}
                >
                  <span className="material-icons">list</span>
                  <span>Manage Podcasts</span>
                </button>
              </div>

              {activeSubTab === 'upload' && (
                <div className="upload-section">
                  <div className="upload-card">
                    <div className="card-header">
                      <span className="material-icons card-icon">upload_file</span>
                      <h3 className="card-title">Upload Podcast</h3>
                    </div>

                    <form onSubmit={handlePodcastSubmit} className="upload-form">
                      <div className="form-group">
                        <label htmlFor="podcast-title">Podcast Title *</label>
                        <input
                          type="text"
                          id="podcast-title"
                          value={podcastData.title}
                          onChange={(e) => setPodcastData({ ...podcastData, title: e.target.value })}
                          placeholder="Enter podcast title"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="podcast-episode">Episode Number *</label>
                        <input
                          type="text"
                          id="podcast-episode"
                          value={podcastData.episode}
                          onChange={(e) => setPodcastData({ ...podcastData, episode: e.target.value })}
                          placeholder="e.g., Episode 01"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="podcast-description">Description *</label>
                        <textarea
                          id="podcast-description"
                          value={podcastData.description}
                          onChange={(e) => setPodcastData({ ...podcastData, description: e.target.value })}
                          placeholder="Enter podcast description"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="podcast-file">Audio File *</label>
                          <div className="file-upload-wrapper">
                            <input
                              type="file"
                              id="podcast-file"
                              accept="audio/*"
                              onChange={(e) => handlePodcastFileChange(e, 'file')}
                              required
                            />
                            <div className="file-upload-display">
                              <span className="material-icons">audiotrack</span>
                              <span className="file-name">
                                {podcastData.file ? podcastData.file.name : 'Choose audio file'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="podcast-cover">Cover Image *</label>
                          <div className="file-upload-wrapper">
                            <input
                              type="file"
                              id="podcast-cover"
                              accept="image/*"
                              onChange={(e) => handlePodcastFileChange(e, 'cover')}
                              required
                            />
                            <div className="file-upload-display">
                              <span className="material-icons">image</span>
                              <span className="file-name">
                                {podcastData.cover ? podcastData.cover.name : 'Choose cover image'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isUploading && (
                        <div className="upload-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{uploadProgress}%</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isUploading}
                      >
                        <span className="material-icons">cloud_upload</span>
                        <span>{isUploading ? 'Uploading...' : 'Upload Podcast'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeSubTab === 'manage' && (
                <div className="manage-section">
                  <h3 className="section-title">Podcast Library</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Episode</th>
                          <th>Listens</th>
                          <th>Duration</th>
                          <th>Upload Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {podcasts.map(podcast => (
                          <tr key={podcast.id}>
                            <td className="title-cell">{podcast.title}</td>
                            <td>{podcast.episode}</td>
                            <td className="views-cell">
                              <span className="material-icons small-icon">headphones</span>
                              {podcast.listens.toLocaleString()}
                            </td>
                            <td>{podcast.duration}</td>
                            <td>{podcast.uploadDate}</td>
                            <td>
                              <span 
                                className={`status-badge ${podcast.status.toLowerCase()}`}
                                onClick={() => handleTogglePodcastStatus(podcast.id)}
                                style={{ cursor: 'pointer' }}
                                title="Click to toggle status"
                              >
                                {podcast.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button className="icon-btn view" title="Listen" onClick={() => alert(`Playing: ${podcast.title}`)}>
                                  <span className="material-icons">play_arrow</span>
                                </button>
                                <button className="icon-btn edit" title="Edit" onClick={() => handleEditPodcast(podcast)}>
                                  <span className="material-icons">edit</span>
                                </button>
                                <button className="icon-btn delete" title="Delete" onClick={() => handleDeletePodcast(podcast.id)}>
                                  <span className="material-icons">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h3 className="section-title">Platform Analytics</h3>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4 className="analytics-title">Video Performance</h4>
                  <div className="chart-placeholder">
                    <span className="material-icons chart-icon">show_chart</span>
                    <p>Total Views: {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</p>
                    <p>Avg Views per Video: {Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length).toLocaleString()}</p>
                  </div>
                </div>

                <div className="analytics-card">
                  <h4 className="analytics-title">Podcast Performance</h4>
                  <div className="chart-placeholder">
                    <span className="material-icons chart-icon">podcasts</span>
                    <p>Total Listens: {podcasts.reduce((sum, p) => sum + p.listens, 0).toLocaleString()}</p>
                    <p>Avg Listens per Episode: {Math.round(podcasts.reduce((sum, p) => sum + p.listens, 0) / podcasts.length).toLocaleString()}</p>
                  </div>
                </div>

                <div className="analytics-card">
                  <h4 className="analytics-title">User Growth</h4>
                  <div className="chart-placeholder">
                    <span className="material-icons chart-icon">trending_up</span>
                    <p>Active Users: {users.filter(u => u.status === 'Active').length}</p>
                    <p>New This Month: +12</p>
                  </div>
                </div>

                <div className="analytics-card">
                  <h4 className="analytics-title">Content Distribution</h4>
                  <div className="chart-placeholder">
                    <span className="material-icons chart-icon">pie_chart</span>
                    <p>Published: {videos.filter(v => v.status === 'Published').length + podcasts.filter(p => p.status === 'Published').length}</p>
                    <p>Draft: {videos.filter(v => v.status === 'Draft').length + podcasts.filter(p => p.status === 'Draft').length}</p>
                  </div>
                </div>
              </div>

              <div className="top-content-section">
                <h4 className="section-subtitle">Top Performing Videos</h4>
                <div className="top-content-list">
                  {videos.sort((a, b) => b.views - a.views).slice(0, 5).map(video => (
                    <div key={video.id} className="top-content-item">
                      <div className="content-info">
                        <p className="content-title">{video.title}</p>
                        <p className="content-meta">{video.category}</p>
                      </div>
                      <div className="content-stats">
                        <span className="material-icons">visibility</span>
                        <span>{video.views.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="top-content-section">
                <h4 className="section-subtitle">Top Performing Podcasts</h4>
                <div className="top-content-list">
                  {podcasts.sort((a, b) => b.listens - a.listens).slice(0, 5).map(podcast => (
                    <div key={podcast.id} className="top-content-item">
                      <div className="content-info">
                        <p className="content-title">{podcast.title}</p>
                        <p className="content-meta">{podcast.episode}</p>
                      </div>
                      <div className="content-stats">
                        <span className="material-icons">headphones</span>
                        <span>{podcast.listens.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button className="close-btn" onClick={() => setShowUserModal(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Profile Picture URL</label>
                  <input
                    type="text"
                    value={userForm.profilePicture}
                    onChange={(e) => setUserForm({ ...userForm, profilePicture: e.target.value })}
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
                <div className="form-section-title">Social Media Links</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="text"
                      value={userForm.instagram}
                      onChange={(e) => setUserForm({ ...userForm, instagram: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Facebook</label>
                    <input
                      type="text"
                      value={userForm.facebook}
                      onChange={(e) => setUserForm({ ...userForm, facebook: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                      type="text"
                      value={userForm.linkedin}
                      onChange={(e) => setUserForm({ ...userForm, linkedin: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Twitter</label>
                    <input
                      type="text"
                      value={userForm.twitter}
                      onChange={(e) => setUserForm({ ...userForm, twitter: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button className="save-btn" onClick={handleSaveUser}>
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Edit Modal */}
        {showVideoModal && (
          <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Video</h2>
                <button className="close-btn" onClick={() => setShowVideoModal(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={videoData.title}
                    onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    placeholder="Enter video title"
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={videoData.description}
                    onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                    placeholder="Enter video description"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={videoData.category}
                    onChange={(e) => setVideoData({ ...videoData, category: e.target.value })}
                  >
                    <option value="sustainability">Sustainability</option>
                    <option value="leadership">Leadership</option>
                    <option value="innovation">Innovation</option>
                    <option value="environment">Environment</option>
                    <option value="technology">Technology</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowVideoModal(false)}>Cancel</button>
                <button className="save-btn" onClick={handleUpdateVideo}>Update Video</button>
              </div>
            </div>
          </div>
        )}

        {/* Podcast Edit Modal */}
        {showPodcastModal && (
          <div className="modal-overlay" onClick={() => setShowPodcastModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Podcast</h2>
                <button className="close-btn" onClick={() => setShowPodcastModal(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={podcastData.title}
                    onChange={(e) => setPodcastData({ ...podcastData, title: e.target.value })}
                    placeholder="Enter podcast title"
                  />
                </div>
                <div className="form-group">
                  <label>Episode *</label>
                  <input
                    type="text"
                    value={podcastData.episode}
                    onChange={(e) => setPodcastData({ ...podcastData, episode: e.target.value })}
                    placeholder="e.g., Episode 01"
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={podcastData.description}
                    onChange={(e) => setPodcastData({ ...podcastData, description: e.target.value })}
                    placeholder="Enter podcast description"
                    rows={4}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowPodcastModal(false)}>Cancel</button>
                <button className="save-btn" onClick={handleUpdatePodcast}>Update Podcast</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
