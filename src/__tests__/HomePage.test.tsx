import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../HomePage'

describe('HomePage Component', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    mockOnNavigate.mockClear()
  })

  it('renders the HomePage with all main sections', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    // Check header elements
    expect(screen.getByText(/Green Generation/i)).toBeInTheDocument()
    expect(screen.getByText(/TV/i)).toBeInTheDocument()
    
    // Check navigation links exist (using getAllByText since some appear in footer too)
    expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Company').length).toBeGreaterThan(0)
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getAllByText('Case Stories').length).toBeGreaterThan(0)
    
    // Check hero section
    expect(screen.getByText(/Project Genesis/i)).toBeInTheDocument()
    expect(screen.getByText(/A journey into the future of humanity/i)).toBeInTheDocument()
  })

  it('renders hero section with correct images', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
    
    // Check main hero image
    const heroImage = images.find(img => 
      img.getAttribute('alt') === 'Sustainable Leadership'
    )
    expect(heroImage).toBeInTheDocument()
    expect(heroImage?.getAttribute('src')).toContain('Seetharaman 22Aug3575.jpg')
  })

  it('calls onNavigate when Watch Now button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    const watchButton = screen.getByRole('button', { name: /Watch Now/i })
    await user.click(watchButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('about')
    expect(mockOnNavigate).toHaveBeenCalledTimes(1)
  })

  it('calls onNavigate when Listen Now button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    const listenButton = screen.getByRole('button', { name: /Listen Now/i })
    await user.click(listenButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('about')
    expect(mockOnNavigate).toHaveBeenCalledTimes(1)
  })

  it('toggles dark mode when theme toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    const homepage = screen.getByText(/Green Generation/i).closest('.homepage')
    expect(homepage).not.toHaveClass('dark')
    
    // Find and click the theme toggle button
    const themeButton = screen.getByRole('button', { name: /dark_mode/i })
    await user.click(themeButton)
    
    // After clicking, dark mode should be toggled
    expect(homepage).toHaveClass('dark')
  })

  it('renders Our Work section with correct cards', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('Our Work')).toBeInTheDocument()
    expect(screen.getByText('Latest Videos')).toBeInTheDocument()
    expect(screen.getByText('Featured Podcasts')).toBeInTheDocument()
    expect(screen.getByText('Recent Productions')).toBeInTheDocument()
    expect(screen.getByText('Top Documentaries')).toBeInTheDocument()
  })

  it('renders Case Stories section', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    expect(screen.getAllByText('Case Stories').length).toBeGreaterThan(0)
    expect(screen.getByText(/Deep dives into sustainability impacts/i)).toBeInTheDocument()
  })

  it('renders sidebar podcast section', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('Audioverse Podcast')).toBeInTheDocument()
    expect(screen.getByText(/Exploring the latest in audio technology/i)).toBeInTheDocument()
  })

  it('has correct header structure and navigation', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // Check navigation elements are present (some appear in footer too)
    expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Company').length).toBeGreaterThan(0)
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('displays language selector', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('has footer with social links', () => {
    render(<HomePage onNavigate={mockOnNavigate} />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    
    // Check for social links
    const socialLinks = within(footer).getAllByRole('link')
    expect(socialLinks.length).toBeGreaterThan(0)
  })
})
