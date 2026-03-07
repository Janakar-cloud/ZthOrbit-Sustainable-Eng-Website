import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AboutUs from '../pages/AboutUs/AboutUs'
import { AppProvider } from '../context/AppContext'

describe('AboutUs Component', () => {
  const mockOnNavigate = vi.fn()

  const renderAboutUs = () =>
    render(
      <AppProvider>
        <AboutUs onNavigate={mockOnNavigate} />
      </AppProvider>,
    )

  beforeEach(() => {
    mockOnNavigate.mockClear()
  })

  it('renders header and contact section', () => {
    renderAboutUs()

    expect(screen.getAllByText(/Green Generation/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Contact Information/i)).toBeInTheDocument()
  })

  it('shows slideshow images of Dr. Seetharaman', () => {
    renderAboutUs()

    const images = screen.getAllByRole('img').filter(img =>
      (img.getAttribute('alt') || '').includes('Seetharaman')
    )
    expect(images.length).toBeGreaterThan(0)
  })

  it('displays biography content', () => {
    renderAboutUs()

    expect(screen.getByText(/Dr\. R\. Seetharaman/i)).toBeInTheDocument()
  })

  it('shows correct contact links', () => {
    renderAboutUs()

    const emailLink = screen.getByRole('link', { name: /greengenerationtvofficial@gmail.com/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:greengenerationtvofficial@gmail.com')

    const phoneLink = screen.getByRole('link', { name: /\+91 75502 22600/i })
    expect(phoneLink).toHaveAttribute('href', 'tel:+917550222600')
  })

  it('navigates home when logo is clicked', async () => {
    const user = userEvent.setup()
    renderAboutUs()

    const logo = screen.getAllByText(/Green Generation/i)[0]
    await user.click(logo)
    expect(mockOnNavigate).toHaveBeenCalledWith('home')
  })
})
