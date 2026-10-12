(function (root) {
    "use strict";

    // This is the editable, public-safe seed for the portfolio. Credentials and
    // other deployment secrets intentionally do not belong in this data file.
    var content = {
        schemaVersion: 1,
        appearance: {
            theme: "midnight",
            headingFont: "Public Sans",
            bodyFont: "Inter",
            accentColor: "#93c5fd",
            radius: "sharp",
            animation: "subtle",
            heroLayout: "split",
            sectionVisibility: { about: true, projects: true, skills: true, experience: true, education: true, certifications: true, awards: true, contact: true },
            navigationVisibility: { about: true, projects: true, skills: true, experience: true, education: true, certifications: true, awards: true, contact: true }
        },
        resume: {
            fileName: "",
            fileSize: 0,
            fileType: "",
            dataUrl: "",
            downloadLabel: "Download resume",
            downloadUrl: ""
        },
        site: {
            name: "Yashraj Rathor",
            title: "Yashraj Rathor | Data Engineer & ML Portfolio",
            description: "Data engineering, artificial intelligence, machine learning, and software projects by Yashraj Rathor.",
            location: "Navi Mumbai, India",
            canonicalUrl: ""
        },
        hero: {
            eyebrow: "Current Focus",
            title: "Building",
            highlight: "Data • AI • Software Systems",
            description: "Final-year Information Technology student at SIES Graduate School of Technology with a 9.3/10 CGPA, experienced in Python, SQL, data engineering, ETL, cloud technologies, AI, and machine learning. Building practical data, AI, and software solutions through hands-on projects.",
            primaryCtaLabel: "View Projects",
            primaryCtaHref: "#projects",
            secondaryCtaLabel: "Contact Me",
            secondaryCtaHref: "#contact",
            focusLabel: "Current Focus",
            focusValue: "Data • AI • Software",
            focusSkills: "Python · SQL · ETL · Cloud · AI · ML",
            basedInLabel: "Based In",
            basedIn: "Navi Mumbai, India"
        },
        about: {
            eyebrow: "About Me",
            title: "Building Across",
            highlight: "Data, AI & Software",
            paragraphs: [
                "I'm a final-year Information Technology student at SIES Graduate School of Technology with a 9.3/10 CGPA, focused on building practical solutions across software development, data engineering, artificial intelligence, machine learning, and cloud technologies.",
                "I work with Python, SQL, ETL, PySpark, Azure, Databricks, RAG, LangGraph, and LangChain. My projects include semantic learning systems, cloud-based data pipelines, and multi-agent AI applications.",
                "I enjoy transforming technical concepts into practical systems and continuously expanding my skills across data, AI, and software engineering."
            ],
            image: "asset/yashraj sketch.png",
            imageAlt: "Tech infrastructure abstract",
            stats: [
                { value: "9.3", label: "CGPA / 10" },
                { value: "3", label: "Projects" },
                { value: "3", label: "Certifications" }
            ]
        },
        projects: [
            {
                title: "Memora Semantic Learning System",
                category: "AI & RAG",
                date: "Sep 2025 – Jun 2026",
                description: "Developed an AI-powered semantic learning assistant using Retrieval-Augmented Generation. Built an intelligent document retrieval pipeline for educational content, enabling semantic search and contextual responses using vector embeddings.",
                problem: "",
                implementation: "",
                results: "",
                tags: ["RAG", "Semantic Search", "Vector Embeddings", "Document Retrieval", "AI"],
                image: "",
                url: "",
                githubUrl: ""
            },
            {
                title: "Spotify End-to-End Data Engineering Pipeline",
                category: "Data Eng",
                date: "Jul 2026 – Present",
                description: "Developed a parameterized, metadata-driven ingestion pipeline using Azure Data Factory to move data into Azure Data Lake Storage Gen2. Implemented incremental loading and backfilling, and structured data using a Bronze/Silver/Gold medallion architecture with Azure Databricks and PySpark.",
                problem: "",
                implementation: "",
                results: "",
                tags: ["Azure Data Factory", "Azure Data Lake Storage Gen2", "Azure Databricks", "PySpark", "ETL", "Incremental Loading", "Backfilling", "Medallion Architecture"],
                image: "",
                url: "",
                githubUrl: ""
            },
            {
                title: "Agentic AI Data Analyst & ETL Automation Agent",
                category: "Agentic AI",
                date: "Sep 2026",
                description: "Developed a multi-agent architecture with specialized SQL and ETL agents and an LLM-based router for natural-language data requests. Built a 7-stage SQL workflow covering question curation, schema discovery, SQL generation, AI safety validation, PostgreSQL execution, and response generation. Implemented tool-driven ETL workflows supporting API extraction and Pandas transformations with CSV, JSON, and Parquet outputs.",
                problem: "",
                implementation: "",
                results: "",
                tags: ["LangGraph", "LangChain", "LLM", "SQL", "PostgreSQL", "ETL", "Pandas", "API Extraction", "CSV", "JSON", "Parquet"],
                image: "",
                url: "",
                githubUrl: ""
            }
        ],
        skills: [
            { category: "Programming", icon: "code", items: ["Python", "SQL"] },
            { category: "Data Engineering", icon: "schema", items: ["ETL", "PySpark", "Azure Data Factory", "Azure Data Lake", "Databricks", "Incremental Loading", "Backfilling"] },
            { category: "AI / GenAI", icon: "psychology", items: ["RAG", "LangGraph", "LangChain", "Agentic AI"] },
            { category: "Data / Dev", icon: "terminal", items: ["Pandas", "NumPy", "Flask", "Git", "GitHub"] },
            { category: "Core Subjects", icon: "school", items: ["OOPS", "DSA", "DBMS"] }
        ],
        experience: [
            {
                role: "Data Science Intern",
                company: "Reva Technologies",
                date: "Jun 2025 – Jul 2025",
                accomplishments: [],
                bullets: [
                    "Analysed climate datasets using Python and SQL for rainfall forecasting.",
                    "Built and evaluated machine learning models for weather prediction.",
                    "Performed data preprocessing and feature engineering to improve prediction accuracy."
                ]
            },
            {
                role: "Leadership / Co-Curricular",
                company: "SIES Graduate School Of Technology",
                date: "",
                bullets: [
                    "Student Council, Class Representative (Jul 2024 – May 2025). Led coordination between students and faculty.",
                    "NSS Volunteer (Aug 2023 – Aug 2024). Participated in community service and social activities."
                ]
            }
        ],
        education: [
            { period: "2023 - 2027", degree: "BE in Information Technology", institution: "SIES Graduate School Of Technology", resultLabel: "CGPA", resultValue: "9.3 / 10" },
            { period: "2021 - 2023", degree: "HSC", institution: "Shiravane Vidyalaya and Junior College", resultLabel: "Marks", resultValue: "65.17%" },
            { period: "May 2020 – Aug 2021", degree: "High School", institution: "St. Xavier's High School & Junior College, Nerul", resultLabel: "Marks", resultValue: "89%" }
        ],
        certifications: [
            { issuer: "Forage", title: "Quantitative Research Job Simulation", organization: "J.P. Morgan", image: "asset/Yashraj_JP_MORGAN_Quantitative Research Job Simulation.jpg", imageAlt: "Quantitative Research Job Simulation", url: "" },
            { issuer: "AWS Academy", title: "Introduction to Cloud", organization: "Amazon Web Services", image: "asset/AWS.jpg", imageAlt: "AWS Academy Introduction to Cloud", url: "" },
            { issuer: "Forage", title: "Data Visualisation: Empowering Business", organization: "Tata Group", image: "asset/Tata Data Visualization.jpg", imageAlt: "Data Visualisation", url: "" }
        ],
        achievements: [
            {
                eyebrow: "Cognition 2025",
                title: "Second Prize",
                description: "",
                bullets: [
                    "Secured Second Prize among competing teams.",
                    "Led end-to-end planning and execution of an AI-powered healthcare platform, presenting the solution before judges and faculty."
                ],
                image: "",
                imageAlt: ""
            }
        ],
        personalDetails: [
            { label: "Date of Birth", value: "15 Sep 2005" },
            { label: "Gender", value: "Male" },
            { label: "Location", value: "Nerul, Navi Mumbai" },
            { label: "Languages", value: "Hindi · English · Marathi" }
        ],
        contact: {
            eyebrow: "Let's Connect",
            title: "Initiate Contact",
            description: "Actively seeking internship opportunities in Data Engineering, Data Science, and Machine Learning starting in the near future.",
            linkedin: "https://www.linkedin.com/in/yashrajrr",
            github: "https://github.com/yashrajrr",
            phone: "+91 8446538778",
            email: "",
            formTitle: "Send Direct Message",
            formAction: "https://api.web3forms.com/submit",
            formSubject: "New Submission from Portfolio!"
        },
        footer: {
            name: "Yashraj Rathor",
            links: [
                { label: "LinkedIn", url: "https://www.linkedin.com/in/yashrajrr" },
                { label: "GitHub", url: "https://github.com/yashrajrr" },
                { label: "Back to Top", url: "#home" }
            ],
            copyright: "© 2026 YASHRAJ RATHOR. ENGINEERED WITH PASSION."
        }
    };

    root.PORTFOLIO_CONTENT = content;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = content;
    }
}(typeof window !== "undefined" ? window : globalThis));
