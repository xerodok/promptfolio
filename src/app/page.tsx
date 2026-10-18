import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Leadership } from "@/components/sections/Leadership";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Stats } from "@/components/sections/Stats";
import { getAbout, getResume, getSite } from "@/lib/resume/load";

export default function HomePage() {
  const resume = getResume();
  const site = getSite();
  return (
    <>
      <Nav name={resume.basics.name} image={resume.basics.image} nav={site.nav} />
      <main className="flex-1">
        <Hero resume={resume} site={site} about={getAbout()} />
        <Stats stats={site.stats} />
        {site.leadership && <Leadership block={site.leadership} />}
        {site.highlights.length > 0 && (
          <Highlights items={site.highlights} heading={site.sections.highlights} />
        )}
        {resume.work.length > 0 && (
          <Experience work={resume.work} heading={site.sections.experience} logos={site.logos} />
        )}
        {resume.skills.length > 0 && (
          <Skills skills={resume.skills} heading={site.sections.skills} />
        )}
        {resume.projects.length > 0 && (
          <Projects projects={resume.projects} heading={site.sections.projects} />
        )}
        {(resume.education.length > 0 || resume.certificates.length > 0) && (
          <Education
            education={resume.education}
            certificates={resume.certificates}
            heading={site.sections.education}
          />
        )}
        <Contact basics={resume.basics} heading={site.sections.contact} />
      </main>
      <Footer resume={resume} />
    </>
  );
}
