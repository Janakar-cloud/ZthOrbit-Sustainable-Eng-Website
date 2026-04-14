import { useCallback, useState } from 'react'
import '../../style/HomePage.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import PodcastModal from '../../components/PodcastModal'
import VideoModal from '../../components/VideoModal'
import WorkSection from './components/WorkSection'
import LiveTvHeroPlayer from '../LiveTv/components/LiveTvHeroPlayer'
import {Video, Podcast, HomePageProps} from './type/type'

import { useHomeData } from '../../hooks/home'

export default function HomePage({ onNavigate }: HomePageProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const { darkMode,setActivePage } = useAppContext()
  const { data: homeData } = useHomeData()

  // Map API videos → WorkSection items + modal items
  const liveTvItems = (homeData?.videos ?? []).slice(0, 4).map((v, i) => ({
    id: i + 1,
    title: v.title,
    description: v.description,
    image: v.thumbnailUrl,
  }))

  const videosForModal: Video[] = (homeData?.videos ?? []).slice(0, 4).map((v) => ({
    id: v._id,
    title: v.title,
    description: v.description,
    streamUrl: v.streamUrl,
    thumbnail: v.thumbnailUrl || '',
    isLive: v.isLive,
    category: '',
    categories: [],
    publishDate: v.publishDate || '',
  }))

  // Map API podcasts → WorkSection items + modal items
  const podcastItems = (homeData?.podcasts ?? []).slice(0, 4).map((p, i) => ({
    id: i + 1,
    title: p.title,
    description: p.description,
    image: p.imageUrl || '',
  }))

  const podcastsForModal: Podcast[] = (homeData?.podcasts ?? []).slice(0, 4).map((p) => ({
    id: p._id,
    title: p.title,
    description: p.description,
    audioFile: p.audioUrl,
    image: p.imageUrl || '',
    duration: p.duration || '',
    category: '',
    publishDate: p.publishDate || '',
  }))

  // Map API articles → WorkSection items
  const articleItems = (homeData?.articles ?? []).slice(0, 4).map((a, i) => ({
    id: i + 1,
    title: a.title,
    description: a.subtitle || '',
    image: a.coverImage || '',
  }))

  
  /* -------------------- HANDLERS -------------------- */

  const playVideo = useCallback((video?: Video) => {
    if (video) setSelectedVideo(video)
  }, [])

  const playPodcast = useCallback((podcast: Podcast) => {
    setSelectedPodcast(podcast)
  }, [])


  return (
    <div className={`homepage ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      <main className="main-container">
        {/* Live TV Hero Player */}
        <LiveTvHeroPlayer isModalOpen={!!selectedVideo || !!selectedPodcast} />

       {/* Videos */}
        <WorkSection
          title="Videos"
          subtitle="Discover our latest videos and streaming content."
          items={liveTvItems}
          onItemClick={(_, position) => playVideo(videosForModal[position])}
        />

       {/* Podcasts */}
        <WorkSection
          title="Podcasts"
          subtitle="Listen to inspiring conversations and insights on sustainability."
          items={podcastItems}
          onItemClick={(_, position) => playPodcast(podcastsForModal[position])}
        />


       {/* ARTICLES */}
        <WorkSection
          title="Articles"
          subtitle="Read thought leadership on sustainable development and innovation."
          items={articleItems}
          onItemClick={() => {
            onNavigate('articles')
            setActivePage('articles')
           }}
        />
      </main>


      <Footer onNavigate={onNavigate} />

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Podcast Modal */}
      {selectedPodcast && (
        <PodcastModal
          podcast={selectedPodcast}
          onClose={() => setSelectedPodcast(null)}
        />
      )}
    </div>
  )
}