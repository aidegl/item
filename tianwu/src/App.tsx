import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import CoreAdvantages from './components/CoreAdvantages'
import Services from './components/Services'
import ManagementSystem from './components/ManagementSystem'
import Methodology from './components/Methodology'
import Cases from './components/Cases'
import Publications from './components/Publications'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <CoreAdvantages />
        <Services />
        <ManagementSystem />
        <Methodology />
        <Cases />
        <Publications />
      </main>
      <Footer />
    </div>
  )
}

export default App
