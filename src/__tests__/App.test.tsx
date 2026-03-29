import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { AppProvider } from '../context/AppContext'

vi.mock('../hooks/podcast', () => ({
  podcastEpisode: () => ({
    podcast: [
      {
        id: 1,
        title: 'Mock Podcast',
        description: 'Mock description',
        audioFile: 'mock.mp3',
        image: '',
        duration: '10:00',
        category: 'general',
        publishDate: '2024-01-01',
        commentsEnabled: true,
        comments: [],
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('App Component', () => {
  const renderApp = () =>
    render(
      <AppProvider>
        <App />
      </AppProvider>,
    )

  beforeEach(() => {
    // reset DOM between tests handled by RTL
  })

  it('renders HomePage by default', () => {
    renderApp()
    expect(screen.getByText(/EMPOWERING SUSTAINABILITY/i)).toBeInTheDocument()
  })

  it('navigates to About Us when nav link is clicked', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getAllByText('About Us')[0])

    expect(screen.getByText(/Dr. R. Seetharaman/i)).toBeInTheDocument()
    expect(screen.getByText(/Contact Information/i)).toBeInTheDocument()
  })

  it('navigates to Podcasts and back home via logo', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getAllByText('Podcast')[0])
    expect(screen.getByText(/Green Generation Podcast/i)).toBeInTheDocument()

    await user.click(screen.getAllByText(/Green Generation/i)[0])
    expect(screen.getByText(/EMPOWERING SUSTAINABILITY/i)).toBeInTheDocument()
  })
})
