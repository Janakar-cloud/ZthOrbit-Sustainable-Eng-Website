import { useState, useEffect } from 'react'
import '../../style/LiveTV.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import VideoModal from '../../components/VideoModal'
import { Video } from '../HomePage/type/type'
import VideoCategoryFilters from './components/renderFilterButtons'
import VideoGrid from './components/VideoGrid'
import { VideoCategory } from './type/type'
import { LiveVideo } from '../../hooks/videolive'
import { useSharedCategories } from '../../hooks/categories'
import NoData from '../../components/Nodatafound'
import ErrorMessage from '../../components/ErroMessage'
import Loader from '../../components/Loader'
import { canonicalizeCategoryNames, normalizeCategoryKey } from '../../utils/category'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const { darkMode } = useAppContext()
  const [videos, setVideos] = useState<Video[]>([])
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([{
    key: 'all',
    label: 'ALL VIDEOS',
    icon: 'apps'
  }])
  const { videocast, loading, error, refetch } = LiveVideo();
  const { categories: sharedCategories } = useSharedCategories();

  useEffect(() => {
    if (!Array.isArray(videocast?.items)) return;

    const mapVideo = (item: any): Video => {
      const categoryNames = canonicalizeCategoryNames(
        [
          item.category,
          ...(Array.isArray(item.categories) ? item.categories : []),
          ...(Array.isArray(item.tags)
            ? item.tags
                .filter((tag: any) => tag?.kind === 'category')
                .map((tag: any) => tag?.name)
            : []),
        ],
        sharedCategories
      )
      return {
        id: item._id,
        title: item.title,
        description: item.description || "",
        videoId: item.videoId || "",
        streamUrl: item.streamUrl || item.fileUrl || item.hlsUrl || item.url || "",
        category: categoryNames[0] || "",
        categories: categoryNames,
        isLive: item.isLive ?? false,
        publishDate: new Date(item.publishDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        thumbnail: item.thumbnailUrl || "",
      }
    };

    // Grid: all videos that have a playable URL (thumbnail is optional)
    const gridVideos: Video[] = videocast.items
      .filter((item: any) => !!(item.streamUrl || item.fileUrl || item.hlsUrl || item.url))
      .map(mapVideo);

    setVideos(gridVideos);
    const categoryList = buildCategoryList(sharedCategories, gridVideos);
    setVideoCategories(categoryList);

  }, [sharedCategories, videocast]);

  useEffect(() => {
    setVideoCategories(buildCategoryList(sharedCategories, videos));
  }, [sharedCategories, videos]);



  const buildCategoryList = (shared: Array<{ name: string }>, videos: Video[]) => {
    const names = canonicalizeCategoryNames(
      shared.length > 0
        ? shared.map((category) => category.name)
        : videos.map((video) => video.category),
      shared
    );

    return [
      { key: 'all', label: 'ALL VIDEOS', icon: 'apps' },
      ...names
        .map(name => ({
          key: normalizeCategoryKey(name),
          label: name,
          icon: 'video_library'
        }))
    ];
  };

  // Filter videos (grid section)
  const filteredVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((video) =>
          video.categories.some((cat) => normalizeCategoryKey(cat) === selectedCategory)
        )

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
  }


  // BLOCK RENDER UNTIL READY
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <Loader />
      </div>
    );
  }

  if (!loading && videos.length === 0) {
    return (
      <div className={`livetv ${darkMode ? 'dark' : ''}`}>
        <Header onNavigate={onNavigate} />
        <div className="livetv-container">
          <NoData message="No videos available" onRetry={() => { refetch() }} />
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    )
  }

  return (
    <div className={`livetv ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      {/* VIDEO GRID */}
      <div className="livetv-container">

        <VideoCategoryFilters
          selectedCategory={selectedCategory}
          categories={videoCategories}
          onCategoryChange={setSelectedCategory}
        />

        {/* Loading */}
        {loading && (
          <Loader />
        )}

        {/* Error */}
        {error && (
          <ErrorMessage message={error} onRetry={() => { refetch() }} />
        )}

        {/* Data */}
        {!loading && !error && (
          <>
            {filteredVideos.length > 0 ? (
              <VideoGrid
                videos={filteredVideos}
                onPlay={handlePlayVideo}
                className="livetv-grid"
                cardClassName="livetv-card"
              />
            ) : (
              <NoData message="No videos available" onRetry={() => { refetch() }} />
            )}
          </>
        )}

      </div>

      {/* MODAL */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  )
}