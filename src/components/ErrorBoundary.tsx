import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Could not clear localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans" dir="auto">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">حدث خطأ أثناء تحميل الصفحة</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                حدث خطأ غير متوقع في التطبيق. نعتذر عن هذا الخلل. يمكنك إعادة تحميل الصفحة لإصلاح المشكلة.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-left overflow-x-auto max-h-32 text-slate-700">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                إعادة تحميل الموقع
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
