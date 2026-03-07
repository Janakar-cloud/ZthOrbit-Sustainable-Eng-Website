import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../pages/HomePage/HomePage'
import { AppProvider } from '../context/AppContext'

describe('HomePage Component', () => {
  const mockOnNavigate = vi.fn()

  const renderHome = () =>
    render(
      <AppProvider>
        <HomePage onNavigate={mockOnNavigate} />
      </AppProvider>,
    )

  beforeEach(() => {
    mockOnNavigate.mockClear()
  })

  it('renders hero content', () => {
    renderHome()

    expect(screen.getByText(/EMPOWERING SUSTAINABILITY/i)).toBeInTheDocument()
    expect(screen.getByText(/Through Conscious Leadership and Media/i)).toBeInTheDocument()
  })

  it('renders Our Work cards with descriptions', () => {
    renderHome()

    expect(screen.getByText('Our Work')).toBeInTheDocument()
    expect(screen.getAllByText(/Check out our newest visual creations/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Tune in to our most popular series/i).length).toBeGreaterThan(0)
  })

  it('shows Live TV, Podcasts, and Articles sections', () => {
    renderHome()

    expect(screen.getAllByText('Live TV').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Podcasts').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Articles').length).toBeGreaterThan(0)
  })

  it('calls onNavigate when clicking a non-play work card', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByText('Featured Podcasts'))
    expect(mockOnNavigate).toHaveBeenCalledWith('podcast')
  })

  it('has footer with social links', () => {
    renderHome()

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()

    const socialLinks = within(footer).getAllByRole('link')
    expect(socialLinks.length).toBeGreaterThan(0)
  })
})
