// in app/admin-client-component.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom'
import { adminResetPassword } from './actions' // Import the new action

type AcademicTerm = {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
};

// --- Helper: Icon Components ---
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.548 0A48.108 48.108 0 0 1 6.75 5.397m10.5-2.572V3.375c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v2.25" />
  </svg>
);

type UploadResult = {
  successes: string[];
  failures: { email: string; reason: string }[];
};

// --- Client Component ---
export function AdminSettingsClient({ user }: { user: User }) {
  const supabase = createClient();
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Admin Data State ---
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // --- Form State ---
  const [newTermName, setNewTermName] = useState('');
  const [newTermStart, setNewTermStart] = useState('');
  const [newTermEnd, setNewTermEnd] = useState('');

  // --- Bulk Add State ---
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);


  // Fetch data *after* verification
  useEffect(() => {
    if (isVerified) {
      fetchAdminData();
    }
  }, [isVerified, supabase]);

  async function fetchAdminData() {
    setIsLoadingData(true);
    setDataError(null);
    const { data, error } = await supabase.rpc('get_all_academic_terms');
    if (error) {
      setDataError(error.message);
    } else {
      setTerms(data as AcademicTerm[]);
    }
    setIsLoadingData(false);
  }

  // Handle the password verification
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    });

    if (error) {
      setAuthError('Incorrect password. Please try again.');
    } else {
      setIsVerified(true);
    }
    setIsLoading(false);
  };
  
  // --- Form Handlers ---
  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName || !newTermStart || !newTermEnd) {
      setDataError("All fields are required.");
      return;
    }
    setIsLoadingData(true);
    const { error } = await supabase.rpc('create_academic_term', {
      p_term_name: newTermName,
      p_start_date: newTermStart,
      p_end_date: newTermEnd,
    });
    if (error) {
      setDataError(error.message);
    } else {
      setNewTermName('');
      setNewTermStart('');
      setNewTermEnd('');
      fetchAdminData(); // Refresh list
    }
    setIsLoadingData(false);
  };
  
  const handleDeleteTerm = async (termId: string) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    setIsLoadingData(true);
    const { error } = await supabase.rpc('delete_academic_term', { p_term_id: termId });
    if (error) {
      setDataError(error.message);
    } else {
      fetchAdminData(); // Refresh list
    }
    setIsLoadingData(false);
  };

  // --- Bulk Add Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  // *** UPDATED FUNCTION WITH BETTER ERROR HANDLING ***
  const handleBulkAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setUploadError("Please select a CSV file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const fileText = await csvFile.text();
      
      const { data, error } = await supabase.functions.invoke('bulk-create-users', {
        body: fileText,
      });

      if (error) {
        // --- START NEW ERROR HANDLING ---
        // This is the new, more detailed error parsing
        let detailedError = error.message;
        
        // Functions often return error details in `error.context`
        // Let's try to parse it as JSON
        if (error.context) {
          try {
            // Deno functions often return a JSON string in the body
            const errorBody = await error.context.json();
            if (errorBody && errorBody.error) {
              detailedError = errorBody.error;
            }
          } catch(parseError) {
            // Not JSON, just use the generic message
            console.warn("Could not parse function error context:", parseError);
          }
        }
        
        throw new Error(detailedError);
        // --- END NEW ERROR HANDLING ---
      }
      
      // Check for an error *within* a 200 response
      if (data.error) {
         throw new Error(data.error);
      }
      
      setUploadResult(data as UploadResult);

    } catch (error: any) {
      console.error("Full error object from function invoke:", error);
      setUploadError(`Upload failed: ${error.message}`); // This will now show the detailed message
    }

    setIsUploading(false);
  };


  // --- RENDER LOGIC ---

  // 1. Password Prompt
  if (!isVerified) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <div className="flex flex-col items-center">
            <LockIcon />
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Admin Access Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Please re-enter your password to manage site settings.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleVerifyPassword}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={user.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {authError && (
              <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {isLoading ? 'Verifying...' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Verified Admin Panel
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
      
      {dataError && <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md">{dataError}</div>}
      
      {/* --- Academic Terms Manager --- */}
      <AdminSection title="Manage Academic Terms">
        <form onSubmit={handleCreateTerm} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term Name</label>
            <input type="text" placeholder="e.g., Fall 2025" value={newTermName} onChange={e => setNewTermName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input type="date" value={newTermStart} onChange={e => setNewTermStart(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input type="date" value={newTermEnd} onChange={e => setNewTermEnd(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
          </div>
          <button type="submit" disabled={isLoadingData} className="self-end py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
            {isLoadingData ? '...' : 'Add Term'}
          </button>
        </form>
        
        <div className="mt-4 flow-root">
          <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Term Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">End Date</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoadingData && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading...</td></tr>}
                {terms.map((term) => (
                  <tr key={term.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{term.term_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{term.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{term.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDeleteTerm(term.id)} disabled={isLoadingData} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400">
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminSection>

      {/* --- Bulk User Upload --- */}
      <AdminSection title="Bulk User Upload">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a CSV file with columns: `email`, `first_name`, `last_name`.
          The `password` column is optional; if not provided, a secure random password will be generated.
        </p>
        <form className="mt-4 p-6 border dark:border-gray-700 rounded-lg" onSubmit={handleBulkAddSubmit}>
          <label
            htmlFor="file-upload"
            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                {csvFile ? (
                  <span className="font-semibold text-green-600 dark:text-green-400">{csvFile.name}</span>
                ) : (
                  <><span className="font-semibold">Click to upload a .csv file</span></>
                )}
              </p>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>
          
          <button
            type="submit"
            disabled={isUploading || !csvFile}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
          >
            {isUploading ? 'Uploading...' : 'Upload and Create Users'}
          </button>
        </form>

        {/* --- Upload Results --- */}
        {uploadError && (
          <div className="mt-4 p-4 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            <p className="font-bold">Error</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}
        {uploadResult && (
          <div className="mt-4 p-4 text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300 rounded-md">
            <p className="font-bold text-green-600 dark:text-green-400">Upload Complete</p>
            <p className="text-sm">{`Successfully created ${uploadResult.successes.length} users.`}</p>
            {uploadResult.failures.length > 0 && (
              <div className="mt-2">
                <p className="font-bold text-red-600 dark:text-red-400">Failed to create {uploadResult.failures.length} users:</p>
                <ul className="list-disc list-inside text-sm text-red-500 dark:text-red-400">
                  {uploadResult.failures.map((fail, idx) => (
                    <li key={idx}><strong>{fail.email}:</strong> {fail.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </AdminSection>
    </div>
  );
}

// --- Helper: Section Component ---
function AdminSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4 mb-6">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

// 2. ADD THIS COMPONENT for the submit button
function ResetButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
    >
      {pending ? 'Resetting...' : 'Set New Password'}
    </button>
  )
}

// This is your main component
export default function AdminClientComponent({
  // ... (keep your existing props)
}) {
  
  // 3. ADD THIS HOOK for the new form's state
  const [resetState, resetFormAction] = useFormState(adminResetPassword, {
    error: null,
    success: false,
  })

  // ... (keep all your other existing code, hooks, and functions)

  // 4. ADD THE NEW FORM inside your return()
  return (
    <div className="space-y-8">
      {/* ... (Your existing Bulk Create Users form) ... */}
      <div>
        <h3 className="text-xl font-semibold text-white">
          Manual Password Reset
        </h3>
        <form 
          action={resetFormAction} 
          className="mt-4 space-y-4 bg-gray-800 p-6 rounded-lg shadow"
        >
          <div>
            <label 
              htmlFor="userId" 
              className="block text-sm font-medium text-gray-200"
            >
              User ID
            </label>
            <input
              type="text"
              name="userId"
              id="userId"
              required
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-900 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter the user's Auth User ID"
            />
          </div>
          <div>
            <label 
              htmlFor="newPassword" 
              className="block text-sm font-medium text-gray-200"
            >
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              required
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-900 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Min. 6 characters"
            />
          </div>

          <ResetButton />

          {resetState.error && (
            <p className="text-sm text-red-400">{resetState.error}</p>
          )}
          {resetState.success && (
            <p className="text-sm text-green-400">
              Password reset successful!
            </p>
          )}
        </form>
      </div>
    </div>
  )
}