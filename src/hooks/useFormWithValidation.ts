import { useForm, type UseFormProps, type FieldValues, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";

type UseFormWithValidationProps<TFieldValues extends FieldValues> = Omit<UseFormProps<TFieldValues>, "resolver"> & {
  schema: ZodSchema<TFieldValues>;
};

export function useFormWithValidation<TFieldValues extends FieldValues>({
  schema,
  ...formOptions
}: UseFormWithValidationProps<TFieldValues>): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    ...formOptions,
    resolver: zodResolver(schema),
  });
}
