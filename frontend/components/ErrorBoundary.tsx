import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  handleReload() {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/dashboard';
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Application Error Recovered</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              A temporary interface error occurred ({this.state.error?.message || 'Unexpected state'}). Click below to recover your session.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 shadow-md"
            >
              <RefreshCw size={14} /> Recover &amp; Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}
