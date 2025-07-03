import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion Request - WhatsApp AI Assistant',
  description: 'Request deletion of your personal data from WhatsApp AI Assistant platform',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Deletion Request</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request Data Deletion</h2>
              <p className="text-gray-700 mb-4">
                We respect your privacy and provide multiple ways to request deletion of your personal data from our WhatsApp AI Assistant platform. You can request deletion of your data through any of the following methods:
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Email Request</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Send us an email with your deletion request:</h3>
                <ul className="text-blue-800 space-y-2">
                  <li><strong>Email:</strong> orionarmentp@gmail.com</li>
                  <li><strong>Subject:</strong> Data Deletion Request - WhatsApp AI</li>
                  <li><strong>Include:</strong> Your WhatsApp phone number and business name (if applicable)</li>
                  <li><strong>Response Time:</strong> Within 30 days</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Self-Service Deletion</h2>
              <p className="text-gray-700 mb-4">
                If you have an active account, you can delete your data directly through our platform:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Log in to your WhatsApp AI Assistant dashboard</li>
                <li>Go to Settings → Account Settings</li>
                <li>Click "Delete Account" at the bottom of the page</li>
                <li>Follow the confirmation steps</li>
                <li>Your data will be permanently deleted within 30 days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. WhatsApp Message Deletion</h2>
              <p className="text-gray-700 mb-4">
                To delete WhatsApp conversation data specifically:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Send a message to any WhatsApp Business number using our service with the text: <code className="bg-gray-100 px-2 py-1 rounded">"DELETE MY DATA"</code></li>
                <li>You will receive a confirmation message with next steps</li>
                <li>Your conversation history will be deleted within 7 days</li>
                <li>You can also block the business number to stop all data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Data We Delete</h2>
              <p className="text-gray-700 mb-4">
                When you request data deletion, we will permanently remove:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Email, business name, contact details</li>
                <li><strong>WhatsApp Data:</strong> Phone numbers, message content, conversation history</li>
                <li><strong>Usage Data:</strong> Analytics, logs, and system interaction data</li>
                <li><strong>AI Training Data:</strong> Any data used to improve our AI responses</li>
                <li><strong>Preferences:</strong> Settings, configurations, and personalization data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention Exceptions</h2>
              <p className="text-gray-700 mb-4">
                Some data may be retained for legal or business purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Legal Compliance:</strong> Data required by law to be retained</li>
                <li><strong>Security:</strong> Fraud prevention and security incident records</li>
                <li><strong>Financial Records:</strong> Payment and billing information for tax purposes</li>
                <li><strong>Aggregated Data:</strong> Anonymous, non-personally identifiable analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verification Process</h2>
              <p className="text-gray-700 mb-4">
                To protect your privacy, we verify deletion requests through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Email verification from the registered account email</li>
                <li>WhatsApp number verification for message-based requests</li>
                <li>Account authentication for dashboard-based deletions</li>
                <li>Identity verification for high-value business accounts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Deletion Timeline</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Immediate (0-24 hours)</h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Account access disabled</li>
                    <li>• Stop all data processing</li>
                    <li>• Remove from active systems</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Complete (7-30 days)</h3>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• Permanent deletion from databases</li>
                    <li>• Backup system cleanup</li>
                    <li>• Third-party service notification</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-800 mb-4">
                  <strong>For any questions about data deletion or privacy:</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-800"><strong>Email:</strong> orionarmentp@gmail.com</p>
                    <p className="text-gray-800"><strong>Subject:</strong> Data Deletion Request</p>
                    <p className="text-gray-800"><strong>Response Time:</strong> Within 30 days</p>
                  </div>
                  <div>
                    <p className="text-gray-800"><strong>Address:</strong><br />
                    Data Protection Officer<br />
                    WhatsApp AI Assistant<br />
                    55a, Tirupati Town, Behind Govindam Tower<br />
                    Kalwar Road, Jhotwara, Jaipur<br />
                    Jaipur, Rajasthan 302012<br />
                    India</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-12 p-6 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Important Notice</h3>
              <p className="text-red-800 mb-3">
                Data deletion is permanent and cannot be undone. Once deleted, you will need to create a new account to use our services again.
              </p>
              <p className="text-sm text-red-700">
                This page complies with Facebook's Data Deletion Callback requirements for WhatsApp Business API applications.
              </p>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🔒 Privacy Commitment</h3>
              <p className="text-blue-800 mb-3">
                We are committed to protecting your privacy and ensuring your data deletion rights are respected. This process is designed to be simple, transparent, and compliant with all applicable data protection laws.
              </p>
              <p className="text-sm text-blue-700">
                For more information, see our <a href="/privacy-policy" className="underline hover:text-blue-900">Privacy Policy</a> and <a href="/terms-of-service" className="underline hover:text-blue-900">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}