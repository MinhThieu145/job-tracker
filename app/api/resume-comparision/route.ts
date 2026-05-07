import { anthropicClient } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";

export async function POST(req: Request) {
    try {
        // 1. we take in the resumeId and jobDescription
        const { resumeId, jobDescription } = await req.json()

        // 2. get the resume data structured
        const resumeData = await prisma.resumeVersion.findUnique({
            where: {
                id: resumeId
            }
        })


        // Since the resumeData can be null we would need at least 2 check like this
        // so that typescript is not complain
        if (!resumeData) {
            return NextResponse.json(
                { error: "Resume not found" },
                { status: 404 }
            );
        }

        if (!resumeData.structuredData) {
            return NextResponse.json(
                { error: "Resume has no structuredData" },
                { status: 400 }
            );
        }

        // while we at it. Might as well also check this.
        // typescript not complain but it's good to check
        if (!jobDescription || typeof (jobDescription) != "string") {
            return NextResponse.json({ error: "Missing or error parsing job description", status: 400 })
        }

        const { structuredData } = resumeData;



        // demo result for the endpoint
        return NextResponse.json(
            {
                "jobSummary": "Uber's Marketplace Dynamics team needs an entry-level Data Scientist who can run A/B experiments, build predictive models, write complex SQL, and translate quantitative findings into stakeholder-ready insights for pricing and matching systems.",
                "roleArchetype": {
                    "label": "Data Analyst",
                    "reason": "While the JD title says Data Scientist, the day-to-day work described—EDA on large datasets, A/B test design and analysis, dashboard/KPI reporting, stakeholder communication, and some model building—skews heavily toward a product/data analyst hybrid. The ML modeling component is present but not dominant; SQL, experimentation, and insight communication are the core daily drivers."
                },
                "techHierarchy": {
                    "tier1": [
                        {
                            "skill": "SQL (complex joins, window functions)",
                            "reason": "Explicitly called out as a basic qualification with specific syntax requirements; used daily for dashboarding, reporting, and EDA on large-scale data."
                        },
                        {
                            "skill": "Python",
                            "reason": "Listed as a basic qualification alongside R; required for model development, EDA, and working with ML libraries like Scikit-learn."
                        },
                        {
                            "skill": "A/B Testing / Experimentation",
                            "reason": "Entire dedicated responsibility section; the role is expected to design, implement, and analyze experiments independently with statistical rigor."
                        },
                        {
                            "skill": "Statistical analysis (hypothesis testing, regression, probability)",
                            "reason": "Explicitly required as a basic qualification and underpins the experimentation and model development work described."
                        }
                    ],
                    "tier2": [
                        {
                            "skill": "Scikit-learn / XGBoost",
                            "reason": "Called out in basic qualifications as 'familiarity' needed, implying it's expected but not the primary daily driver; used for predictive model building."
                        },
                        {
                            "skill": "Dashboarding / Data Visualization",
                            "reason": "Dedicated responsibility for building high-visibility dashboards; important but secondary to the experimentation and modeling work."
                        },
                        {
                            "skill": "Spark / Hive / Presto",
                            "reason": "Listed under preferred qualifications for big data processing; differentiates candidates but not a Day 1 hard requirement."
                        },
                        {
                            "skill": "Causal Inference / Observational Studies",
                            "reason": "Preferred qualification that would differentiate a candidate but is not listed as a basic requirement."
                        },
                        {
                            "skill": "Demand forecasting / Predictive modeling",
                            "reason": "Mentioned as example model types; important context for the marketplace domain but secondary to experimentation fundamentals."
                        }
                    ],
                    "tier3": [
                        {
                            "skill": "R",
                            "reason": "Listed alongside Python as an alternative; Python is clearly the primary language and R appears as an either/or option."
                        },
                        {
                            "skill": "Storytelling / Executive communication",
                            "reason": "Soft skill listed under preferred qualifications; important but not a technical screening criterion."
                        },
                        {
                            "skill": "First-principles problem solving",
                            "reason": "Behavioral/cognitive preference listed under preferred qualifications; hard to screen technically and more of an HR padding item."
                        }
                    ]
                },
                "responsibilityHierarchy": [
                    {
                        "rank": 1,
                        "responsibility": "Design, implement, and analyze A/B experiments to evaluate product features and pricing strategies with statistical rigor",
                        "whatItMeans": "You own the full experiment lifecycle: define metrics, set up the test, run it, and write up causal conclusions for stakeholders.",
                        "whyCore": "It has its own dedicated section in the JD and is reinforced by the preferred qualification on causal inference; this is the signature skill that separates DS from DA at Uber.",
                        "resumeCoverage": "partial_match",
                        "bestEvidence": [
                            {
                                "company": "eBay Inc.",
                                "bullet": "Created LLM-powered A/B test analysis tool that auto-generates experiment summaries; improved workflow intelligence, reducing manual reporting time from 2 hours to 30 minutes.",
                                "reason": "Shows direct A/B test involvement and tooling, but the emphasis is on automation/reporting rather than designing or statistically analyzing experiments from scratch."
                            }
                        ],
                        "recommendedAction": "rewrite_existing_bullet"
                    },
                    {
                        "rank": 2,
                        "responsibility": "Mine large datasets to identify marketplace efficiency opportunities (EDA on massive, real-time data)",
                        "whatItMeans": "Daily SQL/Python querying of billion-row tables to find patterns, anomalies, or opportunities in rider/driver behavior.",
                        "whyCore": "First listed responsibility and foundational to all downstream modeling and experimentation work; the marketplace dataset scale is a key context clue.",
                        "resumeCoverage": "strong_match",
                        "bestEvidence": [
                            {
                                "company": "eBay Inc.",
                                "bullet": "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis.",
                                "reason": "Direct EDA on large-scale user behavior data leading to actionable business opportunities—mirrors the Uber use case closely."
                            },
                            {
                                "company": "Med-kick",
                                "bullet": "Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times; findings informed schedule changes that reduced average first-response time from 8 to 3 minutes.",
                                "reason": "Pattern analysis on operational data that drove real scheduling decisions; analogous to marketplace supply-demand analysis."
                            }
                        ],
                        "recommendedAction": "no_action"
                    },
                    {
                        "rank": 3,
                        "responsibility": "Build and maintain predictive models (demand forecasting, churn, LTV) in Python and collaborate with engineers on deployment",
                        "whatItMeans": "You write and iterate on ML models, validate them, and hand them off to engineers for production deployment.",
                        "whyCore": "Core Data Scientist output; differentiates this from a pure analyst role and is a basic qualification item.",
                        "resumeCoverage": "partial_match",
                        "bestEvidence": [
                            {
                                "company": "Goldman Sachs",
                                "bullet": "Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision identifying high-risk accounts for automated risk scoring.",
                                "reason": "Direct Scikit-learn model with feature engineering and a measurable outcome; the closest match to the model development requirement."
                            }
                        ],
                        "recommendedAction": "rewrite_existing_bullet"
                    },
                    {
                        "rank": 4,
                        "responsibility": "Create and automate SQL-based dashboards tracking KPIs for Product and Operations teams",
                        "whatItMeans": "Build living dashboards that stakeholders check daily; automate refresh and alerting so the team doesn't rely on manual pulls.",
                        "whyCore": "Dedicated responsibility section; dashboarding is a daily output and a direct stakeholder deliverable.",
                        "resumeCoverage": "strong_match",
                        "bestEvidence": [
                            {
                                "company": "USF Quantitative Club",
                                "bullet": "Partnered with quantitative analysts to build Grafana dashboards tracking data freshness and pipeline health metrics; reduced manual validation time by 35% and enabled same-day issue detection.",
                                "reason": "Demonstrates dashboard creation with measurable impact on team efficiency; same-day detection maps to the KPI monitoring use case."
                            },
                            {
                                "company": "Med-kick",
                                "bullet": "Built AWS data pipeline for remote-care records (500K+ monthly interactions) with daily refresh, enabling up-to-date analytics across patient call and monitoring data.",
                                "reason": "Shows automated data refresh enabling analytics, which supports the dashboard automation requirement."
                            }
                        ],
                        "recommendedAction": "rewrite_existing_bullet"
                    },
                    {
                        "rank": 5,
                        "responsibility": "Translate complex quantitative findings into executive-style summaries for non-technical stakeholders",
                        "whatItMeans": "Write and present concise, narrative-driven analyses that product managers and ops leaders can act on without needing to understand the math.",
                        "whyCore": "Explicitly called out as a responsibility and echoed in preferred qualifications under 'Communication'; critical for influencing product roadmap.",
                        "resumeCoverage": "partial_match",
                        "bestEvidence": [
                            {
                                "company": "eBay Inc.",
                                "bullet": "Partnered with product managers and engineers to analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis.",
                                "reason": "Shows cross-functional partnership with PMs and delivery of actionable findings, implying communication to non-technical audiences."
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
                            "eBay Inc.: 'analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL'",
                            "Goldman Sachs: 'Engineered automated reconciliation pipeline using Alteryx, Python and SQL'",
                            "Skills section: SQL listed explicitly"
                        ],
                        "recommendation": "keep",
                        "reason": "SQL is explicitly in the skills section and demonstrated in multiple roles with scale context."
                    },
                    {
                        "keyword": "Python",
                        "category": "language",
                        "tier": 1,
                        "status": "covered",
                        "evidence": [
                            "Skills section: Python listed",
                            "Goldman Sachs: 'Built payment risk classification model using Python and scikit-learn'",
                            "Med-kick: 'Analyzed call patterns from 500K+ monthly patient care interactions using Python'"
                        ],
                        "recommendation": "keep",
                        "reason": "Python is well-evidenced across multiple roles with data science and engineering contexts."
                    },
                    {
                        "keyword": "A/B Testing",
                        "category": "methodology",
                        "tier": 1,
                        "status": "covered_but_buried",
                        "evidence": [
                            "eBay Inc.: 'Created LLM-powered A/B test analysis tool that auto-generates experiment summaries'"
                        ],
                        "recommendation": "move_higher",
                        "reason": "Only one bullet mentions A/B testing and it focuses on the tooling automation rather than the statistical design and analysis; this is the #1 skill the JD screens for."
                    },
                    {
                        "keyword": "Hypothesis Testing",
                        "category": "methodology",
                        "tier": 1,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "add_to_skills_if_true",
                        "reason": "No resume evidence of hypothesis testing or p-value interpretation despite it being a basic qualification; the A/B testing bullet is about automation, not statistical testing."
                    },
                    {
                        "keyword": "Regression Analysis",
                        "category": "methodology",
                        "tier": 1,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "mention_in_bullet",
                        "reason": "No explicit mention of regression anywhere on the resume; basic qualification item that should be surfaced if used in any past role."
                    },
                    {
                        "keyword": "Probability / Statistical Knowledge",
                        "category": "methodology",
                        "tier": 1,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "mention_in_bullet",
                        "reason": "Core basic qualification; no bullets reference statistical methods, confidence intervals, or probabilistic reasoning."
                    },
                    {
                        "keyword": "Scikit-learn",
                        "category": "framework",
                        "tier": 1,
                        "status": "covered",
                        "evidence": [
                            "Goldman Sachs: 'Built payment risk classification model using Python and scikit-learn with feature engineering'"
                        ],
                        "recommendation": "keep",
                        "reason": "Directly mentioned in a strong context with a measurable outcome; matches the basic qualification exactly."
                    },
                    {
                        "keyword": "Predictive Modeling",
                        "category": "methodology",
                        "tier": 1,
                        "status": "covered_but_buried",
                        "evidence": [
                            "Goldman Sachs: 'Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision'"
                        ],
                        "recommendation": "move_higher",
                        "reason": "Only one model is mentioned and it's a classification model at Goldman Sachs; should be surfaced more prominently given it's a core DS deliverable."
                    },
                    {
                        "keyword": "Exploratory Data Analysis (EDA)",
                        "category": "methodology",
                        "tier": 1,
                        "status": "semantic_match",
                        "evidence": [
                            "eBay Inc.: 'analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis'",
                            "Med-kick: 'Analyzed call patterns from 500K+ monthly patient care interactions using Python to identify peak demand and wait times'"
                        ],
                        "recommendation": "mention_in_bullet",
                        "reason": "The work is clearly EDA but the term is never used; adding the phrase would help ATS and recruiter scanning."
                    },
                    {
                        "keyword": "Demand Forecasting",
                        "category": "domain",
                        "tier": 2,
                        "status": "semantic_match",
                        "evidence": [
                            "Med-kick: 'identify peak demand and wait times; findings informed schedule changes'"
                        ],
                        "recommendation": "mention_in_bullet",
                        "reason": "The Med-kick work is essentially demand pattern analysis; using 'demand forecasting' or 'demand analysis' language would better align with Uber's marketplace context."
                    },
                    {
                        "keyword": "Dashboarding / KPI Reporting",
                        "category": "tool",
                        "tier": 2,
                        "status": "covered",
                        "evidence": [
                            "USF Quantitative Club: 'build Grafana dashboards tracking data freshness and pipeline health metrics'",
                            "Med-kick: 'enabling up-to-date analytics across patient call and monitoring data'"
                        ],
                        "recommendation": "keep",
                        "reason": "Dashboarding is demonstrated; Grafana is the specific tool which is acceptable though Uber may use internal tools."
                    },
                    {
                        "keyword": "Spark",
                        "category": "tool",
                        "tier": 2,
                        "status": "covered",
                        "evidence": [
                            "Skills section: Spark listed",
                            "eBay Inc.: 'analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL'"
                        ],
                        "recommendation": "keep",
                        "reason": "Spark is both in skills and demonstrated in a large-scale production context at eBay; strong signal for big data processing."
                    },
                    {
                        "keyword": "Experimentation Design",
                        "category": "methodology",
                        "tier": 2,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "do_not_add_unless_true",
                        "reason": "No evidence of designing experiments from scratch—defining control/treatment groups, sample size calculations, or success metrics. The eBay bullet is about analysis tooling, not design."
                    },
                    {
                        "keyword": "Causal Inference",
                        "category": "methodology",
                        "tier": 2,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "do_not_add_unless_true",
                        "reason": "No resume evidence of causal methods (DiD, IV, propensity scoring); preferred qualification but genuinely absent."
                    },
                    {
                        "keyword": "XGBoost",
                        "category": "framework",
                        "tier": 2,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "add_to_skills_if_true",
                        "reason": "Listed as a basic qualification example alongside Scikit-learn; easy win if the candidate has used it in any project."
                    },
                    {
                        "keyword": "Feature Engineering",
                        "category": "methodology",
                        "tier": 2,
                        "status": "covered",
                        "evidence": [
                            "Goldman Sachs: 'Built payment risk classification model using Python and scikit-learn with feature engineering'"
                        ],
                        "recommendation": "keep",
                        "reason": "Explicitly mentioned in the Goldman Sachs bullet; relevant ML context."
                    },
                    {
                        "keyword": "Funnel Analysis",
                        "category": "methodology",
                        "tier": 2,
                        "status": "covered",
                        "evidence": [
                            "eBay Inc.: 'identified 3 conversion optimization opportunities through funnel analysis'"
                        ],
                        "recommendation": "keep",
                        "reason": "Directly relevant to marketplace and product analysis; good signal for product DS work."
                    },
                    {
                        "keyword": "Hive / Presto",
                        "category": "tool",
                        "tier": 2,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "do_not_add_unless_true",
                        "reason": "Preferred qualification for big data; not on resume but Spark SQL at eBay partially covers the intent."
                    },
                    {
                        "keyword": "Airflow",
                        "category": "tool",
                        "tier": 3,
                        "status": "covered",
                        "evidence": [
                            "USF Quantitative Club: 'ETL pipeline processing 120K+ daily financial records using Python, Postgres, and Airflow'",
                            "Skills section: Airflow listed"
                        ],
                        "recommendation": "keep",
                        "reason": "Good data engineering signal but lower priority for a DS role; keep it but don't lead with it."
                    },
                    {
                        "keyword": "Stakeholder Communication",
                        "category": "soft_skill",
                        "tier": 2,
                        "status": "semantic_match",
                        "evidence": [
                            "eBay Inc.: 'Partnered with product managers and engineers'",
                            "USF Quantitative Club: 'Partnered with quantitative analysts'"
                        ],
                        "recommendation": "mention_in_bullet",
                        "reason": "Cross-functional collaboration is evident but no bullet explicitly mentions translating findings for non-technical audiences, which is what the JD specifically asks for."
                    },
                    {
                        "keyword": "Marketplace / Supply-Demand Dynamics",
                        "category": "domain",
                        "tier": 2,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "do_not_add_unless_true",
                        "reason": "Core domain context for the team; no direct experience but the eBay and Med-kick supply-demand adjacent work could be framed toward this."
                    },
                    {
                        "keyword": "Window Functions (SQL)",
                        "category": "language",
                        "tier": 1,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "add_to_skills_if_true",
                        "reason": "JD specifically calls out window functions as a required SQL skill; no bullet or skill entry references them explicitly."
                    },
                    {
                        "keyword": "Complex SQL Joins",
                        "category": "language",
                        "tier": 1,
                        "status": "covered_but_buried",
                        "evidence": [
                            "USF Quantitative Club: 'optimized query performance for analysts running 500+ daily queries on 6 months of market data'",
                            "eBay Inc.: 'Resolved slow query performance issues by designing normalized MySQL schema with composite indexes'"
                        ],
                        "recommendation": "mention_in_bullet",
                        "reason": "Query optimization is implied but complex joins are never explicitly mentioned; the JD specifically calls them out as a screening requirement."
                    },
                    {
                        "keyword": "Storytelling with Data",
                        "category": "soft_skill",
                        "tier": 3,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "mention_in_bullet",
                        "reason": "Preferred qualification; should be demonstrated through bullet framing (e.g., 'presented findings to PM team') rather than listed as a skill."
                    },
                    {
                        "keyword": "R",
                        "category": "language",
                        "tier": 3,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "ignore_low_priority",
                        "reason": "Python is the primary language; R is an alternative and the candidate already covers Python strongly."
                    },
                    {
                        "keyword": "Churn Prediction",
                        "category": "domain",
                        "tier": 2,
                        "status": "missing",
                        "evidence": [],
                        "recommendation": "do_not_add_unless_true",
                        "reason": "Example model type in the JD; not evidenced on resume but could be a natural extension of existing ML work if applicable."
                    }
                ],
                "criticalGaps": [
                    {
                        "gap": "Statistical experimentation skills (hypothesis testing, p-values, experiment design)",
                        "type": "skill",
                        "tier": 1,
                        "reason": "A/B testing and statistical rigor are the #1 ranked responsibility in the JD and a basic qualification. The only A/B testing mention is about building an automation tool, not about designing or statistically analyzing experiments. No mention of hypothesis testing, confidence intervals, or p-values anywhere.",
                        "evidenceChecked": [
                            "eBay A/B test analysis tool bullet",
                            "Goldman Sachs model bullet",
                            "Skills section",
                            "All experience bullets"
                        ]
                    },
                    {
                        "gap": "SQL window functions",
                        "type": "skill",
                        "tier": 1,
                        "reason": "The JD explicitly calls out window functions as a required SQL competency—not just general SQL. No resume bullet or skill mentions window functions, which could be a specific ATS or recruiter screen.",
                        "evidenceChecked": [
                            "Skills section SQL entry",
                            "eBay Spark SQL bullet",
                            "Goldman Sachs SQL bullet",
                            "USF query optimization bullet"
                        ]
                    },
                    {
                        "gap": "Regression analysis / statistical modeling methods",
                        "type": "skill",
                        "tier": 1,
                        "reason": "Regression is listed as a basic qualification under statistical knowledge. The only model on the resume is a classification model (scikit-learn). No regression, time-series, or probabilistic modeling is mentioned.",
                        "evidenceChecked": [
                            "Goldman Sachs scikit-learn bullet",
                            "All experience bullets",
                            "Skills section"
                        ]
                    }
                ],
                "matchStrengths": [
                    {
                        "responsibility": "EDA on large-scale datasets to identify business opportunities",
                        "yourEvidence": "eBay Inc.: 'analyze product usage patterns across 10M+ eBay shopper sessions with Spark SQL; identified 3 conversion optimization opportunities through funnel analysis'",
                        "whyItMatches": "10M+ session scale mirrors Uber's data size; funnel analysis leading to actionable optimization opportunities is exactly the EDA output the JD describes."
                    },
                    {
                        "responsibility": "Big data processing with Spark",
                        "yourEvidence": "eBay Inc. Spark SQL on 10M+ sessions plus Spark in skills section",
                        "whyItMatches": "Directly satisfies the preferred qualification for big data tools and demonstrates production-scale usage, not just academic familiarity."
                    },
                    {
                        "responsibility": "Building predictive ML models with Scikit-learn",
                        "yourEvidence": "Goldman Sachs: 'Built payment risk classification model using Python and scikit-learn with feature engineering, achieving 78% precision'",
                        "whyItMatches": "Exact library match to the basic qualification; includes feature engineering and a measurable precision metric showing real model evaluation experience."
                    },
                    {
                        "responsibility": "Dashboarding and KPI tracking for stakeholders",
                        "yourEvidence": "USF Quantitative Club: 'Partnered with quantitative analysts to build Grafana dashboards tracking data freshness and pipeline health metrics; reduced manual validation time by 35%'",
                        "whyItMatches": "Demonstrates full dashboard ownership with a business impact metric; shows the candidate can build and deliver analytical products to internal teams."
                    },
                    {
                        "responsibility": "Analyzing demand patterns to inform operational decisions",
                        "yourEvidence": "Med-kick: 'identify peak demand and wait times; findings informed schedule changes that reduced average first-response time from 8 to 3 minutes'",
                        "whyItMatches": "Direct supply-demand analysis that drove real operational decisions—highly analogous to Uber's marketplace efficiency work."
                    }
                ],
                "riskAssessment": [
                    {
                        "risk": "Resume reads as a Data Engineer rather than a Data Scientist",
                        "severity": "high",
                        "mitigation": "The most prominent experience (USF Quantitative Club as Data Engineer) is dominated by ETL pipelines, schema design, and Kubernetes microservices. For a DS role, lead with eBay and Goldman Sachs, and reframe USF bullets around the analytical and modeling outcomes rather than infrastructure."
                    },
                    {
                        "risk": "A/B testing experience looks like tooling work, not statistical science",
                        "severity": "high",
                        "mitigation": "The eBay A/B testing bullet is about building an LLM automation tool, not about designing experiments or interpreting statistical results. Rewrite to emphasize the analytical methodology: what was tested, how success was defined, and what the statistical conclusion was."
                    },
                    {
                        "risk": "No visible statistical vocabulary anywhere on the resume",
                        "severity": "medium",
                        "mitigation": "Terms like hypothesis testing, confidence intervals, p-values, significance, and regression do not appear in any bullet. Sprinkle statistically grounded language into at least 2-3 bullets where the underlying work was analytical, even if the original framing was engineering."
                    },
                    {
                        "risk": "Heavy infrastructure/engineering framing may confuse screeners about the candidate's primary identity",
                        "severity": "medium",
                        "mitigation": "Docker, Kubernetes, Redis, Django, Go, and AWS Fargate are prominent skills that signal SWE/DE identity. For this application, move DS-relevant skills (Python, SQL, Scikit-learn, Spark) to the top of the skills section and deprioritize pure infrastructure tools."
                    }
                ],
                "recommendedNextActions": [
                    {
                        "priority": 1,
                        "action": "Rewrite the eBay A/B testing bullet to show statistical experiment design and analysis, not just the automation tool you built around it",
                        "reason": "A/B testing is the #1 ranked responsibility in the JD and your only evidence is framed as a tooling project; a screener will not credit it as experimentation experience."
                    },
                    {
                        "priority": 2,
                        "action": "Add SQL window functions to your skills section or mention them explicitly in a SQL-heavy bullet",
                        "reason": "The JD calls out window functions by name as a required SQL competency; their absence is a specific gap that ATS and technical screeners will notice."
                    },
                    {
                        "priority": 3,
                        "action": "Add a bullet or reframe an existing one to include statistical vocabulary (hypothesis testing, regression, confidence intervals)",
                        "reason": "Statistical knowledge is a basic qualification and no resume evidence demonstrates it; the gap will be visible to any technical recruiter reviewing the profile."
                    },
                    {
                        "priority": 4,
                        "action": "Reorder your experience to lead with eBay and Goldman Sachs before USF Quantitative Club",
                        "reason": "The Data Engineer role at USF is your current/most recent experience but it signals the wrong archetype; eBay and Goldman are much closer to the DS work Uber is hiring for."
                    },
                    {
                        "priority": 5,
                        "action": "Add XGBoost to your skills section if you have used it",
                        "reason": "The JD lists it by name as a basic qualification example alongside Scikit-learn; it's a fast credibility signal with minimal resume space required."
                    },
                    {
                        "priority": 6,
                        "action": "Reframe the Med-kick demand analysis bullet using marketplace or demand forecasting language",
                        "reason": "The work is directly analogous to Uber's supply-demand balancing; using terminology like 'demand pattern analysis' or 'peak demand forecasting' would create a stronger semantic match."
                    }
                ]
            }
        )





        // 3. Now we gotta feed the AI both and got the result back

        // 3.1 Build the prompt for the Claude AI
        const prompt = `
        You are a Senior Technical Recruiter and Resume Positioning Analyst.

        Compare this job description against this resume structured data.

        Rules:
        - Ignore location, visa, education, degree type, and logistics.
        - Focus only on work, responsibilities, tools, skills, and business needs.
        - Do not rewrite bullets yet.
        - Do not invent experience.
        - Use exact resume evidence when claiming a match.

        JOB DESCRIPTION:
        ${jobDescription}

        RESUME STRUCTURED DATA:
        ${JSON.stringify(structuredData, null, 2)}
        `;

        // define the output the schema for Claude
        // Claude must return exactly like the properties
        const resumeAnalysisSchema = {
            type: "object",
            additionalProperties: false,
            properties: {
                jobSummary: {
                    type: "string",
                    description:
                        "One concise sentence explaining what this role actually needs, focusing on work and skills rather than logistics.",
                },

                roleArchetype: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        label: {
                            type: "string",
                            description:
                                "The true role type based on the actual work, such as BI / Reporting Analyst, Data Analyst, Data Engineer, Software Engineer, ML / AI Engineer, Product Analyst, Operations Analyst, or Other.",
                        },
                        reason: {
                            type: "string",
                            description:
                                "Explain why this archetype fits based on the JD responsibilities, tools, team needs, and day-to-day work.",
                        },
                    },
                    required: ["label", "reason"],
                },

                techHierarchy: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        tier1: {
                            type: "array",
                            description:
                                "Daily-driver skills/tools. The role likely cannot be done without these on Day 1.",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    skill: {
                                        type: "string",
                                        description: "A Tier 1 technical skill, tool, platform, or method.",
                                    },
                                    reason: {
                                        type: "string",
                                        description:
                                            "Why this skill belongs in Tier 1 based on JD context clues, not just keyword frequency.",
                                    },
                                },
                                required: ["skill", "reason"],
                            },
                        },

                        tier2: {
                            type: "array",
                            description:
                                "Differentiator skills/tools. Important, but not the core daily workflow.",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    skill: {
                                        type: "string",
                                        description: "A Tier 2 technical skill, tool, platform, or method.",
                                    },
                                    reason: {
                                        type: "string",
                                        description:
                                            "Why this skill belongs in Tier 2 instead of Tier 1 or Tier 3.",
                                    },
                                },
                                required: ["skill", "reason"],
                            },
                        },

                        tier3: {
                            type: "array",
                            description:
                                "Wishlist skills/tools. Nice-to-have, occasional, generic, or HR-padding items.",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    skill: {
                                        type: "string",
                                        description: "A Tier 3 technical skill, tool, platform, or method.",
                                    },
                                    reason: {
                                        type: "string",
                                        description:
                                            "Why this skill is lower priority based on the JD context.",
                                    },
                                },
                                required: ["skill", "reason"],
                            },
                        },
                    },
                    required: ["tier1", "tier2", "tier3"],
                },

                responsibilityHierarchy: {
                    type: "array",
                    description:
                        "Top responsibilities ranked by importance based on what the role actually does.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            rank: {
                                type: "number",
                                description: "Importance rank, starting from 1.",
                            },
                            responsibility: {
                                type: "string",
                                description:
                                    "A core responsibility from the JD, rewritten clearly and specifically.",
                            },
                            whatItMeans: {
                                type: "string",
                                description:
                                    "Plain-English explanation of what this responsibility means day-to-day.",
                            },
                            whyCore: {
                                type: "string",
                                description:
                                    "Why this responsibility is central to the role based on JD signals.",
                            },
                            resumeCoverage: {
                                type: "string",
                                enum: [
                                    "strong_match",
                                    "partial_match",
                                    "covered_but_buried",
                                    "semantic_match",
                                    "missing",
                                ],
                                description:
                                    "How well the selected resume supports this responsibility.",
                            },
                            bestEvidence: {
                                type: "array",
                                description:
                                    "Exact resume evidence supporting this responsibility. Empty array if missing.",
                                items: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: {
                                        company: {
                                            type: "string",
                                            description:
                                                "Company, project, or section where the evidence appears.",
                                        },
                                        bullet: {
                                            type: "string",
                                            description:
                                                "Original bullet or resume evidence. Do not invent or rewrite.",
                                        },
                                        reason: {
                                            type: "string",
                                            description:
                                                "Why this evidence supports the responsibility.",
                                        },
                                    },
                                    required: ["company", "bullet", "reason"],
                                },
                            },
                            recommendedAction: {
                                type: "string",
                                enum: [
                                    "no_action",
                                    "move_existing_bullet_higher",
                                    "rewrite_existing_bullet",
                                    "add_keyword_to_skills_if_true",
                                    "mention_in_bullet",
                                    "do_not_claim",
                                ],
                                description:
                                    "Best next action based on the resume's coverage of this responsibility.",
                            },
                        },
                        required: [
                            "rank",
                            "responsibility",
                            "whatItMeans",
                            "whyCore",
                            "resumeCoverage",
                            "bestEvidence",
                            "recommendedAction",
                        ],
                    },
                },

                keywordCoverage: {
                    type: "array",
                    description:
                        "Meaningful technical skills, tools, platforms, frameworks, methodologies, business processes, and domain keywords from the JD.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            keyword: {
                                type: "string",
                                description:
                                    "A meaningful keyword, tool, skill, platform, method, domain phrase, or business-process phrase from the JD.",
                            },
                            category: {
                                type: "string",
                                enum: [
                                    "tool",
                                    "language",
                                    "platform",
                                    "framework",
                                    "methodology",
                                    "domain",
                                    "business_process",
                                    "soft_skill",
                                    "other",
                                ],
                                description: "Category of the keyword.",
                            },
                            tier: {
                                type: "number",
                                enum: [1, 2, 3],
                                description:
                                    "1 = daily driver, 2 = differentiator, 3 = wishlist.",
                            },
                            status: {
                                type: "string",
                                enum: [
                                    "covered",
                                    "covered_but_buried",
                                    "semantic_match",
                                    "missing",
                                ],
                                description:
                                    "Whether the resume covers this keyword exactly, indirectly, weakly, or not at all.",
                            },
                            evidence: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                description:
                                    "Exact resume locations, bullets, skills, or project evidence where this keyword/concept appears. Empty if missing.",
                            },
                            recommendation: {
                                type: "string",
                                enum: [
                                    "keep",
                                    "move_higher",
                                    "add_to_skills_if_true",
                                    "mention_in_bullet",
                                    "do_not_add_unless_true",
                                    "ignore_low_priority",
                                ],
                                description:
                                    "What the user should do with this keyword when tailoring the resume.",
                            },
                            reason: {
                                type: "string",
                                description:
                                    "Why this coverage status and recommendation were chosen.",
                            },
                        },
                        required: [
                            "keyword",
                            "category",
                            "tier",
                            "status",
                            "evidence",
                            "recommendation",
                            "reason",
                        ],
                    },
                },

                criticalGaps: {
                    type: "array",
                    description:
                        "Only true Tier 1 gaps that are absent from the resume and could hurt screening.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            gap: {
                                type: "string",
                                description:
                                    "The missing Tier 1 skill, tool, domain, or responsibility.",
                            },
                            type: {
                                type: "string",
                                enum: ["skill", "responsibility", "domain", "tool"],
                                description: "Type of critical gap.",
                            },
                            tier: {
                                type: "number",
                                enum: [1],
                                description:
                                    "Critical gaps must always be Tier 1.",
                            },
                            reason: {
                                type: "string",
                                description:
                                    "Why this is a serious gap, not just a minor keyword issue.",
                            },
                            evidenceChecked: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                description:
                                    "Resume sections, bullets, or skills checked before deciding this is missing.",
                            },
                        },
                        required: ["gap", "type", "tier", "reason", "evidenceChecked"],
                    },
                },

                matchStrengths: {
                    type: "array",
                    description:
                        "Strongest ways this resume already matches the JD's core responsibilities.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            responsibility: {
                                type: "string",
                                description:
                                    "JD responsibility or business need that the candidate matches.",
                            },
                            yourEvidence: {
                                type: "string",
                                description:
                                    "Specific resume evidence proving the match.",
                            },
                            whyItMatches: {
                                type: "string",
                                description:
                                    "Why this evidence makes the candidate strong or safe for the role.",
                            },
                        },
                        required: ["responsibility", "yourEvidence", "whyItMatches"],
                    },
                },

                riskAssessment: {
                    type: "array",
                    description:
                        "Positioning risks where the resume may be framed incorrectly for this JD.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            risk: {
                                type: "string",
                                description:
                                    "A specific positioning risk for this resume against this JD.",
                            },
                            severity: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                                description:
                                    "How serious the positioning risk is.",
                            },
                            mitigation: {
                                type: "string",
                                description:
                                    "How the user should reduce this risk when tailoring the resume.",
                            },
                        },
                        required: ["risk", "severity", "mitigation"],
                    },
                },

                recommendedNextActions: {
                    type: "array",
                    description:
                        "Prioritized next steps the user should take after reading this analysis.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            priority: {
                                type: "number",
                                description: "Action priority, starting from 1.",
                            },
                            action: {
                                type: "string",
                                description:
                                    "A practical next action. Do not write a full resume bullet here.",
                            },
                            reason: {
                                type: "string",
                                description:
                                    "Why this action matters for this JD/resume comparison.",
                            },
                        },
                        required: ["priority", "action", "reason"],
                    },
                },
            },

            required: [
                "jobSummary",
                "roleArchetype",
                "techHierarchy",
                "responsibilityHierarchy",
                "keywordCoverage",
                "criticalGaps",
                "matchStrengths",
                "riskAssessment",
                "recommendedNextActions",
            ],
        } as const;

        const response = await anthropicClient.messages.parse({
            model: "claude-sonnet-4-6",
            max_tokens: 6000,
            output_config: {
                format: jsonSchemaOutputFormat(resumeAnalysisSchema),
            },
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // extract the parsed output from claude
        if (response.stop_reason == "refusal") {
            return NextResponse.json({ error: "Claude detect violation message and refuse to answer " })
        }


        return NextResponse.json(response.parsed_output, { status: 200 });

    } catch (error) {
        console.error("encounter error when comparing resume with jd:", error)
        return NextResponse.json({ error: "Encounter error when comparing resume with jd" }, { status: 500 })
    }


}
