import React from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
  ClickableTile,
  AspectRatio
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import {
  Education,
  Presenter,
  Collaboration,
  Desktop  // Replaced Webinar with Desktop
} from '@carbon/pictograms-react';

const TrainingPage = () => {
  return (
    <div className="training-page">
      {/* Hero Section */}
      <section className="bg-gray-10 py-16">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h1 className="text-5xl font-bold mb-4">Training & Development</h1>
            <p className="text-lg">Empower your workforce with cutting-edge skills and knowledge.</p>
          </Column>
        </Grid>
      </section>

      {/* Training Categories */}
      <section className="my-8">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-4">Our Training Offerings</h2>
          </Column>
          <Column lg={5} md={4} sm={4}>
            <ClickableTile href="#" className="h-full">
              <h3 className="text-2xl mb-2">Technical Skills</h3>
              <p>Programming, cloud computing, and more.</p>
            </ClickableTile>
          </Column>
          <Column lg={5} md={4} sm={4}>
            <ClickableTile href="#" className="h-full">
              <h3 className="text-2xl mb-2">Soft Skills</h3>
              <p>Leadership, communication, and teamwork.</p>
            </ClickableTile>
          </Column>
          <Column lg={5} md={4} sm={4}>
            <ClickableTile href="#" className="h-full">
              <h3 className="text-2xl mb-2">Certification Prep</h3>
              <p>Get ready for industry-standard certifications.</p>
            </ClickableTile>
          </Column>
        </Grid>
      </section>

      {/* Featured Course */}
      <section className="bg-gray-10 py-8">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <AspectRatio ratio="16x9">
              <Desktop size={96} /> {/* Changed from Webinar to Desktop */}
            </AspectRatio>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <h2 className="text-3xl font-semibold mb-4">Featured Course</h2>
            <h3 className="text-2xl mb-2">Advanced Cloud Computing</h3>
            <p className="mb-4">Master the latest cloud technologies and best practices in this comprehensive course.</p>
            <Button renderIcon={ArrowRight}>Enroll Now</Button>
          </Column>
        </Grid>
      </section>

      {/* Training Approach */}
      <section className="my-8">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="text-3xl font-semibold mb-4">Our Training Approach</h2>
          </Column>
          <Column lg={5} md={4} sm={4}>
            <Tile>
              <h3 className="text-2xl mb-2">Hands-on Learning</h3>
              <p>Practice real-world scenarios in our state-of-the-art labs.</p>
            </Tile>
          </Column>
          <Column lg={5} md={4} sm={4}>
            <Tile>
              <h3 className="text-2xl mb-2">Expert Instructors</h3>
              <p>Learn from industry professionals with years of experience.</p>
            </Tile>
          </Column>
          <Column lg={5} md={4} sm={4}>
            <Tile>
              <h3 className="text-2xl mb-2">Flexible Schedule</h3>
              <p>Choose from in-person, online, or hybrid training options.</p>
            </Tile>
          </Column>
        </Grid>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-10 py-8">
        <Grid>
          <Column lg={{span: 8, offset: 4}} md={{span: 6, offset: 1}} sm={4}>
            <h2 className="text-3xl font-semibold mb-4">Ready to Level Up Your Skills?</h2>
            <p className="mb-4">Browse our course catalog or contact us for custom training solutions.</p>
            <Button>View Course Catalog</Button>
          </Column>
        </Grid>
      </section>
    </div>
  );
};

export default TrainingPage;