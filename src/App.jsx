import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import LabTour from './components/LabTour.jsx';
import ScrollStorytelling from './components/ScrollStorytelling.jsx';
import Laboratory from './components/Laboratory.jsx';
import FinalResults from './components/FinalResults.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ProgressProvider } from './hooks/useProgress.jsx';
import { useReveal } from './hooks/useMotion.js';

export default function App() {
  useReveal();
  return (
    <ProgressProvider>
      <a className="skip-link" href="#laboratorio">
        Saltar al laboratorio
      </a>
      <Navbar />
      <main>
        <Hero />
        <ErrorBoundary name="El recorrido del laboratorio">
          <LabTour />
        </ErrorBoundary>
        <ErrorBoundary name="La secuencia">
          <ScrollStorytelling />
        </ErrorBoundary>
        <Laboratory />
        <FinalResults />
      </main>
      <footer className="footer">
        <div className="wrap">
          <img src={`${import.meta.env.BASE_URL}assets/brand/uao-h-crema.png`} alt="Universidad Autónoma de Occidente" className="footer__logo" />
          <span>Física Mecánica · Universidad Autónoma de Occidente</span>
          <span>Física en movimiento · Módulo 01: Cinemática</span>
        </div>
      </footer>
    </ProgressProvider>
  );
}
