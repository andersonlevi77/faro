import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

type ConfirmOptions = {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive' | 'success';
    onConfirm: () => void;
};

type ConfirmState = ConfirmOptions & {
    open: boolean;
};

export function useConfirmDialog() {
    const [state, setState] = useState<ConfirmState | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        setState({ ...options, open: true });
    }, []);

    const close = useCallback(() => {
        setState(null);
    }, []);

    const dialog = state ? (
        <ConfirmDialog
            open={state.open}
            onOpenChange={(open) => {
                if (!open) {
                    close();
                }
            }}
            title={state.title}
            description={state.description}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            variant={state.variant}
            onConfirm={state.onConfirm}
        />
    ) : null;

    return { confirm, dialog };
}
