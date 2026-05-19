import type { ResumeStructuredData } from "@/lib/schemas/resume-structured-data"
import type {
  BulletSignal,
  BulletSignalKey,
  PublicQuickScanResult,
} from "@/lib/schemas/public-quick-scan"

export type {
  BulletSignal,
  BulletSignalKey,
  MissingKeyword,
  MissingKeywordAction,
  PublicQuickScanPayload,
  PublicQuickScanResult,
  QuickScanMetric,
  QuickScanScoreLabel,
  ResponsibilityMatch,
  ResponsibilityStatus,
  SearchabilityCheck,
  SearchabilityStatus,
  WeakKeyword,
} from "@/lib/schemas/public-quick-scan"

// Demo-only fixture for the public scan/results flow.
// Keep this separate from lib/resume-demo-data.ts because the old file supports
// the authenticated editor flow, while the public scan UI needs presentation
// metadata such as bullet signals, keyword coverage, and responsibility match.
export const DEMO_RESUME_STRUCTURED_DATA: ResumeStructuredData = {
  schemaVersion: 1,
  name: "Nathan Nguyen",
  contact: {
    email: "nathannguyen1402@gmail.com",
    phone: "+1 (714) 677-7232",
    linkedin: "in/thieunguyen1402",
  },
  education: [
    {
      id: "usf",
      institution: "University of South Florida",
      location: "Tampa, FL",
      degree: "Bachelor of Arts in Statistics",
      gpa: "GPA: 3.72/4.0",
      dates: "Expected: Dec 2026",
      bullets: [
        "Coursework: Differential Equations, Computational Linear Algebra, Engineering Calculus",
        "Honors/Awards: USF Green & Gold Awards, Dean's List (Fall 2022, Spring 2024)",
      ],
    },
  ],
  experience: [
    {
      id: "ebay",
      company: "eBay Inc.",
      role: "Data Science Intern",
      dates: "May 2025 - Aug 2025",
      location: "San Jose, CA",
      bullets: [
        "Analyzed eBay shopper behavior with Spark SQL on 10M+ weekly sessions; identified drop-off patterns across three conversion bottlenecks with ~3% conversion rate lift potential.",
        "Designed and updated Tableau dashboards tracking conversion metrics across 12+ user segments; supported product managers in conducting 20+ weekly funnel analyses.",
        "Analyzed 10M+ eBay shopper sessions to find where users dropped off before buying; found 3 checkout flow issues and shared recommendations with product team.",
        "Created weekly PowerPoint presentations and Excel analysis for product leadership.",
      ],
    },
    {
      id: "goldman",
      company: "Goldman Sachs",
      role: "Summer Analyst - BI",
      dates: "Jun 2024 - Aug 2024",
      location: "Salt Lake City, UT",
      bullets: [
        "Built automated Alteryx and SQL pipeline for $1M trading portfolio; reduced reporting time from 2 hours to 30 minutes.",
        "Partnered with operations to build Tableau dashboard for unpaid invoices across 100+ clients.",
        "Performed data reconciliation across 3 MySQL tables validating 1000+ client invoices.",
        "Delivered training on Tableau dashboard usage and data validation workflows.",
      ],
    },
    {
      id: "medkick",
      company: "Med-kick",
      role: "Data Analyst Intern",
      dates: "May 2023 - Sep 2023",
      location: "Remote",
      bullets: [
        "Built Power BI dashboards tracking call volume and revenue across 500K+ monthly patient interactions.",
        "Developed Excel financial model linking call patterns to staffing costs; reduced first-response time from 8 to 3 minutes.",
        "Analyzed 500K+ monthly interactions using Python identifying peak demand periods.",
      ],
    },
  ],
  projects: [
    {
      id: "bikeshare-operations",
      name: "Bikeshare Operations Analytics",
      technologies: "Python, SQL, Tableau, NYC Citi Bike Dataset",
      bullets: [
        "Built fleet analytics pipeline using NYC Citi Bike's public dataset across 1,700+ docking stations.",
      ],
    },
    {
      id: "urban-transit",
      name: "Urban Transit Performance Analysis",
      technologies: "Python, SQL, Tableau, MTA Open Data",
      bullets: [
        "Built geographic delay analysis using MTA's real-time API with geospatial clustering.",
      ],
    },
  ],
  skills: [
    {
      category: "Tools",
      items: "SQL, Tableau, Excel, Python (pandas, NumPy, Streamlit), Power BI, Alteryx, R, SparkSQL, PowerPoint",
    },
    {
      category: "Analysis",
      items: "Statistical Testing, A/B Testing, Regression Analysis, Data Modeling, Financial Modeling",
    },
  ],
}

export const DEMO_BULLET_SIGNALS: Record<BulletSignalKey, BulletSignal> = {
  "ebay:0": "partial",
  "ebay:1": "partial",
  "ebay:2": "weak",
  "ebay:3": "weak",
  "goldman:0": "good",
  "goldman:1": "partial",
  "goldman:2": "good",
  "goldman:3": "weak",
  "medkick:0": "partial",
  "medkick:1": "partial",
  "medkick:2": "partial",
}

export const DEMO_QUICK_SCAN_RESULT: PublicQuickScanResult = {
  score: 62,
  scoreLabel: "Below target",
  verdict:
    "Your analytics foundation is solid, but the resume does not speak the ML modeling language this role prioritizes.",
  strongestSignal:
    "Large-scale analysis and reporting are demonstrated across eBay, Goldman, Med-kick, and your projects with measurable outcomes.",
  biggestGap:
    "No bullets mention building, training, validating, or evaluating ML models, which is a core expectation for this role.",
  metrics: {
    hardSkills: { found: 7, total: 12 },
    domainTerms: { found: 3, total: 9 },
    softSkills: { found: 4, total: 5 },
  },
  missing: [
    {
      label: "scikit-learn",
      action: "add_to_skills",
      jdFreq: 4,
      reason: "You work with Python and data modeling. Add this to skills if you have used it.",
    },
    {
      label: "feature engineering",
      action: "strengthen",
      jdFreq: 3,
      reason: "Your eBay pipeline work likely involved this. Reframe a bullet to make it explicit.",
    },
    {
      label: "cross-validation",
      action: "strengthen",
      jdFreq: 2,
      reason: "Your skills list mentions statistical testing, but no bullet shows model validation methodology.",
    },
    {
      label: "AUC / ROC",
      action: "real_gap",
      jdFreq: 2,
      reason: "No evidence appears in your resume. Do not add this unless you have evaluated models this way.",
    },
    {
      label: "precision/recall",
      action: "real_gap",
      jdFreq: 1,
      reason: "Only add these metrics if you have genuinely used them in model evaluation.",
    },
  ],
  weak: [
    {
      label: "pandas",
      note: "Only found in the skills section. Add it to a bullet with context, such as eBay or Med-kick analysis work.",
    },
    {
      label: "A/B testing",
      note: "Only found in the skills section. Add it to a bullet only if you actually designed or analyzed experiments.",
    },
  ],
  present: [
    "SQL",
    "Python",
    "Tableau",
    "A/B testing",
    "Statistical Testing",
    "Regression Analysis",
    "Alteryx",
    "SparkSQL",
  ],
  responsibilities: [
    {
      label: "ML model development",
      status: "not_shown",
      evidence: null,
      gap: "No bullets mention building, training, or deploying a model. A project or bullet showing end-to-end model work would cover it.",
      targetBulletKey: "ebay:0",
    },
    {
      label: "Model evaluation and validation",
      status: "partial",
      evidence: "Skills: Statistical Testing, A/B Testing, Regression Analysis, Data Modeling, Financial Modeling.",
      gap: "These methods appear only in skills, not in bullet evidence. Mentioning precision/recall, AUC, or cross-validation would close this gap only if you have used them.",
      targetBulletKey: "ebay:0",
    },
    {
      label: "Large-scale data analysis",
      status: "partial",
      evidence:
        "Analyzed eBay shopper behavior with Spark SQL on 10M+ weekly sessions; identified drop-off patterns across three conversion bottlenecks.",
      gap: "Scale is there, but the framing is BI-oriented. Reframing around feature extraction or signal generation would strengthen this.",
      targetBulletKey: "ebay:0",
    },
    {
      label: "Data pipeline development",
      status: "demonstrated",
      evidence:
        "Built automated Alteryx and SQL pipeline for $1M trading portfolio; reduced reporting time from 2 hours to 30 minutes.",
      gap: null,
    },
    {
      label: "Statistical analysis",
      status: "partial",
      evidence: "Skills: Statistical Testing, A/B Testing, Regression Analysis, Data Modeling, Financial Modeling.",
      gap: "The statistical terms are present, but the resume does not show where or how the analysis was applied.",
      targetBulletKey: "medkick:2",
    },
    {
      label: "Dashboard and reporting",
      status: "demonstrated",
      evidence:
        "Designed and updated Tableau dashboards tracking conversion metrics across 12+ user segments; supported product managers in conducting 20+ weekly funnel analyses.",
      gap: null,
    },
    {
      label: "Stakeholder communication",
      status: "demonstrated",
      evidence:
        "Created weekly PowerPoint presentations and Excel analysis for product leadership summarizing findings, conversion trends, and user insights.",
      gap: null,
    },
  ],
  searchability: [
    {
      category: "Contact information",
      status: "pass",
      text: "Email address found - nathannguyen1402@gmail.com",
    },
    {
      category: "Contact information",
      status: "pass",
      text: "Phone number found - +1 (714) 677-7232",
    },
    {
      category: "Contact information",
      status: "pass",
      text: "LinkedIn profile found - in/thieunguyen1402",
    },
    {
      category: "Contact information",
      status: "warn",
      text: "No physical address found. This is usually acceptable, but some older parsers expect one.",
    },
    {
      category: "Section headings",
      status: "pass",
      text: "Education section detected",
    },
    {
      category: "Section headings",
      status: "pass",
      text: "Work Experience section detected",
    },
    {
      category: "Section headings",
      status: "pass",
      text: "Skills section detected",
    },
    {
      category: "Section headings",
      status: "pass",
      text: "Projects section detected",
    },
    {
      category: "Section headings",
      status: "warn",
      text: "No Summary section found. A short summary can help recruiters understand positioning quickly.",
    },
    {
      category: "Experience format",
      status: "pass",
      text: "eBay Inc. includes company, title, dates, location, and bullets",
    },
    {
      category: "Experience format",
      status: "pass",
      text: "Goldman Sachs includes company, title, dates, location, and bullets",
    },
    {
      category: "Experience format",
      status: "pass",
      text: "Med-kick includes company, title, dates, location, and bullets",
    },
    {
      category: "Date consistency",
      status: "pass",
      text: "Dates follow a consistent Month YYYY format",
    },
    {
      category: "Date consistency",
      status: "pass",
      text: "No overlapping or missing date ranges detected",
    },
  ],
}
