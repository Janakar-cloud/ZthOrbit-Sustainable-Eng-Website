import {ArticleItem,LiveTvItem,PodcastItem,Video, Podcast} from '../type/type'


export const ourVideo = [
    { title: "Latest Videos", desc: "Check out our newest visual creations.", onNavigation: "livetv", isPlay: true, imgurl: "/assets/images/Sustainable development goals as a strategic framework for global stability (2).png" },
    { title: "Featured Podcasts", desc: "Tune in to our most popular series.", onNavigation: "podcast", isPlay: false, imgurl: "/assets/images/AI & Sustainability.jpeg" },
    { title: "Recent Productions", desc: "Explore the work we're most proud of.", onNavigation: "livetv", isPlay: false, imgurl: "/assets/images/delivering the sdg through the technology, governance and measurable impact.png" },
    { title: "Top Documentaries", desc: "Stories that matter, told visually.", onNavigation: "livetv", isPlay: false, imgurl: "/assets/images/Governance-Risk-Management-and-Compliance.webp" }
]

export const liveTv: LiveTvItem[] = [
  {
    id:1,
    title: "Latest Videos",
    description: "Check out our newest visual creations.",
    image: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (6).jpg"
  },
  {
    id:2,
    title: "Environmental Videos",
    description: "Sustainability solutions in action.",
    image: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (20).jpg",
  },
  {
    id:3,
    title: "Finance Videos",
    description: "Responsible finance and growth.",
    image: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (10).jpg",
  },
  {
    id:4,
    title: "Technology Videos",
    description: "Digital innovation stories.",
    image: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (18).jpg",
  }
]

 export const articlesData: ArticleItem[] = [
    {
      id: 1,
      title: "Latest Insights",
      description: "Fresh perspectives on sustainability.",
      image:
        "/assets/images/Sustainable development goals as a strategic framework for global stability (2).png",
    },
    {
      id: 2,
      title: "Technology & Innovation",
      description: "Digital transformation for sustainability.",
      image:
        "/assets/images/digital ecosystem as a new driver of sustainable economic growth .png",
    },
    {
      id: 3,
      title: "Leadership & Strategy",
      description: "Conscious leadership in action.",
      image:
        "/assets/images/Aligning Sustainabillity, ethics and governence for the future .png",
    },
    {
      id: 4,
      title: "Global Economics",
      description: "Economic insights for a sustainable future.",
      image:
        "/assets/images/India_s digital convergence and the imperative  of financial inclusion in 2026.png",
    },
  ];



 export const podcast: PodcastItem[] = [
    {
      id: 1,
      title: "AI & Sustainable Development",
      description: "How AI is enabling sustainability efforts globally.",
      image: "/assets/podcast/back-view-happy-young-man-looking-opportunity-door-wooden-background-success-future-abstraction-concept_670147-37595.jpg",
    },
    {
      id: 2,
      title: "Waste to Value Opportunities",
      description: "Transforming waste into valuable business ventures.",
      image: "/assets/podcast/ecommerce-companie-lose-revenue.jpg",
    },
    {
      id: 3,
      title: "Finance & Responsibility",
      description: "Understanding financial responsibility beyond profit.",
      image: "/assets/podcast/blog_financial_markets.jpg",
    },
    {
      id: 4,
      title: "Governance & Risk Management",
      description: "Building resilient sustainable organizations.",
      image: "/assets/podcast/Risk-Management-shutterstock_1490634692-scaled.jpg",
    },
  ];



  // Latest video (same as in LiveTV.tsx)
 export const latestVideo: Video = {
    id: '1',
    title: 'Sustainable Engineering Innovation',
    description: 'Exploring cutting-edge sustainable engineering solutions and innovations for a greener future.',
    videoId: '1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ',
    streamUrl: '',
    isLive: false,
    category: 'sustainability',
    publishDate: 'Jan 20, 2026',
    thumbnail: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png'
  }

  // Live TV videos
 export const liveTVVideos: Video[] = [
    {
      id: '1',
      title: 'Digital Ecosystem Growth',
      description: 'Exploring digital ecosystems as drivers of sustainable economic growth.',
      videoId: '1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ',
      streamUrl: '',
      isLive: false,
      category: 'technology',
      publishDate: 'Jan 20, 2026',
      thumbnail: '/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (6).jpg'
    },
    {
      id: '2',
      title: 'Waste to Worth',
      description: 'Transforming waste into valuable resources through innovative solutions.',
      videoId: '121y0xbR6SEQSMZSIg0PVZA8Wn1DHzx7P',
      streamUrl: '',
      isLive: false,
      category: 'sustainability',
      publishDate: 'Jan 18, 2026',
      thumbnail: '/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (20).jpg'
    },
    {
      id: '3',
      title: 'Finance & Responsibility',
      description: 'Balancing financial growth with environmental responsibility.',
      videoId: '1251b1AGfXIPIP_hGkk-mlnhr5s0TsnfJ',
      streamUrl: '',
      isLive: false,
      category: 'finance',
      publishDate: 'Jan 15, 2026',
      thumbnail: '/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (10).jpg'
    },
    {
      id: '4',
      title: 'Digital Convergence in India',
      description: 'India\'s digital transformation and financial inclusion in 2026.',
      videoId: '1RFsLTZ8tI6z8-C9JgLfVhE7QGz9vXdqN',
      streamUrl: '',
      isLive: false,
      category: 'technology',
      publishDate: 'Jan 12, 2026',
      thumbnail: '/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (18).jpg'
    }
  ]

  // Podcast episodes
  export const podcastEpisodes: Podcast[] = [
    {
      id: '2',
      title: 'Artificial Intelligence: A Great Enabler Towards Sustainable Development',
      description: 'How AI is revolutionizing sustainability efforts across industries.',
      audioFile: '/assets/podcast/ARTIFICIAL INTELLIGENCE IS A GREAT ENABLER TOWARDS SUSTAINABLE DEVELOPMENT.m4a',
      image: '/assets/podcast/back-view-happy-young-man-looking-opportunity-door-wooden-background-success-future-abstraction-concept_670147-37595.jpg',
      duration: '52:15',
      category: 'technology',
      publishDate: 'Jan 12, 2026'
    },
    {
      id: '11',
      title: 'From Waste to Value: Opportunities Unveiled',
      description: 'Transforming waste streams into valuable resources.',
      audioFile: '/assets/podcast/OPPORTUNITIES FROM WASTE TO VALUES.m4a',
      image: '/assets/podcast/ecommerce-companie-lose-revenue.jpg',
      duration: '42:30',
      category: 'sustainability',
      publishDate: 'Dec 18, 2025'
    },
    {
      id: '5',
      title: 'Finance is Not Just Profit: It is Responsibility',
      description: 'Understanding financial responsibility beyond profit.',
      audioFile: '/assets/podcast/FINANCE IS NOT JUST PROFIT. IT IS RESPONSIBILITY.m4a',
      image: '/assets/podcast/blog_financial_markets.jpg',
      duration: '39:30',
      category: 'economy',
      publishDate: 'Jan 5, 2026'
    },
    {
      id: '9',
      title: 'Governance & Risk Management are Integral',
      description: 'Building resilient, sustainable organizations.',
      audioFile: '/assets/podcast/GOVERNANCE & RISK MANAGEMENT ARE INTEGRAL.m4a',
      image: '/assets/podcast/Risk-Management-shutterstock_1490634692-scaled.jpg',
      duration: '43:40',
      category: 'leadership',
      publishDate: 'Dec 22, 2025'
    }
  ]

