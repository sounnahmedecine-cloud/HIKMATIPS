'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center animate-in fade-in duration-500">
                    <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Oups ! Une erreur est survenue.</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Quelque chose s'est mal passé. Nous avons enregistré l'erreur et nous travaillons à la résoudre.
                    </p>

                    <div className="w-full max-w-md bg-muted/50 p-4 rounded-lg mb-8 text-left overflow-auto max-h-48 border border-border">
                        <p className="font-mono text-xs text-red-600 dark:text-red-400 break-words">
                            {this.state.error?.toString()}
                        </p>
                        {this.state.errorInfo && (
                            <pre className="font-mono text-[10px] text-muted-foreground mt-2 overflow-x-auto">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        )}
                    </div>

                    <Button
                        onClick={this.handleReload}
                        className="gap-2"
                        size="lg"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recharger l'application
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
