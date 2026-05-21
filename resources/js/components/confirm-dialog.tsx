import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive' | 'success';
    onConfirm: () => void;
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'destructive',
    onConfirm,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
                <DialogHeader className="space-y-3 border-b border-border/50 px-6 py-5 text-left">
                    <div
                        className={cn(
                            'flex size-11 items-center justify-center rounded-xl',
                            variant === 'destructive'
                                ? 'bg-destructive/10 text-destructive'
                                : variant === 'success'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-primary/10 text-primary',
                        )}
                    >
                        <AlertTriangle className="size-5" />
                    </div>
                    <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 border-t border-border/50 bg-muted/20 px-6 py-4 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={
                            variant === 'destructive'
                                ? 'destructive'
                                : variant === 'success'
                                  ? 'success'
                                  : 'default'
                        }
                        className="rounded-xl"
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
