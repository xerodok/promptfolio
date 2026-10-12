import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Stats } from "@/components/sections/Stats";
import { getResume, getSite } from "@/lib/resume/load";

export default function HomePage() {
  const resume = getResume();
  const site = getSite();
  return (
    <>
      <Nav name={resume.basics.name} nav={site.nav} />
      <main className="flex-1">
        <Hero resume={resume} site={site} />
        <Stats stats={site.stats} />
        {site.highlights.length > 0 && <Highlights items={site.highlights} />}
        {resume.work.length > 0 && <Experience work={resume.work} />}
        {resume.skills.length > 0 && <Skills skills={resume.skills} />}
        {resume.projects.length > 0 && <Projects projects={resume.projects} />}
        {(resume.education.length > 0 || resume.certificates.length > 0) && (
          <Education education={resume.education} certificates={resume.certificates} />
        )}
        <Contact basics={resume.basics} />
      </main>
      <Footer resume={resume} />
    </>
  );
}
