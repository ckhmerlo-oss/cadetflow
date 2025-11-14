// in app/update-password/page.tsx
'use client'

// Import the server action
import { updatePassword } from './actions' 
// Import React hooks for server-driven forms
import { useFormState, useFormStatus } from 'react-dom' 
import { useRouter } from 'next/navigation'
import { useEffect } from 'react' // We still need useEffect for the redirect

// This is the initial state for our form
const initialState = {
  error: null,
  success: false,
}

// A separate component to show "Saving..." while the server action is pending
// This gets the 'pending' status from the <form>
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
    >
      {pending ? 'Saving...' : 'Set New Password'}
    </button>
  )
}

export default function UpdatePasswordPage() {
  const router = useRouter()
  
  // This hook connects your component to the Server Action
  // 'state' will be the { error, success } object returned from the action
  // 'formAction' is what we pass to the <form>
  const [state, formAction] = useFormState(updatePassword, initialState)

  // This effect runs *after* the server action completes
  // and the component re-renders with the new 'state'
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/login?message=password_updated')
      }, 3000)
      
      // Cleanup the timer if the component unmounts
      return () => clearTimeout(timer)
    }
  }, [state.success, router]) // It only runs when state.success changes

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-950 dark:text-white">
            Set Your New Password
          </h2>
        </div>
        
        {state.success ? (
          // This success message is now driven by the server action's response
          <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-md">
            <p className="font-bold">Success!</p>
            <p>Your password has been updated. You will be redirected to the login page shortly.</p>
          </div>
        ) : (
          // This <form> element now uses the 'action' prop.
          // This is what tells Next.js to run the Server Action.
          <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg" action={formAction}>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password" // 'name' prop is required for server actions
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password" // 'name' prop is required
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Display error from the server action state */}
            {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

            <div>
              {/* The submit button now lives inside the form */}
              <SubmitButton />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}