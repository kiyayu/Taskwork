import * as React from "react"
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface Option {
  label: React.ReactNode
  value: string
}

export interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label?: React.ReactNode
  placeholder?: string
  options: Option[]
  description?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  placeholder = "Select an option",
  options,
  description,
  disabled,
  className,
}: FormSelectProps<TFieldValues, TName>) {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const messageId = `${id}-message`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error

        return (
          <div className={cn("space-y-2", className)}>
            {label && (
              <Label htmlFor={id} className={cn(error && "text-destructive")}>
                {label}
              </Label>
            )}

            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={!!error}
                aria-describedby={
                  [description && descriptionId, error && messageId]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {description && (
              <p
                id={descriptionId}
                className="text-[0.8rem] text-muted-foreground"
              >
                {description}
              </p>
            )}

            {error?.message && (
              <p
                id={messageId}
                className="text-[0.8rem] font-medium text-destructive"
              >
                {error.message}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}