import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 40, textAlign: "center", color: "#A0A0A0" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: "#FFF", marginBottom: 8 }}>Something went wrong</h3>
          <p style={{ marginBottom: 20, fontSize: 13 }}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            className="neon-btn"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
