import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - WhatsApp AI Assistant',
  description: 'Privacy Policy for WhatsApp AI Customer Support Automation',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                WhatsApp AI Assistant ("we," "our," or "us") operates a <strong>Business-to-Business (B2B) Software as a Service (SaaS)</strong> platform that provides professional customer support automation exclusively for verified business entities through official WhatsApp Business API integration. This Privacy Policy explains how we collect, use, disclose, and safeguard information when legitimate businesses use our enterprise customer support automation services.
              </p>
              <p className="text-gray-700 mb-4">
                This policy specifically covers our WhatsApp Business API messaging services, AI-powered automated responses, and professional customer support automation features designed for business use only.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🏢 Business Use Only</h3>
                <p className="text-blue-800 text-sm">
                  Our services are exclusively designed for verified businesses and commercial entities. We do not provide services for personal or individual use. All users must maintain active WhatsApp Business accounts in compliance with Meta's Business API terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 WhatsApp Business Data</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Phone numbers of message senders and recipients</li>
                <li>WhatsApp message content (text, media, documents)</li>
                <li>Message timestamps and delivery status</li>
                <li>WhatsApp Business account information</li>
                <li>Contact information shared through WhatsApp messages</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Account Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Business name and contact details</li>
                <li>Email address and authentication credentials</li>
                <li>WhatsApp Business phone number</li>
                <li>Account preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Automatically Collected Data</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>API usage logs and system performance data</li>
                <li>Error logs and debugging information</li>
                <li>Service usage analytics and metrics</li>
                <li>IP addresses and technical identifiers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 WhatsApp Business Services</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Process and respond to WhatsApp messages automatically</li>
                <li>Generate AI-powered customer support responses</li>
                <li>Maintain conversation history and context</li>
                <li>Route messages to appropriate support channels</li>
                <li>Provide automated business responses and information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Service Operation</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Authenticate and manage user accounts</li>
                <li>Maintain and improve service functionality</li>
                <li>Monitor system performance and reliability</li>
                <li>Provide customer support and technical assistance</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 AI Processing</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Analyze message content to generate appropriate responses</li>
                <li>Improve AI response quality and accuracy</li>
                <li>Understand customer intent and context</li>
                <li>Personalize automated interactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Third-Party Services</h3>
              <p className="text-gray-700 mb-4">
                We share information with the following third-party services to operate our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Meta/Facebook:</strong> WhatsApp Business API integration for message processing</li>
                <li><strong>OpenRouter/AI Providers:</strong> Message content for AI response generation</li>
                <li><strong>Railway:</strong> Cloud hosting and infrastructure services</li>
                <li><strong>Database Providers:</strong> Secure data storage and management</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose information when required by law, court order, or to protect the rights, safety, and security of our users and services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. WhatsApp Business API Compliance</h2>
              
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-900 mb-2">✅ Official WhatsApp Business API Integration</h3>
                <p className="text-green-800 text-sm">
                  We are an authorized WhatsApp Business API service provider operating in full compliance with Meta's Business Platform policies and WhatsApp Commerce Policy requirements.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Business Message Consent</h3>
              <p className="text-gray-700 mb-4">
                Our platform only processes messages from customers who have initiated contact with verified business accounts. By sending messages to WhatsApp Business numbers integrated with our service, customers consent to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Professional automated message processing and AI-generated business responses</li>
                <li>Secure message storage for business conversation continuity and customer service</li>
                <li>Business-appropriate analysis of message content for accurate response generation</li>
                <li>Integration with legitimate business customer support and service systems</li>
                <li>Processing by verified business entities for customer service purposes only</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Legitimate Business Messaging</h3>
              <p className="text-gray-700 mb-4">
                Our service operates exclusively under WhatsApp's Business API terms for verified business entities, which authorize:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Professional automated responses to legitimate customer inquiries</li>
                <li>Business-initiated conversations with proper customer consent and opt-in</li>
                <li>Customer support and service communications for existing business relationships</li>
                <li>Transaction confirmations, appointment notifications, and order updates</li>
                <li>Business information and FAQ responses within WhatsApp Commerce Policy guidelines</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Prohibited Business Activities</h3>
              <p className="text-gray-700 mb-4">
                In compliance with WhatsApp Business policies, our platform strictly prohibits:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Spam, unsolicited marketing, or cold outreach messaging</li>
                <li>Personal or non-business use of the platform</li>
                <li>Promotion of prohibited products (adult content, gambling, cryptocurrency)</li>
                <li>Misleading or fraudulent business communications</li>
                <li>Any messaging that violates WhatsApp Commerce Policy or Business API terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security and Retention</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Security Measures</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee access restrictions and training</li>
                <li>Industry-standard security protocols</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Data Retention</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>WhatsApp Messages:</strong> Retained for 90 days or as configured by business</li>
                <li><strong>Account Information:</strong> Retained while account is active</li>
                <li><strong>Analytics Data:</strong> Aggregated data retained for service improvement</li>
                <li><strong>Legal Compliance:</strong> Data retained as required by applicable laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Access and Control</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Access your personal information and conversation history</li>
                <li>Update or correct your account information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of automated message processing</li>
                <li>Request data portability in machine-readable format</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 WhatsApp Controls</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Block or unblock business numbers through WhatsApp</li>
                <li>Report inappropriate automated messages</li>
                <li>Control message delivery preferences</li>
                <li>Request human agent escalation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Our services operate globally and may transfer data across international borders. We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Standard contractual clauses with service providers</li>
                <li>Compliance with applicable data protection regulations</li>
                <li>Adequate protection measures for cross-border transfers</li>
                <li>Regular reviews of international transfer mechanisms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify users of material changes through:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Email notifications to registered users</li>
                <li>In-app notifications and dashboard alerts</li>
                <li>Updates to this page with revised effective date</li>
                <li>WhatsApp Business message notifications where appropriate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800"><strong>Email:</strong> orionarmentp@gmail.com</p>
                <p className="text-gray-800"><strong>Email Subject:</strong> Privacy Policy Inquiry</p>
                <p className="text-gray-800"><strong>Address:</strong> Data Protection Officer<br />
                WhatsApp AI Assistant<br />
                Privacy Department<br />
                55a, Tirupati Town, Behind Govindam Tower<br />
                Kalwar Road, Jhotwara, Jaipur<br />
                Jaipur, Rajasthan 302012<br />
                India</p>
                <p className="text-gray-800"><strong>Response Time:</strong> We respond to privacy inquiries within 30 days</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Regulatory Compliance</h2>
              <p className="text-gray-700 mb-4">
                As a professional B2B SaaS platform, our service maintains comprehensive compliance with applicable business and data protection regulations, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li><strong>GDPR:</strong> European Union General Data Protection Regulation (full compliance)</li>
                <li><strong>CCPA:</strong> California Consumer Privacy Act (comprehensive data rights)</li>
                <li><strong>WhatsApp Business API Policy:</strong> Meta's official Business Platform terms and Commerce Policy</li>
                <li><strong>SOC 2 Type II Ready:</strong> Security and availability controls framework</li>
                <li><strong>ISO 27001 Ready:</strong> Information security management standards</li>
                <li><strong>Business Registration:</strong> Verified business entity with proper licensing</li>
              </ul>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📋 Business Verification Requirements</h3>
                <p className="text-gray-700 text-sm mb-2">
                  All platform users must maintain:
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Valid business registration and licensing</li>
                  <li>• Verified WhatsApp Business account in good standing</li>
                  <li>• Compliance with local business regulations</li>
                  <li>• Adherence to professional customer service standards</li>
                </ul>
              </div>
            </section>

            <div className="mt-12 space-y-4">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🛡️ Data Subject Rights</h3>
                <p className="text-blue-800 mb-3">
                  If you are located in the EU, UK, or California, you have additional rights regarding your personal data. 
                  Contact us using the information above to exercise these rights.
                </p>
                <p className="text-sm text-blue-700">
                  This privacy policy is designed to comply with WhatsApp Business API requirements and applicable data protection laws for professional business services.
                </p>
              </div>
              
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">🏢 Business Platform Compliance</h3>
                <p className="text-green-800 mb-3">
                  This privacy policy specifically addresses the requirements for B2B SaaS platforms operating with WhatsApp Business API integration. We maintain the highest standards of business data protection and professional service delivery.
                </p>
                <p className="text-sm text-green-700">
                  Our platform is designed exclusively for legitimate business entities and maintains full compliance with Meta's WhatsApp Business Platform policies and Commerce Policy requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}