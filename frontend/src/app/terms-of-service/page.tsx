import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - WhatsApp AI Assistant',
  description: 'Terms of Service for WhatsApp AI Customer Support Automation',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using WhatsApp AI Assistant services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please discontinue use of our services immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                WhatsApp AI Assistant provides automated customer support services through WhatsApp Business API integration, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>AI-powered message responses and customer support automation</li>
                <li>WhatsApp Business integration and webhook management</li>
                <li>Conversation management and message routing</li>
                <li>Business communication tools and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. WhatsApp Business API Compliance</h2>
              <p className="text-gray-700 mb-4">
                Our service operates under Meta's WhatsApp Business API terms. By using our service, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Comply with WhatsApp Business API policies and guidelines</li>
                <li>Obtain proper consent for business messaging</li>
                <li>Use automated responses responsibly and transparently</li>
                <li>Respect user opt-out preferences and blocking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">4. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Provide accurate account information and maintain security</li>
                <li>Use services only for legitimate business purposes</li>
                <li>Comply with applicable laws and regulations</li>
                <li>Respect third-party rights and intellectual property</li>
                <li>Monitor and moderate AI-generated responses appropriately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our services for:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Spam, harassment, or unsolicited commercial messages</li>
                <li>Illegal activities or violation of applicable laws</li>
                <li>Impersonation or misrepresentation</li>
                <li>Distribution of malware, viruses, or harmful content</li>
                <li>Interference with service operation or security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Availability</h2>
              <p className="text-gray-700">
                We strive for high availability but cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue services with reasonable notice to users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                Our liability is limited to the maximum extent permitted by law. We are not responsible for indirect, incidental, or consequential damages arising from service use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Email:</strong> support@whatsapp-ai-assistant.com</p>
                <p className="text-gray-800"><strong>Address:</strong> WhatsApp AI Assistant<br />
                Legal Department<br />
                [Your Business Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}