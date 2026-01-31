import { useState } from 'react'
import '../../style/Articles.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import CategoryFilter from '../Podcast/components/CategoryFilter'
import PodcastHero from '../Podcast/components/PodcastHero'

interface ArticlesProps {
  onNavigate: (page: string) => void
}

interface Article {
  id: number
  title: string
  subtitle: string
  category: string
  readTime: string
  date: string
  content: string[]
  featured: boolean
  image: string
}

export default function Articles({ onNavigate }: ArticlesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const { darkMode, showProfileMenu, isAdmin } = useAppContext()
  
  const categories = [
    { id: 'all', name: 'All Articles', icon: 'article' },
    { id: 'economy', name: 'Economy', icon: 'trending_up' },
    { id: 'technology', name: 'Technology', icon: 'computer' },
    { id: 'sustainability', name: 'Sustainability', icon: 'eco' },
    { id: 'leadership', name: 'Leadership', icon: 'groups' },
    { id: 'ethics', name: 'Ethics', icon: 'balance' }
  ]

  const articles: Article[] = [
    {
      id: 1,
      title: 'The Digital Ecosystem as the New Driver of Sustainable Economic Growth',
      subtitle: 'From Economic Fixes to Structural Transformation',
      category: 'economy',
      readTime: '8 min',
      date: 'January 2026',
      featured: true,
      image: '/assets/images/digital ecosystem as a new driver of sustainable economic growth .png',
      content: [
        'In an era marked by economic uncertainty, geopolitical realignments, and environmental stress, the global economy is undergoing a fundamental transformation. Traditional growth models driven by short-term monetary interventions are no longer sufficient. The emergence of the digital ecosystem has become central to redefining sustainability, resilience, and long-term economic momentum.',
        'Post-crisis responses such as quantitative easing and accommodative monetary policy provided temporary relief but also created distortions in currency markets, asset prices, and income distribution. Sustainable growth cannot be achieved through liquidity injections alone. It requires structural reforms anchored in technology, governance, and inclusion.',
        'Digital ecosystems—integrating artificial intelligence, blockchain, cloud computing, and data-driven platforms—are reshaping business models across governments, corporates, and financial institutions. Whether at a G2G level, public–private partnerships, or within enterprises, digital convergence is no longer optional. Organizations that fail to adapt risk obsolescence, loss of credibility, and declining competitiveness.',
        'True sustainability lies at the intersection of economics and ecology. Digital systems enable transparency, efficiency, carbon measurement, and responsible capital allocation. By embedding sustainability metrics into financial and operational frameworks, institutions can move from intent to measurable impact.',
        'The future belongs to economies that embrace digital ecosystems not merely for efficiency, but as a foundation for inclusive, transparent, and sustainable growth. Global partnerships, enabled by technology, are the only viable path forward.'
      ]
    },
    {
      id: 2,
      title: "India's Digital Convergence and the Imperative of Financial Inclusion in 2026",
      subtitle: 'India at a Strategic Inflection Point',
      category: 'economy',
      readTime: '10 min',
      date: 'January 2026',
      featured: true,
      image: '/assets/images/India_s digital convergence and the imperative  of financial inclusion in 2026.png',
      content: [
        "India's economy is experiencing structural transformation driven by rapid digitisation, financial inclusion initiatives, and robust digital public infrastructure. The convergence of these forces positions India not only as a leading emerging market but as a global benchmark in financial technology and inclusive growth.",
        "India's financial inclusion efforts are gaining measurable traction. In 2025, the Reserve Bank of India's Financial Inclusion Index rose to 67.0, indicating wider access, usage, and quality of financial services across urban and rural populations. Millions of previously unbanked citizens now have access to bank accounts, credit, pensions, and insurance products—a significant step toward inclusive economic participation.",
        "Government schemes such as Pradhan Mantri Jan Dhan Yojana, coupled with digital identity (Aadhaar) and payments infrastructure, have played a central role in democratizing financial access. This ongoing shift is foundational to building digital citizenship and economic equity.",
        "India's digital payments ecosystem continues to scale exponentially. Real-time payment platforms, driven by the Unified Payments Interface (UPI), have made India one of the largest markets for instant payments globally, reshaping consumer behavior and commerce.",
        "In 2026, the fintech landscape is expected to diversify beyond payments into cross-border payments, AI-driven services, and embedded finance models. The expansion of UPI into international payment rails and the development of cross-border settlement systems underscore India's drive to integrate its digital economy with global financial flows.",
        "India's digital public infrastructure (DPI)—including Aadhaar, e-KYC, DigiLocker, and account aggregators—forms a low-cost, interoperable backbone that catalyses private innovation and reduces transaction friction.",
        "Despite progress, regulatory frameworks must adapt to evolving digital norms. Data governance, cybersecurity, and financial literacy remain priority areas to ensure trust and protect consumers.",
        "India's digital convergence—anchored in inclusion, innovation, and governance—represents a sustainable path to equitable growth. The fusion of policy, technology, and infrastructure can continue to expand participation, boost productivity, and reinforce India's position in the global digital economy."
      ]
    },
    {
      id: 3,
      title: 'Global Economic Shifts, Technology Disruption, and the Future of Banking in 2026',
      subtitle: 'A Changing Global Financial Order',
      category: 'technology',
      readTime: '12 min',
      date: 'January 2026',
      featured: true,
      image: '/assets/images/digital ecosystem as a new driver of sustainable economic growth .png',
      content: [
        'The global financial landscape in 2026 is shaped by technology disruption, shifting geopolitical power, and evolving monetary frameworks. Traditional free trade dynamics and legacy financial systems are being redefined by digital assets, regulatory realignments, and innovation in financial infrastructure.',
        'Emerging markets continue to outperform advanced economies, with global growth expectations reflecting a clear growth premium in developing regions. This shift underscores the need for agile financial systems capable of responding to innovation and volatility.',
        'Technology is no longer a peripheral factor in financial services; it is now central to strategy and competitiveness. Artificial Intelligence is redefining operational models from automating back-office functions to enhancing customer engagement and fraud detection.',
        'Blockchain and Digital Assets: Distributed ledger technologies are reshaping secure transactions, transparency, and cross-border settlement systems. Discussions on stablecoins and digital currencies highlight the potential for new monetary infrastructure that transcends traditional fiat systems.',
        'Institutions must evolve from isolated digital projects to enterprise-wide technology platforms capable of handling real-time analytics, compliance complexity, and cyber threats.',
        'Emerging trends such as embedded banking, open banking ecosystems, and agentic commerce (AI-driven autonomous transaction flows) further illustrate the breadth of technological transformation.',
        'As institutions adopt AI and API-driven models, risk management systems must evolve to address sophisticated cyber threats, compliance demands, and ethical AI use. Digital regulatory technologies (RegTech) are emerging as essential tools to balance innovation with safeguards.',
        'The future of banking will be defined by flexibility, transparency, and interoperability. Real-time, intelligent payments and settlement systems, hyper-personalised customer experiences powered by data analytics and AI, and modular financial services delivered via open APIs will shape the next era.',
        'The global financial ecosystem is undergoing a profound metamorphosis. Technology is central to this evolution, demanding a systemic rethinking of banking models, governance, and competitive strategy.'
      ]
    },
    {
      id: 4,
      title: "Global Investor Confidence and Qatar's Reaffirmed Financial Credibility",
      subtitle: 'A Bond Sale That Redefined Market Sentiment',
      category: 'economy',
      readTime: '6 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/Global Investor confiedence and qoatar_s reaffirmed financial credibility.png',
      content: [
        "The recent sovereign-linked bond issuance marked a decisive moment for Qatar's engagement with global capital markets. Initially planned at USD 8–9 billion, the issuance was oversubscribed multiple times, ultimately closing at USD 12 billion.",
        "This level of demand—spanning Asia, Europe, and other global financial centres—sent a strong signal of renewed confidence in Qatar's economic fundamentals and institutional strength.",
        "Feedback from institutional investors has been consistent: Qatar is viewed as a jurisdiction with credible governance, disciplined financial management, and professional institutions. The scale and pricing efficiency of the bond sale reflect trust in the country's ability to manage liquidity, honour commitments, and sustain macroeconomic stability.",
        "In a global environment where capital has become more selective, oversubscription is not merely a technical outcome—it is a reputational endorsement.",
        "Post-crisis financial indicators further reinforce this confidence. Banking system liquidity has normalised, and financial stability has been demonstrably resilient. Lending growth has remained around 8 percent, while deposit growth has exceeded 10 percent.",
        "The bond sale has become more than a funding exercise—it is a validation of Qatar's financial credibility at a time when global markets are increasingly unforgiving."
      ]
    },
    {
      id: 5,
      title: 'Banking Transformation in Qatar—From Crisis Response to Strategic Reinvention',
      subtitle: 'A Shift from Stability to Strategy',
      category: 'economy',
      readTime: '7 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/banking transformation in qatar from crisis response to strategic reinvention.png',
      content: [
        "The post-crisis phase has accelerated a fundamental shift in banking priorities. Rather than focusing solely on defensive measures, banks in Qatar are now redefining business models, recalibrating asset allocation, and embracing digital governance as a strategic imperative.",
        "This transition reflects a broader global trend: resilience alone is no longer sufficient—adaptability and transformation are now essential for long-term competitiveness.",
        "Operational strategies are being redesigned to improve efficiency, transparency, and responsiveness. Digital governance frameworks are enabling faster decision-making, better risk visibility, and more effective customer engagement.",
        "Instead of large-scale job cuts, the emphasis has been on reorganising processes, redeploying talent, and upgrading digital capabilities—a trend consistent with global banking leaders in 2025–2026.",
        "Sector-specific challenges, particularly in contracting and project finance, are being addressed through targeted debt restructuring and asset regeneration. This proactive approach reflects a shift away from short-term asset disposal toward long-term value recovery.",
        "Recent developments in capital-market instruments, including exchange-traded funds (ETFs), highlight a growing focus on diversification, transparency, and cost-effective investment solutions.",
        "Qatar's banking sector is moving beyond crisis management toward strategic reinvention. Digital governance, disciplined asset management, and product innovation are shaping a more resilient and future-ready financial ecosystem."
      ]
    },
    {
      id: 6,
      title: 'Why India Is Central to the Next Phase of Emerging-Market Banking Strategy',
      subtitle: 'Emerging Markets in a Multipolar World',
      category: 'economy',
      readTime: '8 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/why india is central to the next phase of emerging - market banking strategy.png',
      content: [
        "As advanced economies grapple with modest growth and structural constraints, emerging markets are increasingly driving global momentum. Among them, India stands out for its scale, policy direction, and pace of digital transformation.",
        "Global financial institutions are recalibrating their emerging-market strategies, and India is being prioritised over several traditional destinations due to its demographic strength, infrastructure expansion, and digital public systems.",
        "India's transformation is anchored in decisive leadership, digital governance, and an expanding domestic market. With ambitions toward a USD 5 trillion economy, the country combines mass consumer demand with rapidly improving infrastructure, logistics, and financial inclusion.",
        "Digital platforms, e-commerce expansion, and formalisation of the economy have created a powerful ecosystem for trade-linked banking, investment flows, and cross-border finance.",
        "The growing economic interdependence between India and the Gulf region has strengthened the case for deeper banking integration. Trade finance, corporate banking, and investment advisory services are increasingly aligned with bilateral flows rather than purely regional strategies.",
        "Recent branch expansions in Mumbai, Kochi, and Chennai reflect a long-term commitment to India's southern and western economic corridors—regions closely tied to global trade and diaspora networks.",
        "India's appeal lies not in short-term growth metrics but in structural transformation. For banks seeking sustainable expansion in a volatile global economy, India represents a convergence of scale, stability, and long-term opportunity that few markets can match."
      ]
    },
    {
      id: 7,
      title: 'Sustainable Development Goals as a Strategic Framework for Global Stability',
      subtitle: 'From Global Vision to Economic Imperative',
      category: 'sustainability',
      readTime: '9 min',
      date: 'January 2026',
      featured: true,
      image: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png',
      content: [
        'The Sustainable Development Goals (SDGs), adopted by the United Nations, were designed as a universal roadmap to address poverty, inequality, climate risk, and institutional fragility. As the world moves closer to 2030, the relevance of the SDGs has intensified—not as aspirational ideals, but as strategic tools for economic and social stability.',
        'In an era defined by geopolitical realignments, supply-chain disruptions, and climate volatility, sustainable development has become inseparable from macroeconomic resilience.',
        'Recent global experience has demonstrated that economic growth alone cannot deliver long-term stability. Without inclusion, growth exacerbates inequality, weakens social trust, and fuels political and economic instability.',
        'SDGs focused on poverty alleviation, education, healthcare, gender equality, and reduced inequalities reinforce a core principle: development must be participatory and equitable.',
        'Financial inclusion, digital access, and social protection are no longer viewed as welfare measures but as essential enablers of productivity, demand creation, and long-term growth.',
        'Climate change has transitioned from an environmental concern to a direct economic risk. Rising temperatures, extreme weather events, and resource scarcity are influencing sovereign credit ratings, insurance markets, infrastructure costs, and capital flows.',
        'SDGs related to climate action, clean energy, and responsible consumption now sit at the centre of economic decision-making. The convergence of ecology and economics is no longer theoretical—it is shaping fiscal policy, corporate strategy, and investment behaviour worldwide.',
        'Strong institutions and global partnerships underpin the entire SDG framework. Transparent governance, rule-based systems, and international cooperation are essential to translating commitments into outcomes.',
        'The SDGs represent a shared global language for stability, resilience, and long-term prosperity. Nations and institutions that integrate these goals into policy, finance, and governance frameworks will be better equipped to manage uncertainty and create enduring value for society.'
      ]
    },
    {
      id: 8,
      title: 'Delivering the SDGs Through Technology, Governance, and Measurable Impact',
      subtitle: 'The Shift from Commitment to Execution',
      category: 'sustainability',
      readTime: '10 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/delivering the sdg through the technology, governance and measurable impact.png',
      content: [
        'As the 2030 deadline approaches, the global sustainability discourse is shifting decisively—from pledges to performance and accountability. Stakeholders now expect measurable outcomes rather than narrative alignment.',
        'Technology has emerged as one of the most powerful enablers of sustainable development. Digital public infrastructure, fintech platforms, data analytics, and artificial intelligence are accelerating progress across multiple SDGs by expanding access, improving transparency, and reducing delivery costs.',
        'Digital systems enable broader financial inclusion and direct benefit transfers, scalable education and healthcare delivery, real-time governance and public-finance transparency, and accurate measurement of emissions and resource use.',
        'However, digital progress must be balanced with safeguards. Data protection, cybersecurity, ethical AI, and digital literacy are essential to prevent new forms of exclusion.',
        'Effective SDG implementation requires strong governance structures and reliable metrics. Sustainability must be integrated into core strategy, risk management, and capital allocation—not treated as a parallel initiative.',
        'Institutions are increasingly expected to demonstrate quantifiable SDG-aligned outcomes, transparent sustainability reporting, long-term stakeholder value creation, and alignment between financial performance and social impact.',
        'Mobilising capital remains a critical challenge. Green finance, sustainability-linked instruments, blended finance, and development-oriented investment models are playing a growing role in bridging funding gaps.',
        'The future of the SDGs lies in disciplined execution. Technology, governance, and measurable impact must work together to convert ambition into results.'
      ]
    },
    {
      id: 9,
      title: 'Sustainability as the Foundation of Long-Term Value Creation',
      subtitle: 'From Optional Initiative to Strategic Necessity',
      category: 'sustainability',
      readTime: '6 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png',
      content: [
        'Sustainability has moved decisively from the margins of corporate discourse to the centre of strategic decision-making. What was once treated as an adjunct to business performance is now recognised as a determinant of long-term value, resilience, and credibility.',
        'Environmental degradation, climate volatility, and social inequality are no longer abstract risks. They directly affect supply chains, operating costs, regulatory exposure, and access to capital.',
        'As a result, sustainability has become inseparable from enterprise risk management and growth planning.',
        'Sustainable practices are increasingly aligned with financial prudence. Efficient resource use, energy transition, and responsible sourcing reduce volatility and strengthen operational continuity.',
        'Investors and lenders now factor environmental and social performance into valuation, risk pricing, and capital allocation decisions.',
        'The convergence of ecology and economics reflects a fundamental shift: growth that undermines future capacity is no longer considered growth at all.',
        'Sustainability is not a constraint on enterprise ambition. It is the framework that enables businesses to grow responsibly, compete effectively, and remain relevant in a rapidly changing world.'
      ]
    },
    {
      id: 10,
      title: 'Corporate Consciousness—Redefining the Role of Leadership',
      subtitle: 'Beyond Shareholder Primacy',
      category: 'leadership',
      readTime: '7 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/digital ecosystem as a new driver of sustainable economic growth .png',
      content: [
        'Corporate leadership is undergoing a profound transformation. The traditional model—focused narrowly on short-term shareholder returns—is giving way to corporate consciousness, a mindset that recognises responsibility toward all stakeholders.',
        'Employees, customers, communities, and future generations are no longer peripheral considerations. They are central to organisational legitimacy and long-term success.',
        'Corporate consciousness is rooted in trust. Institutions that consistently demonstrate fairness, transparency, and accountability build reputational capital that protects them during periods of stress.',
        'Conversely, organisations that sacrifice values for expediency often discover that reputational damage outlasts financial gain.',
        'Conscious leadership asks not only what is profitable, but what is appropriate, defensible, and enduring.',
        'Corporate consciousness is not an abstract philosophy. It is a leadership discipline—one that aligns decision-making with values, reinforces institutional trust, and strengthens long-term competitiveness.'
      ]
    },
    {
      id: 11,
      title: 'Ethical Decision-Making in an Era of Complexity and Disruption',
      subtitle: 'Ethics Under Pressure',
      category: 'ethics',
      readTime: '7 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/Aligning Sustainabillity, ethics and governence for the future .png',
      content: [
        'Ethical decision-making is most severely tested during periods of uncertainty—economic downturns, geopolitical disruptions, technological upheaval, or competitive stress. In such moments, the temptation to prioritise speed over principle is strongest.',
        'However, history repeatedly demonstrates that ethical compromise rarely remains contained. The cost of reputational erosion, regulatory intervention, and loss of trust far exceeds any short-term advantage gained.',
        'Ethical organisations rely on clear principles rather than ad hoc judgement. Consistency, transparency, and accountability act as stabilising forces when external conditions are volatile.',
        'Decisions guided by principle are easier to defend, communicate, and sustain over time.',
        'Ethics, therefore, is not a moral luxury—it is a strategic necessity for institutional continuity.',
        'In a world of increasing complexity, ethical clarity becomes a competitive advantage. Organisations that anchor decisions in values are better equipped to navigate disruption without sacrificing credibility.'
      ]
    },
    {
      id: 12,
      title: 'Aligning Sustainability, Ethics, and Governance for the Future',
      subtitle: 'The Role of Systems and Governance',
      category: 'ethics',
      readTime: '8 min',
      date: 'January 2026',
      featured: false,
      image: '/assets/images/Aligning Sustainabillity, ethics and governence for the future .png',
      content: [
        'Sustainability and ethics cannot rely solely on individual intent. They must be embedded into systems, governance frameworks, and performance metrics. Strong institutions translate values into practice through policies, controls, and accountability mechanisms.',
        'Digital governance, data transparency, and automation are reinforcing this shift by reducing opacity and enhancing traceability across operations.',
        'While technology accelerates efficiency and scale, it also introduces ethical responsibilities. Responsible use of data, artificial intelligence, and digital platforms is essential to prevent bias, exclusion, and systemic risk.',
        'Governance must evolve alongside innovation.',
        'Global frameworks such as the Sustainable Development Goals promoted by the United Nations reinforce the importance of strong institutions, responsible consumption, climate action, and inclusive growth.',
        'The future belongs to organisations that successfully integrate sustainability, corporate consciousness, and ethical decision-making into their governance architecture.',
        'This integration ensures that purpose and performance reinforce—rather than contradict—each other.'
      ]
    }
  ]

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory)

  if (selectedArticle) {
    return (
      <div className={`articles-page ${darkMode ? 'dark' : ''}`}>

   
        <article className="article-full">
          <div className="article-container">
            <div className="article-header-section">
              <div className="article-category-badge">
                <span className="material-icons">
                  {categories.find(c => c.id === selectedArticle.category)?.icon}
                </span>
                <span>{selectedArticle.category}</span>
              </div>
              <h1 className="article-full-title">{selectedArticle.title}</h1>
              <p className="article-full-subtitle">{selectedArticle.subtitle}</p>
              <div className="article-meta-info">
                <span className="meta-item">
                  <span className="material-icons">calendar_today</span>
                  {selectedArticle.date}
                </span>
                <span className="meta-item">
                  <span className="material-icons">schedule</span>
                  {selectedArticle.readTime} read
                </span>
              </div>
            </div>

            <div className="article-featured-image">
              <img src={selectedArticle.image} alt={selectedArticle.title} />
            </div>

            <div className="article-body">
              {selectedArticle.content.map((paragraph, index) => (
                <p key={index} className="article-paragraph">{paragraph}</p>
              ))}
            </div>

            <div className="article-footer-section">
              <div className="article-share">
                <h3>Share this article</h3>
                <div className="share-buttons">
                  <button className="share-btn"><span className="material-icons">link</span></button>
                  <button className="share-btn"><span className="material-icons">email</span></button>
                  <button className="share-btn"><span className="material-icons">bookmark</span></button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className={`articles-page ${darkMode ? 'dark' : ''}`}>
     <Header onNavigate={onNavigate}/>

      <PodcastHero
        title="Thought Leadership in Sustainable Development"
        subtitle="Deep insights on global economics, technology, sustainability, and conscious leadership" 
        imgStatus={false} 
        className='articles-hero'/>

       <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <section className="articles-list-section">
        <div className="articles-container">
          <div className="articles-grid">
            {filteredArticles.map(article => (
              <div key={article.id} className="article-card" onClick={() => setSelectedArticle(article)}>
                <div className="article-card-image">
                  <img src={article.image} alt={article.title} />
                  <div className="article-card-category">
                    <span className="material-icons">
                      {categories.find(c => c.id === article.category)?.icon}
                    </span>
                    <span>{article.category}</span>
                  </div>
                </div>
                <div className="article-card-content">
                  <h3 className="article-card-title">{article.title}</h3>
                  <p className="article-card-excerpt">{article.content[0].substring(0, 150)}...</p>
                  <div className="article-card-footer">
                    <div className="article-card-meta">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <button className="article-card-btn">
                      <span>Read</span>
                      <span className="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="articles-cta-section">
        <div className="articles-container">
          <div className="articles-cta-content">
            <h2 className="cta-heading">Stay Updated</h2>
            <p className="cta-text">
              Subscribe to receive the latest insights on sustainable development, technology, and conscious leadership.
            </p>
            <div className="cta-action-buttons">
              <button className="cta-action-btn primary" onClick={() => onNavigate('about')}>
                <span>Contact Us</span>
                <span className="material-icons">send</span>
              </button>
              <button className="cta-action-btn secondary" onClick={() => onNavigate('home')}>
                <span>Explore More</span>
                <span className="material-icons">explore</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate}/>
      
    </div>
  )
}
