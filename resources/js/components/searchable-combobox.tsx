import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { matchesSearchQuery } from '@/lib/search-text';

export type ComboboxOption<T extends string | number = number> = {
    value: T;
    label: string;
    description?: string;
    searchText: string;
};

type SearchableComboboxProps<T extends string | number> = {
    id?: string;
    value: T | '';
    onValueChange: (value: T | '') => void;
    options: ComboboxOption<T>[];
    placeholder?: string;
    emptyMessage?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

export function SearchableCombobox<T extends string | number>({
    id: idProp,
    value,
    onValueChange,
    options,
    placeholder = 'Buscar…',
    emptyMessage = 'Sin coincidencias',
    required = false,
    disabled = false,
    className,
}: SearchableComboboxProps<T>) {
    const autoId = useId();
    const inputId = idProp ?? autoId;
    const listboxId = `${inputId}-listbox`;

    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selected = useMemo(
        () => options.find((option) => option.value === value),
        [options, value],
    );

    const filteredOptions = useMemo(() => {
        const matching = options.filter((option) => matchesSearchQuery(option.searchText, query));

        return matching.sort((a, b) => a.label.localeCompare(b.label, 'es'));
    }, [options, query]);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    const openList = () => {
        if (disabled) {
            return;
        }

        setOpen(true);
        setQuery('');
    };

    const selectOption = (option: ComboboxOption<T>) => {
        onValueChange(option.value);
        setQuery('');
        setOpen(false);
    };

    const clearSelection = () => {
        onValueChange('' as T | '');
        setQuery('');
        setOpen(true);
    };

    const inputValue = open ? query : (selected?.label ?? '');

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div className="relative">
                <Input
                    id={inputId}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    autoComplete="off"
                    required={required && value === ''}
                    disabled={disabled}
                    placeholder={placeholder}
                    value={inputValue}
                    className="pr-16"
                    onFocus={openList}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setOpen(true);

                        if (value !== '') {
                            onValueChange('' as T | '');
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            setOpen(false);
                            setQuery('');
                        }
                    }}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2">
                    {value !== '' && !disabled && (
                        <button
                            type="button"
                            tabIndex={-1}
                            className="pointer-events-auto rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Limpiar selección"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={clearSelection}
                        >
                            <X className="size-4" />
                        </button>
                    )}
                    <ChevronDown
                        className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
                    />
                </div>
            </div>

            {open && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border/60 bg-popover py-1 text-popover-foreground shadow-md"
                >
                    {filteredOptions.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</li>
                    ) : (
                        filteredOptions.map((option) => {
                            const isSelected = option.value === value;

                            return (
                                <li key={String(option.value)} role="option" aria-selected={isSelected}>
                                    <button
                                        type="button"
                                        className={cn(
                                            'flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/80',
                                            isSelected && 'bg-primary/5',
                                        )}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selectOption(option)}
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-medium leading-snug">{option.label}</span>
                                            {option.description && (
                                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            )}
                                        </span>
                                        {isSelected && <Check className="mt-0.5 size-4 shrink-0 text-primary" />}
                                    </button>
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}
