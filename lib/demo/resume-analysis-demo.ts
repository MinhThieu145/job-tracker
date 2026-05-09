import type { ResumeAnalysis } from "@/lib/schemas/resume-analysis"

export type ResumeAnalysisDemoResponse = ResumeAnalysis & {
  strengthCount: number
}

export const RESUME_ANALYSIS_DEMO: ResumeAnalysisDemoResponse = {
  "matchScore": 72,
  "jobSummary": "Entry-level Data Scientist role on Uber's Marketplace Dynamics team focused on EDA, A/B testing, predictive modeling (demand forecasting, churn, LTV), SQL/Python dashboarding, and translating quantitative insights for non-technical stakeholders. The team balances supply and demand across Uber's global marketplace. Role requires statistical rigor, causal inference awareness, and big data tooling experience.",
  "roleArchetype": {
    "label": "Applied Data Scientist – Marketplace/Product Analytics",
    "reason": "The role centers on experimentation design, predictive modeling, and business-impact analytics within a two-sided marketplace. It is less about engineering pipelines and more about statistical reasoning, model building, and stakeholder communication — distinguishing it from a pure Data Engineering or MLE role."
  },
  "techHierarchy": {
    "tier1": [
      {
        "skill": "SQL",
        "reason": "Explicitly required for complex joins, window functions, dashboarding, and daily analytics work — listed as a basic qualification."
      },
      {
        "skill": "Python",
        "reason": "Primary language for model development, EDA, and data manipulation — listed as a basic qualification alongside R."
      },
      {
        "skill": "Statistical Hypothesis Testing / A/B Testing",
        "reason": "Core to the experimentation pillar of the role; defining metrics and determining causality is a central responsibility."
      }
    ],
    "tier2": [
      {
        "skill": "Scikit-learn / XGBoost",
        "reason": "Standard ML libraries listed in basic qualifications for predictive modeling tasks like churn and demand forecasting."
      },
      {
        "skill": "Spark / Hive / Presto",
        "reason": "Preferred big data tools for processing large-scale datasets — directly listed as preferred qualifications."
      },
      {
        "skill": "Dashboarding / Data Visualization",
        "reason": "Explicit responsibility to build and automate high-visibility dashboards for Product and Operations teams."
      },
      {
        "skill": "Regression Analysis / Probability",
        "reason": "Core statistical knowledge required under basic qualifications for model development and experimentation."
      }
    ],
    "tier3": [
      {
        "skill": "Causal Inference / Observational Studies",
        "reason": "Listed as a preferred qualification; enhances experimental design credibility beyond basic A/B testing."
      },
      {
        "skill": "R",
        "reason": "Listed alongside Python as an acceptable modeling language — lower priority than Python but mentioned explicitly."
      },
      {
        "skill": "Storytelling / Executive Communication",
        "reason": "Preferred soft skill — ability to explain why data matters to non-technical stakeholders for product roadmap influence."
      }
    ]
  },
  "responsibilityHierarchy": [
    {
      "rank": 1,
      "responsibility": "Experimentation (A/B Testing)",
      "whatItMeans": "Design and analyze controlled experiments to measure causal impact of product or pricing changes; define success metrics and apply statistical rigor.",
      "whyCore": "A/B testing is listed first among preferred qualifications and is explicitly called out as a core data science function. In a marketplace context, every pricing or matching change is validated through experiments.",
      "resumeCoverage": "partial_match",
      "bestEvidence": [
        {
          "company": "eBay Inc.",
          "bullet": "Created LLM-powered A/B test analysis tool that auto-generates experiment summaries; improved workflow intelligence, reducing manual reporting time from 2 hours to 30 minutes.",
          "reason": "Directly mentions A/B test analysis, showing hands-on exposure to experimentation workflows and automation — though framing is tool-building rather than statistical design and interpretation."
        }
      ],
      "recommendedAction": "rewrite_existing_bullet"
    },
    {
      "rank": 2,
      "responsibility": "Exploratory Data Analysis (EDA) on Large-Scale Datasets",
      "whatItMeans": "Mine massive datasets to surface patterns, inefficiencies, and opportunities — e.g., wait time reduction or dispatch optimization.",
      "whyCore": "EDA is the foundational first step for every data science project at Uber scale; it directly feeds model development and stakeholder reporting.",
      "resumeCoverage": "strong_match",
      "bestEvidence": [
        {
          "company": "eBay Inc.",
          "bullet": "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis.",
          "reason": "10M+ session analysis with Spark SQL and funnel analysis maps directly to large-scale EDA to find marketplace efficiency opportunities."
        },
        {
          "company": "Med-kick",
          "bullet": "Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times; findings informed schedule changes that reduced average first-response time from 8 to 3 minutes.",
          "reason": "Peak demand and wait time analysis is semantically identical to the wait-time reduction and supply-demand balancing work described in the JD."
        }
      ],
      "recommendedAction": "no_action"
    },
    {
      "rank": 3,
      "responsibility": "Predictive Model Development",
      "whatItMeans": "Build models like demand forecasting, churn prediction, or LTV using Python/R and collaborate with engineers to deploy them.",
      "whyCore": "Predictive modeling is the core data science deliverable — it directly powers Uber's pricing and matching engines.",
      "resumeCoverage": "partial_match",
      "bestEvidence": [
        {
          "company": "Goldman Sachs",
          "bullet": "Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision identifying high-risk accounts for automated risk scoring.",
          "reason": "End-to-end ML model with scikit-learn, feature engineering, and precision metric — directly demonstrates model development skills even though domain is finance not marketplace."
        }
      ],
      "recommendedAction": "rewrite_existing_bullet"
    },
    {
      "rank": 4,
      "responsibility": "Dashboarding & KPI Reporting",
      "whatItMeans": "Create and automate dashboards using SQL and visualization tools to track KPIs and deliver insights to Product and Operations.",
      "whyCore": "High-visibility reporting is how data scientists drive decisions — it's listed as a standalone core responsibility, not a nice-to-have.",
      "resumeCoverage": "strong_match",
      "bestEvidence": [
        {
          "company": "USF Quantitative Club",
          "bullet": "Partnered with quantitative analysts to build Grafana dashboards tracking data freshness and pipeline health metrics; reduced manual validation time by 35% and enabled same-day issue detection.",
          "reason": "Dashboard creation reducing manual time and enabling real-time visibility is a direct match — though the audience is internal analysts rather than Product/Ops stakeholders."
        }
      ],
      "recommendedAction": "rewrite_existing_bullet"
    },
    {
      "rank": 5,
      "responsibility": "Stakeholder Communication & Translating Findings",
      "whatItMeans": "Translate complex quantitative results into executive-style, non-technical summaries that influence the product roadmap.",
      "whyCore": "In a cross-functional role like this, the ability to communicate 'so what' to PMs and operations leaders is what creates actual business impact from analysis.",
      "resumeCoverage": "semantic_match",
      "bestEvidence": [
        {
          "company": "eBay Inc.",
          "bullet": "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis.",
          "reason": "Collaboration with PMs and engineers implies translating findings into product decisions, though explicit communication framing is absent."
        },
        {
          "company": "Med-kick",
          "bullet": "Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times; findings informed schedule changes that reduced average first-response time from 8 to 3 minutes.",
          "reason": "'Findings informed schedule changes' demonstrates translating data into operational decisions — the strongest implicit communication evidence on the resume."
        }
      ],
      "recommendedAction": "mention_in_bullet"
    }
  ],
  "keywordCoverage": [
    {
      "keyword": "SQL",
      "category": "language",
      "tier": 1,
      "status": "covered",
      "evidence": [
        "Architected ETL pipeline processing 120K+ daily financial records using Python, Postgres, and Airflow",
        "Resolved slow query performance issues by designing normalized MySQL schema with composite indexes",
        "Engineered automated reconciliation pipeline using Alteryx, Python and SQL",
        "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL"
      ],
      "recommendation": "keep",
      "reason": "SQL is prominently and repeatedly evidenced across multiple roles with complexity indicators (composite indexes, query optimization, Spark SQL)."
    },
    {
      "keyword": "Python",
      "category": "language",
      "tier": 1,
      "status": "covered",
      "evidence": [
        "Architected ETL pipeline processing 120K+ daily financial records using Python",
        "Built payment risk classification model using Python and scikit-learn",
        "Analyzed call patterns from 500K+ monthly patient care interactions using Python"
      ],
      "recommendation": "keep",
      "reason": "Python appears in nearly every role with meaningful analytical and modeling context."
    },
    {
      "keyword": "A/B Testing",
      "category": "methodology",
      "tier": 1,
      "status": "covered_but_buried",
      "evidence": [
        "Created LLM-powered A/B test analysis tool that auto-generates experiment summaries"
      ],
      "recommendation": "move_higher",
      "reason": "A/B testing is a tier-1 requirement and only appears once in a bullet framed around tool-building rather than statistical experimentation. Needs repositioning."
    },
    {
      "keyword": "Hypothesis Testing",
      "category": "methodology",
      "tier": 1,
      "status": "missing",
      "evidence": [],
      "recommendation": "mention_in_bullet",
      "reason": "No explicit mention of hypothesis testing, p-values, confidence intervals, or statistical significance anywhere on the resume despite being a basic qualification."
    },
    {
      "keyword": "Regression Analysis",
      "category": "methodology",
      "tier": 1,
      "status": "missing",
      "evidence": [],
      "recommendation": "mention_in_bullet",
      "reason": "Regression is listed as a core statistical requirement. The scikit-learn model at Goldman Sachs likely involved regression but it is not stated."
    },
    {
      "keyword": "Scikit-learn",
      "category": "framework",
      "tier": 2,
      "status": "covered",
      "evidence": [
        "Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision"
      ],
      "recommendation": "keep",
      "reason": "Explicitly mentioned with a concrete output (78% precision classification model). Should also appear in skills section."
    },
    {
      "keyword": "Spark",
      "category": "tool",
      "tier": 2,
      "status": "covered",
      "evidence": [
        "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL"
      ],
      "recommendation": "keep",
      "reason": "Spark SQL used at scale (10M+ sessions) at eBay — strong evidence for big data processing capability."
    },
    {
      "keyword": "Demand Forecasting",
      "category": "domain",
      "tier": 2,
      "status": "semantic_match",
      "evidence": [
        "Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times"
      ],
      "recommendation": "mention_in_bullet",
      "reason": "Demand pattern analysis at Med-kick is semantically adjacent to demand forecasting but never framed as a forecasting model. Reframing could close this gap."
    },
    {
      "keyword": "Dashboarding / Data Visualization",
      "category": "tool",
      "tier": 2,
      "status": "covered_but_buried",
      "evidence": [
        "Partnered with quantitative analysts to build Grafana dashboards tracking data freshness and pipeline health metrics"
      ],
      "recommendation": "move_higher",
      "reason": "Dashboard work is present but framed as pipeline health monitoring rather than business KPI tracking for stakeholders. Needs reframing."
    },
    {
      "keyword": "Causal Inference",
      "category": "methodology",
      "tier": 3,
      "status": "missing",
      "evidence": [],
      "recommendation": "do_not_add_unless_true",
      "reason": "No evidence of causal inference methods (DiD, IV, RDD, etc.) on the resume. Do not claim unless genuinely practiced."
    },
    {
      "keyword": "XGBoost",
      "category": "framework",
      "tier": 2,
      "status": "missing",
      "evidence": [],
      "recommendation": "add_to_skills_if_true",
      "reason": "XGBoost is explicitly mentioned in JD basic qualifications. If used in any project or work, add to skills section."
    },
    {
      "keyword": "Feature Engineering",
      "category": "methodology",
      "tier": 2,
      "status": "covered",
      "evidence": [
        "Built payment risk classification model using Python and scikit-learn with feature engineering"
      ],
      "recommendation": "keep",
      "reason": "Explicitly mentioned alongside scikit-learn model at Goldman Sachs."
    },
    {
      "keyword": "Funnel Analysis",
      "category": "methodology",
      "tier": 2,
      "status": "covered",
      "evidence": [
        "identified 3 conversion optimization opportunities through funnel analysis"
      ],
      "recommendation": "keep",
      "reason": "Funnel analysis at eBay scale (10M+ sessions) is strong product analytics evidence."
    },
    {
      "keyword": "KPI Tracking",
      "category": "business_process",
      "tier": 2,
      "status": "semantic_match",
      "evidence": [
        "Grafana dashboards tracking data freshness and pipeline health metrics"
      ],
      "recommendation": "mention_in_bullet",
      "reason": "Current dashboards track technical metrics, not business KPIs. Reframe to emphasize business metric tracking where applicable."
    },
    {
      "keyword": "Stakeholder Communication",
      "category": "soft_skill",
      "tier": 3,
      "status": "semantic_match",
      "evidence": [
        "Partnered with product managers and engineers",
        "findings informed schedule changes"
      ],
      "recommendation": "mention_in_bullet",
      "reason": "Collaboration with PMs is implied but explicit communication framing is absent. One bullet should surface this more directly."
    },
    {
      "keyword": "Hive / Presto",
      "category": "tool",
      "tier": 3,
      "status": "missing",
      "evidence": [],
      "recommendation": "ignore_low_priority",
      "reason": "Preferred but not required. Spark SQL coverage partially fills this gap. No need to add unless genuinely used."
    },
    {
      "keyword": "R",
      "category": "language",
      "tier": 3,
      "status": "missing",
      "evidence": [],
      "recommendation": "ignore_low_priority",
      "reason": "R is listed as an alternative to Python. Python is well-evidenced; no need to claim R unless actually used."
    },
    {
      "keyword": "Airflow",
      "category": "tool",
      "tier": 3,
      "status": "covered",
      "evidence": [
        "Architected ETL pipeline processing 120K+ daily financial records using Python, Postgres, and Airflow"
      ],
      "recommendation": "keep",
      "reason": "Airflow appears in skills and experience. Less critical for this DS role but demonstrates pipeline maturity."
    },
    {
      "keyword": "First-Principles Problem Solving",
      "category": "soft_skill",
      "tier": 3,
      "status": "missing",
      "evidence": [],
      "recommendation": "ignore_low_priority",
      "reason": "Soft skill framing — hard to explicitly evidence on a resume. Let project framing imply structured thinking."
    }
  ],
  "criticalGaps": [
    {
      "gap": "Explicit Statistical Testing / Hypothesis Testing",
      "type": "skill",
      "tier": 1,
      "reason": "The JD lists hypothesis testing as a basic qualification. No resume bullet mentions statistical significance, p-values, confidence intervals, or any formal testing framework. The A/B test tool built at eBay is framed as an automation tool, not a statistical analysis exercise.",
      "evidenceChecked": [
        "eBay A/B test analysis tool bullet",
        "Goldman Sachs classification model bullet",
        "All Python references"
      ]
    },
    {
      "gap": "Experimental Design (A/B Test Design and Analysis)",
      "type": "responsibility",
      "tier": 1,
      "reason": "The resume shows A/B test automation tooling but not the design or analysis of experiments — defining success metrics, running significance tests, or interpreting causal impact. This is rank-1 responsibility and the coverage is partial at best.",
      "evidenceChecked": [
        "eBay A/B test analysis tool",
        "No other experimentation evidence found"
      ]
    },
    {
      "gap": "Predictive Modeling for Business Outcomes (Demand/Churn/LTV)",
      "type": "domain",
      "tier": 1,
      "reason": "The only ML model on the resume is a risk classification model at Goldman Sachs. There is no forecasting model, churn model, or LTV model — the specific examples given in the JD. The Med-kick demand pattern analysis was not framed as a model.",
      "evidenceChecked": [
        "Goldman Sachs scikit-learn model",
        "Med-kick demand analysis",
        "Real-Time Market Analytics project"
      ]
    }
  ],
  "matchStrengths": [
    {
      "responsibility": "EDA on Large-Scale Datasets",
      "yourEvidence": "Analyzed 10M+ eBay shopper sessions with Spark SQL to identify 3 conversion optimization opportunities; analyzed 500K+ monthly patient interactions to identify peak demand and wait times.",
      "whyItMatches": "Both bullets demonstrate the exact JD requirement of mining massive datasets to identify efficiency opportunities — directly analogous to reducing wait times and optimizing dispatch at Uber."
    },
    {
      "responsibility": "Big Data Tooling (Spark)",
      "yourEvidence": "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL.",
      "whyItMatches": "Spark is listed as a preferred qualification and the candidate has real-scale experience (10M+ sessions), which is a differentiator at the entry level."
    },
    {
      "responsibility": "Machine Learning Model Development",
      "yourEvidence": "Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision identifying high-risk accounts.",
      "whyItMatches": "End-to-end model ownership with scikit-learn, feature engineering, and a quantified precision metric directly satisfies the basic qualification for ML library familiarity."
    },
    {
      "responsibility": "Dashboarding & Stakeholder Reporting",
      "yourEvidence": "Built Grafana dashboards tracking data freshness and pipeline health metrics; reduced manual validation time by 35% and enabled same-day issue detection.",
      "whyItMatches": "Dashboard creation with measurable impact (35% reduction in manual work) demonstrates the automation and visibility outcomes the JD requires for KPI reporting."
    },
    {
      "responsibility": "Demand & Wait Time Analysis",
      "yourEvidence": "Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times; findings informed schedule changes that reduced average first-response time from 8 to 3 minutes.",
      "whyItMatches": "This is semantically the closest analogue on the resume to Uber's core marketplace problem — balancing supply and demand to reduce wait times — with a concrete operational outcome."
    }
  ],
  "riskAssessment": [
    {
      "risk": "No demonstrated statistical rigor in experimentation",
      "severity": "high",
      "mitigation": "Add explicit statistical language to the eBay A/B test bullet (e.g., mention significance testing, confidence intervals, or metric definition). If genuinely performed, add a line about statistical methods used."
    },
    {
      "risk": "ML experience is limited to one classification model",
      "severity": "medium",
      "mitigation": "The Goldman Sachs model is solid but narrow. If the Real-Time Market Analytics project included any predictive component, reframe it. Consider adding a personal project involving forecasting or regression to round out the modeling narrative."
    },
    {
      "risk": "Resume framed primarily as a Data Engineer, not a Data Scientist",
      "severity": "medium",
      "mitigation": "Pipeline and infrastructure bullets dominate. For this application, de-emphasize ETL/orchestration language and lead with analytical outcomes, model results, and business insights. Reorder bullets to put analytical work first."
    },
    {
      "risk": "No causal inference experience",
      "severity": "low",
      "mitigation": "Causal inference is preferred, not required. Ensure the A/B test bullet is strong enough to imply experimental thinking. Do not fabricate causal inference experience."
    },
    {
      "risk": "Stakeholder communication not explicitly demonstrated",
      "severity": "low",
      "mitigation": "At least one bullet should explicitly state that findings were presented to or acted upon by non-technical stakeholders (PMs, ops teams, executives). The Med-kick bullet partially does this and can be strengthened."
    }
  ],
  "recommendedNextActions": [
    {
      "priority": 1,
      "action": "Rewrite the eBay A/B test bullet to foreground statistical experimentation, not just tool-building",
      "reason": "A/B testing is the #1 core responsibility in the JD and your current framing hides the statistical work behind an LLM automation narrative. Recruiters and ATS will not score this as experimentation experience."
    },
    {
      "priority": 2,
      "action": "Add explicit hypothesis testing / statistical significance language to at least one bullet",
      "reason": "Hypothesis testing is a basic qualification. Its complete absence is a screener risk. If you ran any significance tests at eBay or Goldman Sachs, surface the methodology explicitly."
    },
    {
      "priority": 3,
      "action": "Reframe the Med-kick demand analysis bullet to use forecasting / supply-demand language",
      "reason": "This bullet is your closest semantic match to Uber's marketplace mission. Framing it as 'demand forecasting' or 'supply-demand analysis' rather than 'call patterns' dramatically improves relevance signaling."
    },
    {
      "priority": 4,
      "action": "Move analytical and modeling bullets above pipeline/engineering bullets within each role",
      "reason": "The resume currently reads as a data engineering profile. For a DS role, the EDA, modeling, and insight-generation bullets should lead each experience section."
    },
    {
      "priority": 5,
      "action": "Add scikit-learn and Spark to the skills section explicitly if not already present",
      "reason": "Both are mentioned in JD qualifications (basic and preferred respectively) and are evidenced on your resume but may not appear in your skills list for ATS parsing."
    },
    {
      "priority": 6,
      "action": "Add one sentence to the Goldman Sachs or eBay role explicitly mentioning presenting findings to non-technical stakeholders",
      "reason": "Stakeholder communication is a preferred qualification and a standalone core responsibility. One explicit mention closes this gap without inventing experience."
    }
  ],
  "strengthCount": 5,
  "aiSuggestions": [
    {
      "id": "sql-window-functions",
      "priority": "critical",
      "title": "Add SQL Window Functions",
      "why": "Directly addresses the SQL depth required by the target role.",
      "experienceId": "ebay",
      "bulletIndex": 0,
      "newText": "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions using Spark SQL with window functions (ROW_NUMBER, LAG, PARTITION BY) for session-level funnel and retention analysis; identified 3 conversion optimization opportunities."
    },
    {
      "id": "ab-testing-science",
      "priority": "critical",
      "title": "Reframe A/B Testing as Statistical Science",
      "why": "Makes the experiment work read like statistical analysis, not only tooling.",
      "experienceId": "ebay",
      "bulletIndex": 2,
      "newText": "Designed and analyzed A/B experiments using hypothesis testing and statistical significance frameworks; built LLM-powered tooling to automate experiment summary generation, reducing reporting time by 75%."
    },
    {
      "id": "goldman-regression",
      "priority": "critical",
      "title": "Add Regression to Goldman Sachs Model",
      "why": "Adds a stronger modeling signal for statistical data science roles.",
      "experienceId": "goldman",
      "bulletIndex": 1,
      "newText": "Built payment risk classification and logistic regression models using Python and scikit-learn; applied feature engineering and statistical model evaluation achieving 78% precision identifying high-risk accounts."
    },
    {
      "id": "goldman-lineage-debugging",
      "priority": "important",
      "title": "Clarify Data Lineage Impact",
      "why": "Turns the architecture bullet into a clearer data-quality and debugging outcome.",
      "experienceId": "goldman",
      "bulletIndex": 2,
      "newText": "Mapped multi-source invoice processing workflows into data flow diagrams and lineage documentation, enabling faster debugging of failed reconciliations and clearer root-cause analysis across upstream data dependencies."
    },
    {
      "id": "medkick-pipeline-reliability",
      "priority": "important",
      "title": "Add Pipeline Reliability Signal",
      "why": "Shows the AWS pipeline as an operational analytics system, not just a data pull.",
      "experienceId": "medkick",
      "bulletIndex": 0,
      "newText": "Built AWS data pipeline for 500K+ monthly remote-care interactions with daily refresh checks and monitoring, improving reliability of patient-call analytics and enabling up-to-date operational reporting."
    }
  ]
}
