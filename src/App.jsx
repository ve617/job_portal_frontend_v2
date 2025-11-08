import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ResumeAnalysisSection from './components/ResumeAnalysisSection.jsx';
import JobDetails from './components/JobDetails.jsx';
import EnhancedApplicationForm from './components/EnhancedApplicationForm.jsx';
import Footer from './components/Footer.jsx';
import './styles/App.css';

// Sample job data
const jobData = {
  title: "Senior Full Stack Developer",
  role: "Software Engineering",
  department: "Technology",
  location: "Banglore,India",
  type: "Full-time",
  salary: " ₹80,000 - ₹120,000 per year",
  experience: "0-1 years",
  description: "We are seeking a talented Senior Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies and frameworks including React.js, Node.js, JavaScript, TypeScript, Docker, AWS, MongoDB, PostgreSQL, Git, CI/CD pipelines, and testing frameworks. This is an exciting opportunity to work with cutting-edge technologies and contribute to innovative projects that impact millions of users worldwide.",
  requirements: [
    "Proficiency in React.js, Node.js, and modern JavaScript",
    "Experience with frontend frameworks (Next.js, Vue, or Angular)",
    "Strong backend development with Node.js and Express/NestJS",
    "Database experience (MongoDB, PostgreSQL, or MySQL)",
    "RESTful API design and development",
    "Experience with state management (Redux/Context API)",
    "Cloud platforms (AWS/Azure/GCP) and containerization (Docker)",
    "Version control with Git and CI/CD pipelines",
    "Knowledge of web security and performance optimization"
  ],
  responsibilities: [
    "Design and develop scalable web applications",
    "Collaborate with cross-functional teams to define and implement new features",
    "Write clean, maintainable, and efficient code",
    "Participate in code reviews and maintain coding standards",
    "Troubleshoot and debug applications",
    "Stay up-to-date with emerging technologies and industry trends"
  ],
  benefits: [
    "Competitive salary and equity package",
    "Comprehensive health, dental, and vision insurance",
    "Flexible work arrangements and remote options",
    "Professional development budget",
    "Unlimited PTO policy",
    "State-of-the-art equipment and workspace"
  ]
};

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'resume-analysis', 'job-details', 'apply'];
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      <Header activeSection={activeSection} scrollToSection={scrollToSection} />
      <main>
        <Hero job={jobData} scrollToSection={scrollToSection} />
        <ResumeAnalysisSection 
          jobDescription={jobData.description}
          jobTitle={jobData.title}
        />
        <JobDetails job={jobData} />
        <EnhancedApplicationForm 
          jobTitle={jobData.title} 
          jobDescription={jobData.description}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
