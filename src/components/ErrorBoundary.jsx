import { Component } from 'react';

// Si una sección falla, el resto de la experiencia sigue funcionando.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="wrap" style={{ padding: '64px var(--gutter)' }}>
          <div className="error-box" role="alert">
            <strong>{this.props.name ?? 'Esta sección'} no se pudo cargar.</strong>
            <span style={{ color: 'var(--muted)' }}>
              Recarga la página. Si el problema continúa, sigue con las demás secciones.
            </span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
