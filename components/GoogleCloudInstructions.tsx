
import React from 'react';
import { XIcon } from './icons/XIcon';

interface GoogleCloudInstructionsProps {
  onDismiss: () => void;
}

export const GoogleCloudInstructions: React.FC<GoogleCloudInstructionsProps> = ({ onDismiss }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-2 border-red-500 rounded-lg p-6 md:p-8 m-4 text-white animate-fade-in-down shadow-2xl max-w-4xl mx-auto relative">
      <button onClick={onDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Dismiss">
        <XIcon />
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-red-300">Action Required: Complete Your Google Cloud Project Setup</h1>
      <p className="mt-4 text-base md:text-lg text-red-200">
        I'm very sorry for the continued trouble. The reason you are stuck on the "Overview" page and cannot find the "Publish App" button is because Google is blocking it until two mandatory project checkup steps are completed.
      </p>
      <p className="mt-2 text-base md:text-lg text-red-200">
        Your screenshot shows these two specific errors under <strong className="font-bold text-white">"Developer identity"</strong>. Let's fix them.
      </p>

      <div className="mt-6 space-y-6">
        <div className="bg-gray-800/50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-orange-300">1. Billing Account Verification</h2>
          <p className="mt-2 text-gray-300">
            <strong>Error:</strong> "Your app does not have an associated Cloud billing account."
          </p>
          <p className="mt-2 text-gray-300">
            <strong>Why it's required:</strong> Google uses a billing account to verify your identity and prevent abuse. For basic OAuth usage like this, <strong className="text-white">you will not be charged</strong>. It is purely for verification.
          </p>
          <p className="mt-2 text-gray-300">
            <strong>How to fix:</strong>
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 pl-4 text-gray-300">
            <li>Go to the <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">Google Cloud Billing Page</a>.</li>
            <li>Select your project if prompted.</li>
            <li>Click "Link a billing account" or "Manage billing accounts".</li>
            <li>Follow the steps to create a new billing account, which will likely require a credit card for identity verification.</li>
          </ol>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-orange-300">2. Project Contacts</h2>
          <p className="mt-2 text-gray-300">
            <strong>Error:</strong> "Your app does not have the right number of project owners/editors."
          </p>
          <p className="mt-2 text-gray-300">
            <strong>Why it's required:</strong> For security and account recovery, Google requires at least one additional contact with "Owner" or "Editor" permissions on the project.
          </p>
          <p className="mt-2 text-gray-300">
            <strong>How to fix:</strong>
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 pl-4 text-gray-300">
            <li>Go to the <a href="https://console.cloud.google.com/iam-admin/iam" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">IAM & Admin Page</a>.</li>
            <li>Make sure your project is selected at the top.</li>
            <li>Click the "+ GRANT ACCESS" button at the top of the page.</li>
            <li>In the "New principals" field, add another one of your Google email addresses or a trusted colleague's email.</li>
            <li>In the "Assign roles" dropdown, select a role like <strong className="text-white">"Owner"</strong> or <strong className="text-white">"Editor"</strong>.</li>
            <li>Click "Save".</li>
          </ol>
        </div>
      </div>

      <div className="mt-8 bg-green-900/50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-green-300">What Happens Next?</h2>
        <p className="mt-2 text-green-200">
          After you complete <strong className="font-bold">both</strong> of these steps, please allow a few minutes for Google's systems to update. Then, go back to the <strong className="font-bold">"OAuth consent screen"</strong> page. The "Project checkup" warnings should be gone, and the page should now show the main summary with the <strong className="font-bold text-white bg-green-600 px-2 py-1 rounded">"PUBLISH APP"</strong> button.
        </p>
      </div>
    </div>
  );
};
