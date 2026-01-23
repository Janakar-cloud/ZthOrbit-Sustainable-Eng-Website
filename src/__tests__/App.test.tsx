import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App Component', () => {
  it('renders HomePage by default', () => {
    render(<App />)
    expect(screen.getByText(/Green Generation/i)).toBeInTheDocument()
    expect(screen.getByText(/Project Genesis/i)).toBeInTheDocument()
  })

  it('navigates to About Us page when About is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Find and click the Watch Now button which navigates to about
    const watchButton = screen.getByRole('button', { name: /Watch Now/i })
    await user.click(watchButton)
    
    // Check if AboutUs page is rendered
    expect(screen.getByText(/EMPOWERING SUSTAINABILITY/i)).toBeInTheDocument()
    expect(screen.getByText(/Dr. R. Seetharaman/i)).toBeInTheDocument()
  })

  it('navigates back to HomePage from About Us', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to About
    const watchButton = screen.getByRole('button', { name: /Watch Now/i })
    await user.click(watchButton)
    
    // Verify we're on About Us page
    expect(screen.getByText(/Dr. R. Seetharaman/i)).toBeInTheDocument()
    
    // Click logo/home link to go back
    const homeLinks = screen.getAllByText(/Green Generation TV/i)
    await user.click(homeLinks[0])
    
    // Check if HomePage is rendered again
    expect(screen.getByText(/Project Genesis/i)).toBeInTheDocument()
  })

  it('maintains correct routing state', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Start on home page
    expect(screen.getByText(/Project Genesis/i)).toBeInTheDocument()
    
    // Navigate to about using sidebar button
    const listenButton = screen.getByRole('button', { name: /Listen Now/i })
    await user.click(listenButton)
    
    // Should be on About Us page
    expect(screen.getByText(/EMPOWERING SUSTAINABILITY/i)).toBeInTheDocument()
    expect(screen.queryByText(/Project Genesis/i)).not.toBeInTheDocument()
  })
})
