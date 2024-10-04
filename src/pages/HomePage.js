import React from 'react';
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  ClickableTile,
  AspectRatio,
  Link
} from '@carbon/react';
import { ArrowRight, Launch } from '@carbon/icons-react';
import {
  Application,
  CloudComputing,
  Collaboration,
  Education // Replaced CloudApplication with Education
} from '@carbon/pictograms-react';

const ServiceCard = ({ title, description, icon: Icon, link }) => (
  <ClickableTile href={link} className="h-full">
    <AspectRatio ratio="1x1">
      <div className="flex flex-col justify-center items-center h-full p-4">
        <Icon className="mb-4" width={48} height={48} />
        <h3 className="text-2xl font-semibold mb-2 text-center">{title}</h3>
        <p className="text-center">{description}</p>
      </div>
    </AspectRatio>
  </ClickableTile>
);

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="bg-gray-10 py-16">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h1 className="text-6xl font-bold mb-6">Welcome to Skunkworks</h1>
            <p className="text-2xl mb-8">Innovative Technology, Education Solutions, and Placement Services for Tomorrow's Businesses.</p>
            <Button size="lg" renderIcon={ArrowRight}>Learn More</Button>
          </Column>
        </Grid>
      </section>

      {/* Services Section */}
      <section className="my-16">
        <Grid narrow>
          <Column lg={16} md={8} sm={4} className="mb-8">
            <h2 className="text-4xl font-semibold">Our Services</h2>
          </Column>
          {[
            {
              title: "Software Development",
              description: "Custom software solutions to streamline your business processes",
              icon: Application,
              link: "/services/software-development"
            },
            {
              title: "Cloud Services",
              description: "Scalable and secure cloud infrastructure management",
              icon: CloudComputing,
              link: "/services/cloud-services"
            },
            {
              title: "IT Consulting",
              description: "Expert advice to align your IT strategy with business goals",
              icon: Collaboration,
              link: "/services/it-consulting"
            },
            {
              title: "Education Solutions",
              description: "Comprehensive training and development programs",
              icon: Education, // Changed from CloudApplication to Education
              link: "/services/education-solutions"
            }
          ].map((service, index) => (
            <Column key={index} lg={8} md={4} sm={4} className="mb-4">
              <ServiceCard {...service} />
            </Column>
          ))}
        </Grid>
      </section>

      {/* About Us Section */}
      <section className="bg-gray-10 py-16">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-4xl font-semibold mb-6">About Us</h2>
            <p className="text-xl mb-6">Skunkworks is a leading technology solutions provider, committed to delivering innovative and tailored solutions to businesses across various industries. Our team of experts brings years of experience and cutting-edge knowledge to every project.</p>
            <Button kind="tertiary" size="lg" renderIcon={ArrowRight}>Learn More About Us</Button>
          </Column>
        </Grid>
      </section>

      {/* Call to Action */}
      <section className="my-16">
        <Grid>
          <Column lg={{span: 12, offset: 2}} md={{span: 6, offset: 1}} sm={4}>
            <Tile className="text-center p-8">
              <h2 className="text-4xl font-semibold mb-6">Ready to Transform Your Business?</h2>
              <p className="text-xl mb-8">Let's discuss how our services can help you achieve your goals and stay ahead in the rapidly evolving tech landscape.</p>
              <Button size="lg" renderIcon={ArrowRight}>Contact Us</Button>
            </Tile>
          </Column>
        </Grid>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <Grid narrow>
          <Column lg={4} md={2} sm={4}>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </Column>
          <Column lg={4} md={2} sm={4}>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p>Email: info@skunkworks.com</p>
            <p>Phone: (123) 456-7890</p>
            <p>Address: 123 Tech Street, Innovation City, 12345</p>
          </Column>
          <Column lg={4} md={2} sm={4}>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <Link href="https://linkedin.com" target="_blank" renderIcon={Launch}>LinkedIn</Link>
            <Link href="https://twitter.com" target="_blank" renderIcon={Launch}>Twitter</Link>
            <Link href="https://facebook.com" target="_blank" renderIcon={Launch}>Facebook</Link>
          </Column>
        </Grid>
      </footer>
    </div>
  );
};

export default HomePage;