import React, { useState } from 'react';
import GoogleMap from '../components/GoogleMap';
import {
  Grid,
  Column,
  TextInput,
  Select,
  SelectItem,
  TextArea,
  Button,
  Form,
  Stack,
} from '@carbon/react';
import { 
  Location, 
  Phone, 
  Email,
  SendAlt 
} from '@carbon/icons-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="bg-gray-10 py-12">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl">We're here to help. Reach out to us with any questions or inquiries.</p>
          </Column>
        </Grid>
      </section>

      {/* Contact Form and Information */}
      <section className="py-12">
        <Grid>
          {/* Contact Form */}
          <Column lg={10} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-6">Send Us a Message</h2>
            <Form onSubmit={handleSubmit}>
              <Stack gap={7}>
                <TextInput
                  id="name"
                  name="name"
                  labelText="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextInput
                  id="email"
                  name="email"
                  labelText="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  id="subject"
                  name="subject"
                  labelText="Subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <SelectItem value="general" text="General Inquiry" />
                  <SelectItem value="support" text="Technical Support" />
                  <SelectItem value="sales" text="Sales" />
                  <SelectItem value="other" text="Other" />
                </Select>
                <TextArea
                  id="message"
                  name="message"
                  labelText="Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
                <Button type="submit" renderIcon={SendAlt}>Send Message</Button>
              </Stack>
            </Form>
          </Column>

          {/* Contact Information */}
          <Column lg={6} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-6">Contact Information</h2>
            <Stack gap={5}>
              <div className="flex items-center">
                <Location size={24} className="mr-4" />
                <p>26 Second Avenue, Germiston, Gauteng. South Africa 1401</p>
              </div>
              <div className="flex items-center">
                <Phone size={24} className="mr-4" />
                <p>(+27) 87 164 5398</p>
              </div>
              <div className="flex items-center">
                <Email size={24} className="mr-4" />
                <p>info@skunkworks.africa</p>
              </div>
            </Stack>

            {/* Office Hours */}
            <h3 className="text-2xl font-semibold mt-8 mb-4">Office Hours</h3>
            <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
            <p>Saturday - Sunday: Closed</p>

            {/* Map */}
            <h3 className="text-2xl font-semibold mt-8 mb-4">Find Us</h3>
            <div className="map-container" style={{height: '300px', background: '#f4f4f4'}}>
            <GoogleMap />
              <p className="text-center pt-8">Map placeholder</p>
            </div>
          </Column>
        </Grid>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-10 py-12">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
            <Stack gap={5}>
              <div>
                <h3 className="text-xl font-semibold mb-2">What are your typical response times?</h3>
                <p>We aim to respond to all inquiries within 24 business hours.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Do you offer on-site consultations?</h3>
                <p>Yes, we provide on-site consultations for enterprise clients. Please contact our sales team for more information.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">How can I report a technical issue?</h3>
                <p>For technical support, please use the contact form above and select "Technical Support" as the subject. Our support team will get back to you promptly.</p>
              </div>
            </Stack>
          </Column>
        </Grid>
      </section>
    </div>
  );
};

export default ContactPage;