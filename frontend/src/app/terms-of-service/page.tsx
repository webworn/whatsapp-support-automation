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
                WhatsApp AI Assistant is a <strong>Business-to-Business (B2B) Software as a Service (SaaS)</strong> platform that provides professional customer support automation services exclusively for legitimate businesses through official WhatsApp Business API integration, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>AI-powered message responses and customer support automation</li>
                <li>Official WhatsApp Business API integration and webhook management</li>
                <li>Professional conversation management and message routing</li>
                <li>Business communication tools and analytics dashboard</li>
                <li>Enterprise-grade customer support workflow automation</li>
              </ul>
              <p className="text-gray-700 font-medium">
                <strong>Business Use Only:</strong> This service is exclusively designed for verified businesses and commercial entities. Personal or individual use is strictly prohibited.
              </p>
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Business Account Requirements</h2>
              <p className="text-gray-700 mb-4">
                By using our service, you certify that you are a legitimate business entity and agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Maintain a verified WhatsApp Business account in good standing</li>
                <li>Provide accurate business registration and contact information</li>
                <li>Use services exclusively for legitimate business purposes</li>
                <li>Comply with WhatsApp Business API terms and Meta policies</li>
                <li>Obtain proper customer consent for automated messaging</li>
                <li>Maintain business licensing and regulatory compliance in your jurisdiction</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Provide accurate account information and maintain security</li>
                <li>Use services only for legitimate business purposes</li>
                <li>Comply with applicable laws and regulations</li>
                <li>Respect third-party rights and intellectual property</li>
                <li>Monitor and moderate AI-generated responses appropriately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">In accordance with WhatsApp Business API policies and our compliance requirements, you may not use our services for:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Personal Use:</strong> Individual or non-business messaging (business accounts only)</li>
                <li><strong>Spam or Unsolicited Messages:</strong> Messages without proper user consent</li>
                <li><strong>Prohibited Content:</strong> Adult content, gambling, cryptocurrency promotion, or illegal products</li>
                <li><strong>Misleading Services:</strong> False claims, fraud, or deceptive business practices</li>
                <li><strong>Security Violations:</strong> Malware distribution, system interference, or unauthorized access</li>
                <li><strong>Policy Violations:</strong> Any activity that violates WhatsApp Business API or Meta policies</li>
                <li><strong>Data Misuse:</strong> Improper collection, use, or sharing of customer information</li>
              </ul>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Account Termination</h3>
                <p className="text-red-800 text-sm">
                  Violation of these prohibited uses may result in immediate account suspension or termination, both from our platform and WhatsApp Business API.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Level Agreement</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">7.1 Service Availability</h3>
                  <p className="text-gray-700 mb-3">
                    We strive to maintain 99.9% uptime for our services. While we cannot guarantee uninterrupted service, we provide:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 mb-4">
                    <li>24/7 system monitoring and automated failover</li>
                    <li>Regular maintenance windows with advance notice</li>
                    <li>Real-time status updates through our platform</li>
                    <li>Service credit policies for significant outages</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">7.2 WhatsApp Business API Dependencies</h3>
                  <p className="text-gray-700">
                    Our service depends on Meta's WhatsApp Business API. Service disruptions may occur due to WhatsApp platform changes, maintenance, or policy updates beyond our control.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Billing and Subscriptions</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">8.1 Subscription Terms</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Subscription fees are charged monthly or annually as selected</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>Free trial periods do not require payment information</li>
                  <li>Usage-based charges apply for message volumes exceeding plan limits</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">8.2 Payment and Billing</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Payment is due in advance for each billing period</li>
                  <li>Automatic renewal unless cancelled before the next billing cycle</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                  <li>Late payments may result in service suspension</li>
                </ul>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">9.1 Platform Rights</h3>
                <p className="text-gray-700 mb-4">
                  We retain all rights, title, and interest in our platform, AI technology, and related intellectual property. You receive a limited license to use our services according to these terms.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">9.2 Customer Content</h3>
                <p className="text-gray-700">
                  You retain ownership of your business content and customer data. You grant us a limited license to process this content solely to provide our services and improve AI response quality.
                </p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Account Termination</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">10.1 Termination by You</h3>
                <p className="text-gray-700 mb-4">
                  You may terminate your account at any time through your dashboard or by contacting support. Upon termination, your data will be deleted according to our data retention policy.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">10.2 Termination by Us</h3>
                <p className="text-gray-700 mb-4">
                  We may terminate accounts for:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Violation of these terms or WhatsApp Business API policies</li>
                  <li>Non-payment of fees or fraudulent payment activity</li>
                  <li>Abuse of our platform or security violations</li>
                  <li>Legal requirements or regulatory compliance issues</li>
                </ul>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Our liability is limited to the maximum extent permitted by law. Specifically:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We are not responsible for indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim</li>
                <li>We are not liable for WhatsApp platform changes or third-party service disruptions</li>
                <li>Business decisions based on AI responses remain your responsibility</li>
              </ul>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ AI Service Disclaimer</h3>
                <p className="text-yellow-800 text-sm">
                  Our AI responses are generated automatically and should be reviewed for accuracy. We recommend monitoring AI interactions and maintaining human oversight for complex customer issues.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law and Disputes</h2>
              <p className="text-gray-700 mb-4">
                These terms are governed by the laws of India. Any disputes shall be resolved through binding arbitration in Jaipur, Rajasthan, India, except for intellectual property claims which may be pursued in courts of competent jurisdiction.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these terms periodically. Material changes will be communicated via email and platform notifications at least 30 days before taking effect. Continued use of our services constitutes acceptance of updated terms.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Email:</strong> orionarmentp@gmail.com</p>
                <p className="text-gray-800"><strong>Email Subject:</strong> Terms of Service Inquiry</p>
                <p className="text-gray-800"><strong>Address:</strong> WhatsApp AI Assistant<br />
                Legal Department<br />
                55a, Tirupati Town, Behind Govindam Tower<br />
                Kalwar Road, Jhotwara, Jaipur<br />
                Jaipur, Rajasthan 302012<br />
                India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}