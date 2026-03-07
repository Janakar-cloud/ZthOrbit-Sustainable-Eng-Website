import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AboutUs from '../pages/AboutUs/AboutUs'

describe('AboutUs Component', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    mockOnNavigate.mockClear()
  })

  it('renders the AboutUs page with all main sections', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    // Check header (appears multiple times)
    expect(screen.getAllByText(/Green Generation TV/i).length).toBeGreaterThan(0)
    
    // Check hero section
    expect(screen.getByText(/EMPOWERING SUSTAINABILITY/i)).toBeInTheDocument()
    expect(screen.getByText(/Through Conscious Leadership and Media/i)).toBeInTheDocument()
    
    // Check Dr. Seetharaman section
    expect(screen.getByText(/Dr. R. Seetharaman/i)).toBeInTheDocument()
  })

  it('renders hero slideshow with correct images', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const images = screen.getAllByRole('img')
    
    // Check for slideshow images
    const slideshowImages = images.filter(img => 
      img.getAttribute('src')?.includes('Seetharaman')
    )
    expect(slideshowImages.length).toBeGreaterThan(0)
  })

  it('displays hero stats correctly', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('20+')).toBeInTheDocument()
    expect(screen.getByText('Years Leadership')).toBeInTheDocument()
    expect(screen.getByText('Global')).toBeInTheDocument()
    expect(screen.getByText('Impact')).toBeInTheDocument()
    expect(screen.getByText('Future')).toBeInTheDocument()
    expect(screen.getByText('Generation')).toBeInTheDocument()
  })

  it('renders biography section with timeline', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/Leadership Excellence/i)).toBeInTheDocument()
    expect(screen.getByText(/Sustainability Advocate/i)).toBeInTheDocument()
    expect(screen.getByText(/Educational Visionary/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Green Generation TV/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Thought Leadership/i).length).toBeGreaterThan(0)
  })

  it('renders Green Generation TV section with focus areas', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/Our Focus Areas/i)).toBeInTheDocument()
    expect(screen.getByText('Conscious Living')).toBeInTheDocument()
    expect(screen.getByText('Emotional Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Ethical Governance')).toBeInTheDocument()
    expect(screen.getByText('Financial Clarity')).toBeInTheDocument()
    expect(screen.getByText('Practical Application')).toBeInTheDocument()
    expect(screen.getAllByText('Thought Leadership').length).toBeGreaterThan(0)
  })

  it('renders CTA section with three cards', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getAllByText(/SEETHARAMAN SCHOOL OF SUSTAINABLE DEVELOPMENT/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/PUBLISHED WORKS & THOUGHT LEADERSHIP/i)).toBeInTheDocument()
    expect(screen.getByText(/CONNECT WITH US/i)).toBeInTheDocument()
  })

  it('has external links that open in new tabs', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const learnMoreButtons = screen.getAllByText(/LEARN MORE/i)
    expect(learnMoreButtons.length).toBeGreaterThan(0)
    
    // Check that external links have correct attributes
    const externalLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('target') === '_blank'
    )
    expect(externalLinks.length).toBeGreaterThan(0)
  })

  it('renders contact section with all contact information', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getByText(/greengenerationtvofficial@gmail.com/i)).toBeInTheDocument()
    expect(screen.getByText(/\+91 75502 22600/i)).toBeInTheDocument()
    expect(screen.getByText(/Chennai/i)).toBeInTheDocument()
    expect(screen.getAllByText(/greengen.tv/i).length).toBeGreaterThan(0)
  })

  it('renders footer with social media links', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    
    const socialLinks = within(footer).getAllByRole('link')
    expect(socialLinks.length).toBeGreaterThanOrEqual(4)
  })

  it('calls onNavigate when home link is clicked', async () => {
    const user = userEvent.setup()
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const homeLinks = screen.getAllByText(/Green Generation TV/i)
    // Click the logo
    await user.click(homeLinks[0])
    
    expect(mockOnNavigate).toHaveBeenCalledWith('home')
  })

  it('has active About Us nav link', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const aboutLinks = screen.getAllByText('About Us')
    // Should have one in nav and one in footer, at least one should be active
    const activeLink = aboutLinks.find(link => link.classList.contains('active'))
    expect(activeLink).toBeDefined()
  })

  it('navigates to home when Home nav link is clicked', async () => {
    const user = userEvent.setup()
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const homeNavLinks = screen.getAllByText('Home')
    // Click the first one (in the header nav)
    await user.click(homeNavLinks[0])
    
    expect(mockOnNavigate).toHaveBeenCalledWith('home')
  })

  it('renders mission statement correctly', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/Transforming Learning into Living/i)).toBeInTheDocument()
    expect(screen.getByText(/empowering a generation defined not by age, but by awareness/i)).toBeInTheDocument()
  })

  it('displays bio intro with correct quote formatting', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/A globally respected banker, author, and thought leader/i)).toBeInTheDocument()
  })

  it('has correct contact link for email', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const emailLink = screen.getByRole('link', { name: /greengenerationtvofficial@gmail.com/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:greengenerationtvofficial@gmail.com')
  })

  it('has correct contact link for phone', () => {
    render(<AboutUs onNavigate={mockOnNavigate} />)
    
    const phoneLink = screen.getByRole('link', { name: /\+91 75502 22600/i })
    expect(phoneLink).toHaveAttribute('href', 'tel:+917550222600')
  })

  it('observes elements for intersection animations', () => {
    const { container } = render(<AboutUs onNavigate={mockOnNavigate} />)
    
    // Check that the component renders animated elements
    const animatedElements = container.querySelectorAll('.stat-box, .cta-card')
    expect(animatedElements.length).toBeGreaterThan(0)
  })
})
