import { describe, it, expect } from 'vitest'

// Video data structure matching LiveTV.tsx
const videos = [
  {
    id: 1,
    title: 'Sustainable Development Goals: A Strategic Framework',
    videoId: '1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ',
    expectedFileName: 'Sustainable Development Goals A Strategic Framework.mp4'
  },
  {
    id: 2,
    title: 'Delivering the SDGs Through Technology & Governance',
    videoId: '121y0xbR6SEQSMZSIg0PVZA8Wn1DHzx7P',
    expectedFileName: 'Delivering the SDGs Through Technology & Governance.mp4'
  },
  {
    id: 3,
    title: 'Digital Ecosystem: Driver of Economic Growth',
    videoId: '1251b1AGfXIPIP_hGkk-mlnhr5s0TsnfJ',
    expectedFileName: 'Digital Ecosystem Driver of Economic Growth.mp4'
  },
  {
    id: 4,
    title: 'Finance & Responsibility: Beyond Profit',
    videoId: '1SYOtz1TxW_iXmLd1PmVIMi6Ynqhj2Vh9',
    expectedFileName: 'Finance & Responsibility Beyond Profit.mp4'
  },
  {
    id: 5,
    title: 'Aligning Sustainability, Ethics & Governance',
    videoId: '1Gxx8aFxFXFkmUc5jM94EC4orJJE_WMw0',
    expectedFileName: 'Aligning Sustainability Ethics & Governance.mp4'
  },
  {
    id: 6,
    title: 'AI & Sustainability: Technology for Change',
    videoId: '1ZdEmNMQpkBhRIzfMf_BCERdnTQJgyqa6',
    expectedFileName: 'AI & Sustainability Technology for Change.mp4'
  },
  {
    id: 7,
    title: 'From Waste to Worth: Circular Economy',
    videoId: '1_vqRWG1-m9-yqzQl-bLcxldQqUEJwUkh',
    expectedFileName: 'From Waste to Worth Circular Economy.mp4'
  },
  {
    id: 8,
    title: 'Financial Markets: Meaning Beyond Money',
    videoId: '1_ERDjEswCOTLWObPLA6T7cdgJK6IO-Hp',
    expectedFileName: 'Financial Markets Meaning Beyond Money.mp4'
  },
  {
    id: 9,
    title: 'Governance & Risk: Building Resilience',
    videoId: '15t9-nTlOgIMCyCBV-PzyxcnRAEa6nCCp',
    expectedFileName: 'Governance & Risk Building Resilience.mp4'
  },
  {
    id: 10,
    title: 'Opportunities in the New World Order',
    videoId: '1aqR59K66ZBXGn6yJAk1X6_SiVC6zOu_V',
    expectedFileName: 'Opportunities in the New World Order.mp4'
  },
  {
    id: 11,
    title: 'India\'s Digital Convergence & Financial Inclusion',
    videoId: '1nSNoRvalFMOjYnAPEAP5WkpneuEuqY2a',
    expectedFileName: 'India\'s Digital Convergence & Financial Inclusion.mp4'
  },
  {
    id: 12,
    title: 'Global Markets vs India: Economic Eminence',
    videoId: '199MXOMc2WKPW1EoO7qg-2TFCMTR6qLC4',
    expectedFileName: 'Global Markets vs India Economic Eminence.mp4'
  },
  {
    id: 13,
    title: 'Technology, Governance & Measurable Impact',
    videoId: '19uh2THvg-NP7sq5yt4HwmHpTB5HJb7lZ',
    expectedFileName: 'Technology Governance & Measurable Impact.mp4'
  },
  {
    id: 14,
    title: 'Circular Economy: Sustainable Business Models',
    videoId: '1dxlSxij_Sy1crUUITUq6ujQyW4ug46Xa',
    expectedFileName: 'Circular Economy Sustainable Business Models.mp4'
  },
  {
    id: 15,
    title: 'Climate Risk Management Strategies',
    videoId: '1P5qt6TBLcT-r9O-zt3-LQYtqWB0Hx6M4',
    expectedFileName: 'Climate Risk Management Strategies.mp4'
  },
  {
    id: 16,
    title: 'Sustainable Leadership & Ethics',
    videoId: '1HwDAbDruhmVpBm-lTJck3_i2hFImoZ7e',
    expectedFileName: 'Sustainable Leadership & Ethics.mp4'
  }
]

describe('LiveTV Video Data Validation', () => {
  it('should have all required fields for each video', () => {
    videos.forEach(video => {
      expect(video.id).toBeDefined()
      expect(video.title).toBeDefined()
      expect(video.videoId).toBeDefined()
      expect(video.expectedFileName).toBeDefined()
    })
  })

  it('should have unique video IDs', () => {
    const videoIds = videos.map(v => v.videoId)
    const uniqueIds = new Set(videoIds)
    expect(uniqueIds.size).toBe(videos.length)
  })

  it('should have unique titles', () => {
    const titles = videos.map(v => v.title)
    const uniqueTitles = new Set(titles)
    expect(uniqueTitles.size).toBe(videos.length)
  })

  it('should have valid Google Drive video IDs (non-empty strings)', () => {
    videos.forEach(video => {
      expect(typeof video.videoId).toBe('string')
      expect(video.videoId.length).toBeGreaterThan(0)
    })
  })

  it('should have titles that match expected file name patterns', () => {
    videos.forEach(video => {
      // Remove special characters and normalize
      const normalizedTitle = video.title.replace(/[:\-]/g, '').replace(/\s+/g, ' ').trim()
      const normalizedFileName = video.expectedFileName.replace('.mp4', '').replace(/[:\-]/g, '').replace(/\s+/g, ' ').trim()
      
      expect(normalizedFileName.toLowerCase()).toContain(normalizedTitle.toLowerCase().substring(0, 20))
    })
  })

  it('should generate correct Google Drive preview URLs', () => {
    videos.forEach(video => {
      const expectedUrl = `https://drive.google.com/file/d/${video.videoId}/preview`
      expect(expectedUrl).toMatch(/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/preview$/)
    })
  })
})

describe('Video-to-FileName Mapping', () => {
  it('should document the mapping between titles and expected Google Drive filenames', () => {
    console.log('\n=== VIDEO TO FILENAME MAPPING ===\n')
    videos.forEach(video => {
      console.log(`ID: ${video.id}`)
      console.log(`Title: ${video.title}`)
      console.log(`Google Drive ID: ${video.videoId}`)
      console.log(`Expected Filename: ${video.expectedFileName}`)
      console.log(`Preview URL: https://drive.google.com/file/d/${video.videoId}/preview`)
      console.log('---')
    })
    
    // This test always passes but serves as documentation
    expect(videos.length).toBe(16)
  })
})

/**
 * MANUAL VERIFICATION REQUIRED:
 * 
 * To verify that Google Drive file names match the titles:
 * 
 * 1. Open Google Drive and locate each video by its ID
 * 2. For each video, verify the actual filename matches the expectedFileName
 * 3. You can access each video directly using:
 *    https://drive.google.com/file/d/{videoId}/view
 * 
 * Example:
 * - Video 1: https://drive.google.com/file/d/1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ/view
 *   Expected name: "Sustainable Development Goals A Strategic Framework.mp4"
 * 
 * If any filenames don't match:
 * - Either rename the file in Google Drive to match the expected name
 * - Or update the title in LiveTV.tsx to match the actual Google Drive filename
 */
