import type { ResumeStructuredData } from '@/lib/schemas/resume-structured-data'
import type { AiSuggestion } from '@/lib/schemas/resume-suggestions'

export const MATCH_SCORE = 62
export const STRENGTH_COUNT = 3

export const INITIAL_RESUME: ResumeStructuredData = {
  schemaVersion: 1,
  name: 'Nathan Nguyen',
  contact: {
    email: 'nathannguyen1402@gmail.com',
    phone: '+1 (714) 677-7342',
    linkedin: 'in/nathannguyen1402',
  },
  education: [
    {
      id: 'usf',
      institution: 'University of South Florida',
      location: 'Tampa, FL',
      degree: 'Bachelor of Arts in Statistics',
      gpa: 'GPA: 3.72/4.0',
      dates: 'Expected Graduation: May 2026',
      bullets: [
        'Coursework: Differential Equations, Computational Linear Algebra, Engineering Calculus (I, II, III), Basic Marketing, Fundamentals of Business Finance, Principles of Management',
        "Honors/Awards: USF Green & Gold Awards, Dean's List (Fall 2022, Spring 2024)",
      ],
    },
  ],
  experience: [
    {
      id: 'usf-quant',
      company: 'USF Quantitative Club',
      role: 'Data Engineer',
      dates: 'Aug 2025 - Present',
      location: 'Tampa, FL',
      bullets: [
        'Architected ETL pipeline processing 120K+ daily financial records using Python, Postgres, and Airflow with schema validation and data quality checks, reducing data incidents by 40%.',
        'Built dimensional data models and star schema supporting trading backtests for 24 members; optimized query performance for analysts running 500+ daily queries on 6 months of market data.',
        'Partnered with quantitative analysts to build Grafana dashboards tracking data freshness and pipeline health metrics; reduced manual validation time by 35% and enabled same-day issue detection.',
        'Deployed Go microservices on Kubernetes for real-time market data ingestion with Redis caching; achieved p95 latency of 140ms with 99% uptime serving trading strategies.',
      ],
    },
    {
      id: 'ebay',
      company: 'eBay Inc.',
      role: 'Data Science Intern',
      dates: 'May 2025 - Aug 2025',
      location: 'San Jose, CA',
      bullets: [
        'Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis.',
        'Resolved slow query performance issues by designing normalized MySQL schema with composite indexes and query optimization strategies, reducing response time from 2.3s to 0.4s for 50K+ daily queries.',
        'Created LLM-powered A/B test analysis tool that auto-generates experiment summaries; improved workflow intelligence, reducing manual reporting time from 2 hours to 30 minutes.',
      ],
    },
    {
      id: 'goldman',
      company: 'Goldman Sachs',
      role: 'Summer Analyst',
      dates: 'Jun 2024 - Aug 2024',
      location: 'New York, NY',
      bullets: [
        'Engineered automated reconciliation pipeline using Alteryx, Python and SQL to validate receivables data across 1000+ client accounts, eliminating 8 hours of weekly manual validation work.',
        'Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision identifying high-risk accounts for automated risk scoring.',
        'Designed data flow diagrams mapping multi-source invoice processing pipeline, documenting system architecture and data lineage to streamline debugging and identify root causes of processing issues.',
      ],
    },
    {
      id: 'medkick',
      company: 'Med-kick',
      role: 'Data Analyst Intern',
      dates: 'May 2023 - Sep 2023',
      location: 'Remote',
      bullets: [
        'Built AWS data pipeline for remote-care records (500K+ monthly interactions) with daily refresh, enabling up-to-date analytics across patient call and monitoring data.',
        'Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times; findings informed schedule changes that reduced average first-response time from 8 to 3 minutes.',
      ],
    },
    {
      id: 'gsoc',
      company: 'Google Summer of Code',
      role: 'Software Engineer Intern',
      dates: 'May 2024 - Sep 2024',
      location: 'Remote',
      bullets: [
        "Selected as 1 of 3% to build backend infrastructure for EvalAI (CloudCV's ML competition platform); orchestrated AWS Fargate workers processing 1000+ daily model evaluations using Django and boto3.",
        'Built CloudWatch monitoring pipeline tracking worker health and throughput metrics; implemented dynamic scaling reducing infrastructure costs by 30%.',
      ],
    },
  ],
  projects: [
    {
      id: 'market-analytics',
      name: 'Real-Time Market Analytics',
      technologies: 'Python, Postgres, WebSocket',
      bullets: [
        'Built streaming pipeline ingesting 5K+ stock price events/minute from Yahoo Finance API with sliding window aggregations for real-time price tracking and volume analysis; implemented data quality checks.',
      ],
    },
  ],
  skills: [
    {
      category: 'Languages & Databases',
      items: 'Python, SQL, Java, Go, Postgres, MySQL, Redis, Spark',
    },
    {
      category: 'Data & Cloud Tools',
      items: 'Airflow, AWS (Fargate, CloudWatch, S3), Docker, Grafana, Prometheus, Django, Git',
    },
  ],
}

export const AI_SUGGESTIONS: AiSuggestion[] = [
  {
    id: 'sql-window-functions',
    priority: 'critical',
    title: 'Add SQL Window Functions',
    why: 'Directly addresses the SQL depth required by the target role.',
    experienceId: 'ebay',
    bulletIndex: 0,
    newText:
      'Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions using Spark SQL with window functions (ROW_NUMBER, LAG, PARTITION BY) for session-level funnel and retention analysis; identified 3 conversion optimization opportunities.',
  },
  {
    id: 'ab-testing-science',
    priority: 'critical',
    title: 'Reframe A/B Testing as Statistical Science',
    why: 'Makes the experiment work read like statistical analysis, not only tooling.',
    experienceId: 'ebay',
    bulletIndex: 2,
    newText:
      'Designed and analyzed A/B experiments using hypothesis testing and statistical significance frameworks; built LLM-powered tooling to automate experiment summary generation, reducing reporting time by 75%.',
  },
  {
    id: 'goldman-regression',
    priority: 'critical',
    title: 'Add Regression to Goldman Sachs Model',
    why: 'Adds a stronger modeling signal for statistical data science roles.',
    experienceId: 'goldman',
    bulletIndex: 1,
    newText:
      'Built payment risk classification and logistic regression models using Python and scikit-learn; applied feature engineering and statistical model evaluation achieving 78% precision identifying high-risk accounts.',
  },
  {
    id: 'goldman-lineage-debugging',
    priority: 'important',
    title: 'Clarify Data Lineage Impact',
    why: 'Turns the architecture bullet into a clearer data-quality and debugging outcome.',
    experienceId: 'goldman',
    bulletIndex: 2,
    newText:
      'Mapped multi-source invoice processing workflows into data flow diagrams and lineage documentation, enabling faster debugging of failed reconciliations and clearer root-cause analysis across upstream data dependencies.',
  },
  {
    id: 'medkick-pipeline-reliability',
    priority: 'important',
    title: 'Add Pipeline Reliability Signal',
    why: 'Shows the AWS pipeline as an operational analytics system, not just a data pull.',
    experienceId: 'medkick',
    bulletIndex: 0,
    newText:
      'Built AWS data pipeline for 500K+ monthly remote-care interactions with daily refresh checks and monitoring, improving reliability of patient-call analytics and enabling up-to-date operational reporting.',
  },
]

export function getBulletKey(experienceId: string, bulletIndex: number) {
  return `${experienceId}-${bulletIndex}`
}

export function getBulletElementId(experienceId: string, bulletIndex: number) {
  return `experience-bullet-${experienceId}-${bulletIndex}`
}

export function getEditorTargetHref(suggestion: AiSuggestion) {
  const params = new URLSearchParams({
    experienceId: suggestion.experienceId,
    bulletIndex: String(suggestion.bulletIndex),
    suggestionId: suggestion.id,
  })

  return `/resume-editor?${params.toString()}`
}

export function getCurrentBulletForSuggestion(suggestion: AiSuggestion) {
  const experience = INITIAL_RESUME.experience.find((item) => item.id === suggestion.experienceId)

  return experience?.bullets[suggestion.bulletIndex] ?? ''
}
