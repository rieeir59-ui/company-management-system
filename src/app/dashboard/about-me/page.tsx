
'use client';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';

export default function AboutMePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
       <Card className="bg-card/90 mb-8">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-center text-primary">About Me</CardTitle>
            </CardHeader>
        </Card>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-left-10 duration-1000">
              <h1 className="text-4xl md:text-5xl font-headline text-primary">ISBAH HASSAN</h1>
              <div className="text-base md:text-lg text-muted-foreground space-y-4">
                  <p>
                    Isbah Hassan & Associates (Pvt.) Ltd. offers elegant and innovative architecture and interior design solutions to meet the most discerning requirements.
                  </p>
                  <p>
                    Whether it’s a high-rise, a housing development, an amusement park or a campus, our holistic approach ensures that buildings are stylish, practical, comfortable and in perfect harmony with their indigenous surroundings.
                  </p>
              </div>
            </div>
            <div className="relative h-80 md:h-[450px] w-full rounded-lg overflow-hidden shadow-2xl animate-in fade-in-50 slide-in-from-right-10 duration-1000">
                <Image
                  src="https://www.isbahhassan.com/upload/about1.jpg"
                  alt="About Isbah Hassan & Associates"
                  layout="fill"
                  objectFit="cover"
                  priority
                />
            </div>
          </div>
            
          <Card className="w-full max-w-5xl mx-auto overflow-hidden shadow-lg mt-12 md:mt-24 z-10 relative bg-accent/20">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-xl font-headline">Our Philosophy</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left">
                    With over 25 years of experience working on complex projects ranging from office buildings and interiors to industrial constructions and private residences, we have developed a sophisticated and thorough approach towards design, technical development, code analysis, and document production that seamlessly blends functionality with aesthetics. Mindful of developments that influence 21st century architecture, we opt for stylised, space efficient and financially viable buildings fuelled by a unique vision using state of the art technological advancements and innovative materials while cultivating respect for the environment. 
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-xl font-headline">Our Approach</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left">
                     We believe in functional elegance and responsiveness to a site’s physical surroundings keeping the client’s needs and requirements in perspective within the approved budget. This formula has transpired into various successful developments that now line an emerging modern landscape in Pakistan, and we are proud to be part of this renaissance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-xl font-headline">Collaboration</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left space-y-4">
                    <p>
                      We believe that all projects benefit from a process involving the client, architect, builder and various specialists in an informative collaboration, and that successful projects are made possible through the management of all participants involved. We encourage this collaboration and act as a guide through the process of design and construction so that each project benefits from the participation and strengths of each team member.
                    </p>
                    <p>
                      We work with an array of the finest associates and specialists across Pakistan for project management, structural engineering, electrical engineering, public health engineering, geo- technical surveying, bill of quantities, HVAC, landscaping, environmental protection, energy design, security, and financial advising. Internationally, our associates include Shankland Cox Ltd. [UK and UAE], Tessa Kennedy Design Ltd. [UK], Jimmy Lim Design [Malaysia], Leigh & Orange Ltd. [Hong Kong], and Curtain Wall Consultants [China].
                    </p>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                  <AccordionTrigger className="text-xl font-headline">Our Founder</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left space-y-4">
                    <p>
                      Ms. Isbah Hassan is a veteran in the field of architecture and interior design and has been in practice since 1995. A leading architect in South Asia, she has designed projects in multiple spheres and on multiple scales, frequently earning her finalist status in countrywide competitions for government projects.
                    </p>
                    <p>
                      Since its inception, Isbah Hassan and Associates has earned a reputation for combining innovative design practices with unique vision and exemplary function. The firm’s projects have included amusement parks, banks, boutiques, cafés, campuses, cinemas, government buildings, high-rises, low-rises, offices, places of worship, residences, resort development and shopping malls.
                    </p>
                    <p>
                      Ms. Hassan began her career at Fujikawa & Johnson in Chicago, working on high-rise buildings in Texas, following her Bachelor’s in Architecture (Honours) from the Illinois Institute of Technology and Minor in Oil Painting and Charcoal Drawing at the Art Institute of Chicago. In Pakistan, she worked at Wasif Ali & Associates and at Arshad and Shahid Abdulla Architects in Karachi and Lahore prior to launching Isbah Hassan and Associates.
                    </p>
                    <p>
                      Ms. Hassan was awarded UBL’s ‘Achievement of Excellence’ Award as the architect and interior designer of the bank’s iconic regional headquarters at One Jail Road, Lahore, in 2018.
                    </p>
                    <div className="font-semibold">
                      <p>Ms. Isbah Hassan</p>
                      <p>CEO and Chief Architect</p>
                      <p>Isbah Hassan and Associates</p>
                    </div>
                    <p>
                      She has been an honourary juror for the National College of Arts, attended advanced placement seminars on ‘Sustainable Communities in the 21 st Century,’ ‘Health Building and Materials,’ and ‘Project Management for Architectural Firms,’ participated at the UAEIA Conference in Chicago, and was nominated for the Eisenhower Exchange Fellowship. She has also served on numerous boards including the Punjab Municipal Development Corporation Program for uplifting rural municipalities (sponsored by the World Bank), New Murree (Patriata City Project), and the Lahore American School. She is registered with the Pakistan Council of Architects and Town Planners, the Institute of Architects-Pakistan, the Lahore Development Authority, the Defence Housing Authority, the Capital Development Authority and the Lahore Cantonment Board.
                    </p>
                     <p>
                      Always one to spearhead innovation, Ms. Hassan brought in a team of specialists from Sri Lanka and Scandinavia for a proposed joint venture to revitalize tourism in Khyber- Pakhtunkhwa. Her designs were selected for the Prime Minister’s Housing Scheme on Multan Road in Lahore, the Parliament’s new administrative block on Constitution Avenue in Islamabad, the Aga Khan Secondary School Complex in Karimabad and Karachi. She has been the architect for significant federal and provincial housing schemes including the Punjab Government Servant Society Mohlanwal and the Prime Minister’s Housing Scheme.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
