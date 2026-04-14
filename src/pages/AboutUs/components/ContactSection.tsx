import React from 'react'
import { useAppContext } from '../../../context/AppContext'

type ContactItem = {
    icon: string
    title: string
    label: string
    value: React.ReactNode
    action: () => void
    delay: number
}

const ContactSection: React.FC = () => {
    const { darkMode } = useAppContext()
    const contacts: ContactItem[] = [
        {
            icon: 'email',
            title: 'Email',
            label: 'Drop us a line',
            value: (
                <a href="mailto:contact.thegreentv@gmail.com">
                    contact.thegreentv@gmail.com
                </a>
            ),
            action: () =>
            (window.location.href =
                'mailto:contact.thegreentv@gmail.com'),
            delay: 0,
        },
        {
            icon: 'phone',
            title: 'Phone',
            label: 'Give us a call',
            value: <a href="tel:+917550222600">+91 75502 22600</a>,
            action: () => (window.location.href = 'tel:+917550222600'),
            delay: 100,
        },
        {
            icon: 'location_on',
            title: 'Location',
            label: 'Visit our office',
            value: (
                <>
                    145, Abbusali St,Logaiah
                    <br />
                    Colony, Saligramam,
                    <br />
                    Chennai Tamil Nadu 600092
                </>
            ),
            action: () =>
                window.open(
                    'https://maps.google.com/?q=145+Abbusali+St+Logaiah+Colony+Saligramam+Chennai+600092',
                    '_blank'
                ),
            delay: 200,
        },
        {
            icon: 'language',
            title: 'Website',
            label: 'Explore online',
            value: (
                <a href="https://greengen.tv" target="_blank" rel="noopener noreferrer">
                    greengen.tv
                </a>
            ),
            action: () => window.open('https://greengen.tv', '_blank'),
            delay: 300,
        },
    ]

    return (
        <section id="contact"  className={`${darkMode ? 'contact-section-dark' : 'contact-section'}`}>
            <div className="container">
                {/* Header */}
                <header className="section-header-center">
                    <div className="section-badge">
                        <span className="material-icons">contact_support</span>
                        <span>GET IN TOUCH</span>
                    </div>

                    <h2 className="section-heading">Contact Information</h2>
                    <p className="section-description">
                        We’d love to hear from you. Reach out through any of these channels.
                    </p>
                </header>

                {/* Grid */}
                <div className="contact-grid">
                    {contacts.map((item, i) => (
                        <div key={i} className="contact-item" data-aos="fade-up" data-aos-delay={item.delay} onClick={item.action}>
                            <div className="contact-icon">
                                <span className="material-icons">{item.icon}</span>
                            </div>
                            <h2>{item.title}</h2>
                            <p className="contact-label">{item.label}</p>
                            <div className= {item.title != "Location"? "contact-value":"contact-value address-box"}>
                                {item.value}
                            </div>
                            <button className="contact-action" onClick={item.action}>
                                <span className="material-icons">arrow_forward</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ContactSection
