'use client';

import { forwardRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'اختر...',
      error,
      helperText,
      disabled = false,
      required = false,
      className,
    },
    ref
  ) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">
            {label}
            {required && <span className="text-danger-500 mr-1">*</span>}
          </label>
        )}
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          <div className="relative">
            <Listbox.Button
              ref={ref}
              className={cn(
                'relative w-full cursor-pointer rounded-lg bg-white py-2.5 ps-4 pe-10 text-start',
                'border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                error
                  ? 'border-danger-500 focus:ring-danger-500'
                  : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500',
                disabled && 'bg-secondary-50 cursor-not-allowed'
              )}
            >
              <span className={cn('block truncate', !selectedOption && 'text-secondary-400')}>
                {selectedOption?.label || placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2">
                <ChevronUpDownIcon className="h-5 w-5 text-secondary-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={cn(
                  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1',
                  'shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                  'text-base sm:text-sm'
                )}
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={({ active, disabled: optDisabled }) =>
                      cn(
                        'relative cursor-pointer select-none py-2 ps-10 pe-4',
                        active && 'bg-primary-50 text-primary-900',
                        optDisabled && 'cursor-not-allowed opacity-50'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn(
                            'block truncate',
                            selected ? 'font-medium' : 'font-normal'
                          )}
                        >
                          {option.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-primary-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
