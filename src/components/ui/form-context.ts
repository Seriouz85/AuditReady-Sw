import * as React from "react";
import {
  FormProvider,
  useFormContext,
  type FieldValues,
  type FieldPath,
} from "react-hook-form";

// Re-export FormProvider for convenience
export const Form = FormProvider;

// Type definitions (can potentially be moved to a types file if large)
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

// Custom hook for form field context
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext<FieldValues>();

  const fieldName = fieldContext.name as FieldPath<FieldValues>;
  const fieldState = getFieldState(fieldName, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }
  
  const { id } = itemContext;

  return {
    id,
    name: fieldName,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}; 