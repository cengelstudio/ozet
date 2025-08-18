import { forwardRef, PropsWithoutRef } from "react"
import { useField, useFormikContext, ErrorMessage } from "formik"

export interface LabeledTextFieldProps extends PropsWithoutRef<React.JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number"
  outerProps?: PropsWithoutRef<React.JSX.IntrinsicElements["div"]>
  /** Optional icon to show before the input */
  icon?: React.ReactNode
}

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({ name, label, outerProps, icon, ...props }, ref) => {
    const [input, meta] = useField(name)
    const { isSubmitting } = useFormikContext()
    const hasError = meta.touched && meta.error

    return (
      <div {...outerProps} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {icon}
              </div>
            </div>
          )}
          <input
            {...input}
            disabled={isSubmitting}
            {...props}
            ref={ref}
            className={`
              block w-full px-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              text-sm transition-all duration-200
              ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}
              ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}
              ${icon ? 'pl-10' : ''}
            `}
          />
        </div>

        <ErrorMessage name={name}>
          {(msg) => (
            <div role="alert" className="flex items-center space-x-1 text-sm text-red-600">
              <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{msg}</span>
            </div>
          )}
        </ErrorMessage>
      </div>
    )
  }
)

LabeledTextField.displayName = "LabeledTextField"

export default LabeledTextField
