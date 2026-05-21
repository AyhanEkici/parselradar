import React from 'react';

type Props = {
  children: React.ReactNode;
  routeName?: string;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'Beklenmeyen bir hata olustu',
    };
  }

  componentDidCatch(error: Error) {
    console.error('route_error_boundary', {
      route: this.props.routeName || 'unknown',
      message: error?.message,
      stack: error?.stack,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRecover = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto mt-10 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="text-lg font-semibold">Sayfa yuklenirken bir hata olustu</h2>
          <p className="mt-2 text-sm">
            Rota: {this.props.routeName || '-'}
          </p>
          <p className="mt-1 text-sm">{this.state.message}</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleRecover}
              className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm"
            >
              Tekrar dene
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-md bg-red-700 px-3 py-2 text-sm text-white"
            >
              Sayfayi yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
