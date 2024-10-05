import React from 'react';
import { 
  Grid, 
  Column, 
  Tile, 
  ClickableTile,
  AspectRatio,
  Button
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
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

const ServicesPage = () => {
  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="bg-gray-10 py-16">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h1 className="text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-2xl mb-8">Innovative solutions tailored to your business needs</p>
          </Column>
        </Grid>
      </section>

      {/* Services Section */}
      <section className="my-16">
        <Grid narrow>
          <Column lg={16} md={8} sm={4} className="mb-8">
            <h2 className="text-4xl font-semibold">What We Offer</h2>
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

      {/* Call to Action */}
      <section className="bg-gray-10 py-16">
        <Grid>
          <Column lg={{span: 12, offset: 2}} md={{span: 6, offset: 1}} sm={4}>
            <Tile className="text-center p-8">
              <h2 className="text-4xl font-semibold mb-6">Ready to Transform Your Business?</h2>
              <p className="text-xl mb-8">Let's discuss how our services can help you achieve your goals.</p>
              <Button size="lg" renderIcon={ArrowRight}>Contact Us</Button>
            </Tile>
          </Column>
        </Grid>
      </section>
    </div>
  );
};

export default ServicesPage;