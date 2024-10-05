import React from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
  ClickableTile,
  Accordion,
  AccordionItem,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell
} from '@carbon/react';
import { ArrowRight, Location, Time, Rocket } from '@carbon/icons-react';
import { 
  Collaboration,
  Growth,
  Idea,
  Education
} from '@carbon/pictograms-react';

const ValueCard = ({ title, description, icon: Icon }) => (
  <Tile className="h-full">
    <Icon className="mb-4" />
    <h3 className="text-2xl font-semibold mb-2">{title}</h3>
    <p>{description}</p>
  </Tile>
);

const JobListing = ({ title, location, type, description }) => (
  <ClickableTile className="mb-4">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <div className="flex items-center mb-2">
      <Location className="mr-2" /> <span className="mr-4">{location}</span>
      <Time className="mr-2" /> <span>{type}</span>
    </div>
    <p className="mb-2">{description}</p>
    <Button kind="ghost" renderIcon={ArrowRight}>Learn More</Button>
  </ClickableTile>
);

const CareersPage = () => {
  return (
    <div className="careers-page">
      {/* Hero Section */}
      <section className="bg-gray-10 py-12">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h1 className="text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl mb-6">Be part of a team that's shaping the future of technology</p>
            <Button renderIcon={ArrowRight}>View Open Positions</Button>
          </Column>
        </Grid>
      </section>

      {/* Company Values Section */}
      <section className="my-12">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-8">Our Values</h2>
          </Column>
          <Column lg={4} md={4} sm={4}>
            <ValueCard 
              title="Innovation" 
              description="We challenge the status quo and embrace new ideas"
              icon={Idea}
            />
          </Column>
          <Column lg={4} md={4} sm={4}>
            <ValueCard 
              title="Collaboration" 
              description="We believe in the power of teamwork and diverse perspectives"
              icon={Collaboration}
            />
          </Column>
          <Column lg={4} md={4} sm={4}>
            <ValueCard 
              title="Growth" 
              description="We foster personal and professional development"
              icon={Growth}
            />
          </Column>
          <Column lg={4} md={4} sm={4}>
            <ValueCard 
              title="Learning"
              description="We create an enjoyable and educational work environment"
              icon={Education}
            />
          </Column>
        </Grid>
      </section>

      {/* Open Positions Section */}
      <section className="bg-gray-10 py-12">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-8">Open Positions</h2>
          </Column>
          <Column lg={16} md={8} sm={4}>
            <JobListing 
              title="Senior Software Engineer"
              location="Johannesburg, South Africa"
              type="Full-time"
              description="We're looking for an experienced software engineer to lead development on our cloud-based solutions."
            />
            <JobListing 
              title="UX Designer"
              location="Remote"
              type="Full-time"
              description="Join our design team to create intuitive and engaging user experiences for our products."
            />
            <JobListing 
              title="Data Scientist"
              location="Cape Town, South Africa"
              type="Full-time"
              description="Help us turn data into actionable insights and drive decision-making across the organization."
            />
          </Column>
        </Grid>
      </section>

      {/* Benefits Section */}
      <section className="my-12">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-8">Why Work With Us</h2>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <StructuredListWrapper>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Benefit</StructuredListCell>
                  <StructuredListCell head>Description</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                <StructuredListRow>
                  <StructuredListCell>Flexible Work</StructuredListCell>
                  <StructuredListCell>Work from home options and flexible hours</StructuredListCell>
                </StructuredListRow>
                <StructuredListRow>
                  <StructuredListCell>Learning Budget</StructuredListCell>
                  <StructuredListCell>Annual budget for courses and conferences</StructuredListCell>
                </StructuredListRow>
                <StructuredListRow>
                  <StructuredListCell>Health Coverage</StructuredListCell>
                  <StructuredListCell>Comprehensive health insurance for you and your family</StructuredListCell>
                </StructuredListRow>
              </StructuredListBody>
            </StructuredListWrapper>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <h3 className="text-2xl font-semibold mb-4">Our Hiring Process</h3>
            <Accordion>
              <AccordionItem title="1. Application Review">We carefully review all applications to find the best fit for the role.</AccordionItem>
              <AccordionItem title="2. Initial Interview">A chat with our HR team to get to know you better.</AccordionItem>
              <AccordionItem title="3. Technical Assessment">A task or interview related to the specific role.</AccordionItem>
              <AccordionItem title="4. Final Interview">Meet with the team you'll be working with.</AccordionItem>
              <AccordionItem title="5. Offer">If it's a match, we'll extend an offer to join our team!</AccordionItem>
            </Accordion>
          </Column>
        </Grid>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-10 py-12">
        <Grid>
          <Column lg={{span: 10, offset: 3}} md={{span: 6, offset: 1}} sm={4}>
            <div className="text-center">
              <Rocket size={48} className="mb-4 mx-auto" />
              <h2 className="text-3xl font-semibold mb-4">Ready to Launch Your Career with Us?</h2>
              <p className="mb-6">Explore our open positions and find your perfect role.</p>
              <Button renderIcon={ArrowRight}>View All Jobs</Button>
            </div>
          </Column>
        </Grid>
      </section>
    </div>
  );
};

export default CareersPage;