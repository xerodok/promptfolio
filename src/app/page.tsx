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
        <Highlights items={site.highlights} />
        <Experience work={resume.work} />
        <Skills skills={resume.skills} />
        <Projects projects={resume.projects} />
        <Education education={resume.education} certificates={resume.certificates} />
        <Contact basics={resume.basics} />
      </main>
      <Footer resume={resume} />
    </>
  );
}
