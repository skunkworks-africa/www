import React from 'react';
import { Phone, Mail, Clock, MessageSquare, HelpCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SupportPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-lg text-gray-600">Get the help you need, when you need it</p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <div className="text-center">
            <Phone className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Phone Support</h2>
            <p className="text-gray-600 mb-4">Available during business hours</p>
            <a href="tel:+27833807950" className="text-blue-600 hover:text-blue-800 font-medium">
              +27 87 164 5398
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Email Support</h2>
            <p className="text-gray-600 mb-4">24/7 response within 24 hours</p>
            <a href="mailto:raydo@skunkworks.africa" className="text-blue-600 hover:text-blue-800 font-medium">
              support@skunkworks.africa
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Business Hours</h2>
            <p className="text-gray-600">Monday - Friday</p>
            <p className="text-gray-600">8:00 AM - 5:00 PM SAST</p>
          </div>
        </Card>
      </div>

      {/* Support Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2" />
              Technical Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Hardware and Software Solutions</li>
              <li>Cloud Services Support</li>
              <li>Network Infrastructure</li>
              <li>System Maintenance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2" />
              Learning Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Course Access Issues</li>
              <li>Training Program Support</li>
              <li>LMS Technical Help</li>
              <li>Educational Resources</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What are your support hours?</h3>
              <p className="text-gray-600">Our support team is available Monday through Friday, 8:00 AM to 5:00 PM SAST.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What's your typical response time?</h3>
              <p className="text-gray-600">We aim to respond to all inquiries within 24 hours during business days.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer emergency support?</h3>
              <p className="text-gray-600">Yes, for critical issues we provide emergency support outside regular business hours.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            26 Second Avenue<br />
            GERMISTON, Gauteng, 1401<br />
            South Africa
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
