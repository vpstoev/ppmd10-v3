/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced from PPMD_Website_Content_Template_V4.xlsm by
 * `node scripts/import-content.mjs`. Edit the workbook and re-run the
 * script; anything typed here is lost on the next import.
 *
 * This module is the site's own copy of the content. The workbook is
 * never read at runtime and does not need to exist for the site to build
 * or to run.
 *
 * A field that is absent was absent — or was template filler — in the
 * workbook. Every surface treats a missing field as "do not show this
 * line", so nothing here is padded to keep a shape.
 */

export interface WorkbookHeroLine {
  key: string
  scene?: string
  text?: string
  supporting?: string
}

export interface WorkbookCapability {
  id: string
  displayOrder: number
  name?: string
  headline?: string
  description?: string
  line?: string
  accent?: string
}

export interface WorkbookLeader {
  id: string
  displayOrder: number
  profileType?: string
  name?: string
  title?: string
  unit?: string
  statement?: string
  statementEmphasis?: string[]
  shortBio?: string
  shortBioEmphasis?: string[]
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  quote?: string
  photoFilename?: string
  photoAlt?: string
  photoPosition?: string
  accent?: string
}

export interface WorkbookTeamFact {
  value?: string
  label?: string
}

export interface WorkbookTeam {
  id: string
  displayOrder: number
  name?: string
  professionalsCount?: number
  headline?: string
  description?: string
  facts: WorkbookTeamFact[]
  distinctiveFact?: string
  accent?: string
}

export interface WorkbookPerson {
  id: string
  displayOrder: number
  name?: string
  role?: string
  team?: string
  isLeadership: boolean
  leadershipOrder?: number
  photoFilename?: string
  photoAlt?: string
  photoPosition?: string
  shortBio?: string
  shortBioEmphasis?: string[]
  keyContribution?: string
  keyContributionEmphasis?: string[]
  personalFact?: string
  personalFactEmphasis?: string[]
  accent?: string
}

export interface WorkbookMilestone {
  id: string
  displayOrder: number
  /** The workbook's own `year` column — never derived from the id. */
  year: string
  title?: string
  shortDescription?: string
  detailedDescription?: string
  accent?: string
}

export interface WorkbookProject {
  id: string
  displayOrder: number
  name?: string
  category?: string
  description?: string
  impact?: string
  accent?: string
}

export interface WorkbookFocusArea {
  id: string
  displayOrder: number
  title?: string
  line?: string
  detailedDescription?: string
  accent?: string
}

export interface WorkbookVoice {
  id: string
  displayOrder: number
  /** The full approved quote, exactly as written. */
  quote: string
  emphasis: string[]
  name?: string
  role?: string
  unit?: string
  isHighlight: boolean
  photoFilename?: string
}

export interface WorkbookClosingLine {
  key: string
  text?: string
  supporting?: string
}

export interface WorkbookNavItem {
  id: string
  displayOrder: number
  label?: string
  anchor?: string
  showWhenProjectsDisabled: boolean
}

export const WB_HERO: WorkbookHeroLine[] = [
  {
    "key": "hero.identity.title",
    "scene": "Opening",
    "text": "PPMD",
    "supporting": "Project & Processes Management Department"
  },
  {
    "key": "hero.anniversary.label",
    "scene": "Anniversary",
    "text": "10TH ANNIVERSARY",
    "supporting": "2016—2026"
  },
  {
    "key": "hero.future.title",
    "scene": "Final Hero",
    "text": "BUILT FOR WHAT COMES NEXT.",
    "supporting": "Project & Processes Management Department"
  },
  {
    "key": "hero.scroll_cue",
    "scene": "Opening",
    "text": "SCROLL TO EXPLORE OUR STORY"
  }
]

export const WB_CAPABILITIES: WorkbookCapability[] = [
  {
    "id": "CAP-01",
    "displayOrder": 1,
    "name": "Project Delivery",
    "headline": "STRATEGY, SET IN MOTION",
    "description": "We turn strategic priorities into coordinated action—aligning people, decisions and delivery to move complex initiatives forward with clarity and control.",
    "line": "Turning ambition into measurable progress.",
    "accent": "Coral rose"
  },
  {
    "id": "CAP-02",
    "displayOrder": 2,
    "name": "Process Excellence",
    "headline": "BETTER, BY DESIGN",
    "description": "We simplify and strengthen how work gets done—designing processes that create clarity, consistency and efficiency at scale.",
    "line": "Smarter processes. Stronger performance.",
    "accent": "Champagne"
  },
  {
    "id": "CAP-03",
    "displayOrder": 3,
    "name": "Business Transformation",
    "headline": "CHANGE, MADE REAL",
    "description": "We connect business needs, technology and people to move transformation beyond plans and turn it into outcomes that work in practice.",
    "line": "Change that works. Value that lasts.",
    "accent": "Electric violet"
  },
  {
    "id": "CAP-04",
    "displayOrder": 4,
    "name": "Testing & Quality",
    "headline": "CONFIDENCE, BUILT IN",
    "description": "We challenge, validate and strengthen every solution before release—reducing risk and protecting the customer experience when it matters most.",
    "line": "Tested with rigour. Ready with confidence.",
    "accent": "Ice blue"
  },
  {
    "id": "CAP-CLOSE",
    "displayOrder": 5,
    "name": "Closing",
    "headline": "DIFFERENT EXPERTISE. COMMON GOAL",
    "description": "One department. Four connected capabilities. Working as one to bring structure, quality and momentum to A1’s most complex initiatives.",
    "line": "One team. Built to move A1 forward.",
    "accent": "Iridescent"
  }
]

export const WB_LEADERSHIP: WorkbookLeader[] = [
  {
    "id": "senior-director",
    "displayOrder": 1,
    "profileType": "Senior Director",
    "name": "Elitsa Shopova",
    "title": "Senior Director, Customer Experience Area",
    "unit": "Customer Experience Area",
    "statement": "Elitsa turns customer focus into organisational direction—aligning people, priorities and decisions around one shared ambition: to go beyond expectations and create the best possible experience for every A1 customer.",
    "statementEmphasis": [
      "one shared ambition: to go beyond expectations and create the best possible experience for every A1 customer."
    ],
    "shortBio": "Elitsa combines strategic clarity with a deep understanding of people. She sees beyond immediate complexity, turning perspective into direction and optimism into momentum while keeping the organisation focused on what matters most. Open-minded and adaptable, she changes course when circumstances demand it without losing sight of purpose, culture or ambition.",
    "shortBioEmphasis": [
      "sees beyond immediate complexity, turning perspective into direction and optimism into momentum while keeping the organisation focused on what matters most."
    ],
    "keyContribution": "Elitsa’s impact extends beyond the business outcomes she delivers to the leadership capacity she builds around her. She creates an environment where success is recognised, mistakes become opportunities to grow, and accountability means not only taking responsibility but acting to make things right. By sharing the wider context and entrusting people with genuine authority and ownership, she develops leaders who think independently, decide with confidence and remain aligned with the organisation’s culture. In the moments of greatest pressure, her composure, clarity and judgement set the standard for those around her.",
    "keyContributionEmphasis": [
      "She creates an environment where success is recognised, mistakes become opportunities to grow, and accountability means not only taking responsibility but acting to make things right.",
      "entrusting people with genuine authority and ownership, she develops leaders who think independently, decide with confidence and remain aligned with the organisation’s culture."
    ],
    "personalFact": "At the heart of Elitsa’s world is her family, bringing meaning and perspective to every achievement. Her interest in holistic wellbeing reflects a broader belief that lasting strength comes from balance, self-awareness and a constructive mindset. For Elitsa, resilience is more than the ability to recover—it is the conscious decision to keep moving forward.",
    "personalFactEmphasis": [
      "heart of Elitsa’s world is her family, bringing meaning and perspective to every achievement.",
      "For Elitsa, resilience",
      "is",
      "the conscious decision to keep moving forward."
    ],
    "photoPosition": "center",
    "accent": "Champagne"
  },
  {
    "id": "department-head",
    "displayOrder": 2,
    "profileType": "Senior Manager",
    "name": "Stefan Tsekov",
    "title": "Senior Manager, Project & Processes Management Department",
    "unit": "Project & Processes Management Department",
    "statement": "For a decade, Stefan has led PPMD with one enduring conviction: when people are trusted to act, supported when it matters and united by purpose, they do more than deliver—they rise to the toughest challenges together.",
    "statementEmphasis": [
      "when people are trusted to act, supported when it matters and united by purpose",
      "the toughest challenges together."
    ],
    "shortBio": "Over ten years, Stefan has shaped PPMD through leadership grounded in trust, support and genuine care for people. He gives teams the confidence to face difficult moments, the perspective to find a path forward and the certainty that their leader stands firmly behind them.",
    "shortBioEmphasis": [
      "leadership grounded in trust, support and genuine care for people.",
      "confidence",
      "perspective to find a path forward",
      "their leader stands firmly behind them."
    ],
    "keyContribution": "Stefan brings the judgement of someone who has navigated complexity first-hand. When challenges arise, he cuts through the noise, brings the real issue into focus and turns uncertainty into practical direction. His guidance is clear, his support is unwavering, and his commitment to the department has made him the leader colleagues instinctively turn to when the way forward is not obvious.",
    "keyContributionEmphasis": [
      "he cuts through the noise, brings the real issue into focus and turns uncertainty into practical direction. His guidance is clear, his support is unwavering, and his commitment to the department has made him the leader",
      "colleagues instinctively turn to"
    ],
    "personalFact": "Stefan and his family rarely choose the same destination twice, with every journey offering somewhere new to discover together. Closer to Sofia, he finds a different rhythm in caring for his village home and garden. Wherever the road takes him, one loyalty remains constant: his passion for football—and especially for CSKA.",
    "personalFactEmphasis": [
      "every journey offering somewhere new to discover together.",
      "different rhythm in caring for his village home and garden.",
      "his passion for football—and especially for CSKA."
    ],
    "photoPosition": "center",
    "accent": "Coral"
  }
]

export const WB_TEAMS: WorkbookTeam[] = [
  {
    "id": "PM",
    "displayOrder": 1,
    "name": "Project Management Team",
    "professionalsCount": 15,
    "headline": "TURNING COMPLEXITY INTO PROGRESS",
    "description": "Bringing the structure, coordination and momentum that keep complex initiatives moving—from the first decision to final delivery.",
    "facts": [
      {
        "value": "> 300 successful project deliveries\r\n> 64 ongping projects\r\n> 21 largest ICT customers overseen",
        "label": "PROJECTS DELIVERED"
      },
      {
        "value": "15 PM certificates with several more to be obtained later this year.",
        "label": "PROFESSIONAL CERTIFICATIONS"
      },
      {
        "value": "10",
        "label": "YEARS OF COMBINED EXPERIENCE"
      }
    ],
    "distinctiveFact": "From strategic programmes to customer-facing delivery.",
    "accent": "Coral rose"
  },
  {
    "id": "PROCESSES",
    "displayOrder": 2,
    "name": "Process & Procedures Management Team",
    "professionalsCount": 11,
    "headline": "DESIGNING BETTER WAYS TO WORK",
    "description": "Shaping the processes behind everyday work—making them clearer, more consistent and ready to scale.",
    "facts": [
      {
        "value": "10",
        "label": "YEARS OF COMBINED EXPERIENCE"
      }
    ],
    "distinctiveFact": "Turning complexity into repeatable ways of working.",
    "accent": "Champagne"
  },
  {
    "id": "BPT",
    "displayOrder": 3,
    "name": "BPT & Testing Team",
    "professionalsCount": 7,
    "headline": "MAKING CHANGE READY",
    "description": "Testing processes and solutions before they reach the customer—exposing risks early and building confidence in every release.",
    "facts": [
      {
        "value": "10",
        "label": "YEARS OF COMBINED EXPERIENCE"
      }
    ],
    "distinctiveFact": "Finding issues before they become customer issues.",
    "accent": "Ice blue"
  }
]

export const WB_PEOPLE: WorkbookPerson[] = [
  {
    "id": "PM-001",
    "displayOrder": 1,
    "name": "Dragomir Apostolov",
    "role": "Team Leader",
    "team": "Project Management Team",
    "isLeadership": true,
    "leadershipOrder": 1,
    "photoPosition": "center",
    "shortBio": "Drago has the patience to understand complexity and the determination to outlast it. His engineering background gives him a methodical way of thinking, while his strong sense of responsibility keeps him fully invested until the work is truly finished.",
    "shortBioEmphasis": [
      "patience to understand complexity and the determination to outlast it.",
      "fully invested until the work is truly finished"
    ],
    "keyContribution": "Dragomir’s leadership gives people room to act, together with the confidence of knowing that support is there when the pressure rises. Across major corporate initiatives, he brings structure to difficult decisions, steadiness through setbacks and a shared sense of purpose that keeps the team united all the way to delivery.",
    "keyContributionEmphasis": [
      "he brings structure to difficult decisions, steadiness through setbacks and a shared sense of purpose that keeps the team united"
    ],
    "personalFact": "There is a natural connection between Dragomir’s work and his passion for Japanese martial arts: both demand discipline, precision and progress earned through practice. It is a pursuit that reflects his respect for focus, resilience and mastery built over time.",
    "personalFactEmphasis": [
      "discipline, precision and progress earned through practice.",
      "his respect for focus, resilience and mastery built over time"
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-001",
    "displayOrder": 1,
    "name": "Desislava Mihaylova",
    "role": "Team Leader",
    "team": "Process & Procedures Management Team",
    "isLeadership": true,
    "leadershipOrder": 1,
    "photoPosition": "center",
    "shortBio": "Desi leads with confidence grounded in deep expertise and a strong sense of professional responsibility. Independent, dependable and highly collaborative, she brings sound judgement and consistency to both her work and the relationships she builds across the organisation.",
    "shortBioEmphasis": [
      "leads with confidence",
      "deep",
      "expertise",
      "strong",
      "sense",
      "professional",
      "responsibility",
      "Independent",
      "dependable",
      "highly collaborative",
      "she brings sound judgement and consistency"
    ],
    "keyContribution": "Desi brings together the authority of deep expertise and the dependability of someone who can be trusted to see things through. She leads with professionalism, works with confidence and independence, and builds constructive relationships across organisational boundaries. Her strength lies not only in knowing her field in depth, but in applying that knowledge with consistency, sound judgement and respect for the people around her.",
    "keyContributionEmphasis": [
      "authority of deep expertise",
      "dependability of someone who can be trusted to see things through.",
      "leads with professionalism,",
      "but in applying that knowledge with consistency, sound judgement and respect for the people around her."
    ],
    "personalFact": "Beyond work, Desi's world revolves around the family she cares for deeply, with an especially close bond between her and her daughter. She values the time they spend travelling and discovering new places together, as well as the warmth of everyday life at home. Their dog is very much part of that family circle — a much-loved companion with a special place in her heart.",
    "personalFactEmphasis": [
      "around the family she cares for deeply,",
      "values the time they spend travelling and discovering new places together",
      "as well as the warmth of everyday life at home."
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-001",
    "displayOrder": 1,
    "name": "Ivan Rumenov",
    "role": "Team Leader",
    "team": "BPT & Testing Team",
    "isLeadership": true,
    "leadershipOrder": 1,
    "photoPosition": "center",
    "shortBio": "Ivan is real example of combination between sound judgement, practical thinking and a natural instinct for what each situation requires.",
    "shortBioEmphasis": [
      "combination between sound judgement, practical thinking",
      "natural instinct",
      "each situation requires."
    ],
    "keyContribution": "Ivan is a driving force behind the team’s progress—always ready to provide support, take on a challenge or simply make things happen. He coordinates the team’s activities, supports his colleagues and steps in whenever an extra pair of hands, a good idea or a timely decision is needed. His ability to balance people, priorities and tasks makes him a central figure within the team—the person colleagues naturally turn to when they need support, perspective or decisive action.",
    "keyContributionEmphasis": [
      "driving force behind the team’s progress",
      "provide",
      "support",
      "steps in whenever an extra pair of hands, a good idea or a timely decision is needed. His ability to balance people, priorities and tasks makes him a central figure within the team",
      "naturally turn to when they need support, perspective or decisive action."
    ],
    "personalFact": "Away from work, Ivan is a devoted football fan, a dog lover and a keen home-improvement enthusiast. He enjoys travelling and spending quality time with his family, and is always looking for the next way to make his home even better. \r\nHe also takes great pride in speaking French and is a true Francophile at heart.",
    "personalFactEmphasis": [
      "Away from work, Ivan is a devoted football fan, a dog lover and a keen home-improvement enthusiast",
      "He also takes great pride in speaking French and is a true Francophile at heart."
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-002",
    "displayOrder": 2,
    "name": "Petar Rusinov",
    "role": "Program Manager",
    "team": "Project Management Team",
    "isLeadership": true,
    "leadershipOrder": 2,
    "photoPosition": "center",
    "shortBio": "Pepi is a natural organiser with a strong instinct for turning plans into coordinated action. He sees what needs to happen, gives the work a clear structure and keeps attention firmly on the outcome. Even when many people and moving parts are involved, he maintains momentum and a consistently high standard of execution.",
    "shortBioEmphasis": [
      "natural organiser with a strong instinct for turning plans into coordinated action",
      "he maintains momentum and a consistently high standard of execution."
    ],
    "keyContribution": "Pepi’s leadership creates more than alignment — it creates belonging. He gives each person a clear place in the bigger picture and helps individual contributions become part of a coordinated whole. Approachable when support is needed and decisive when direction is required, he keeps teams connected, focused and moving towards results they can genuinely be proud of.",
    "keyContributionEmphasis": [
      "creates belonging.",
      "helps individual contributions become part of a coordinated whole.",
      "keeps teams connected, focused and moving",
      "towards results they can genuinely be proud of."
    ],
    "personalFact": "Pepi enjoys being surrounded by good company, laughter and engaging conversation. Away from work, his interests range from board games and football — particularly CSKA and Liverpool — to BMW and the latest developments in technology. Above all, however, Gabi and Raya, will always be  the centre of his world.",
    "personalFactEmphasis": [
      "Pepi enjoys being surrounded by good company, laughter and engaging conversation.",
      "Above all, however, Gabi and Raya, will always be  the centre of his world."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-002",
    "displayOrder": 2,
    "name": "Anna Ilieva",
    "role": "Knowledge Management Manager",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Ani combines a naturally positive presence with the reliability of someone others can confidently depend on. Cheerful, approachable and committed to seeing every task through, she brings both energy and a strong sense of responsibility to the way she works with others.",
    "shortBioEmphasis": [
      "naturally positive presence",
      "reliability of someone others can confidently depend on",
      "Cheerful, approachable and committed"
    ],
    "keyContribution": "Ani has led the work of turning organisational knowledge into a resource that people can access, understand and use. Through dependable execution and consistent follow-through, she has helped give the function both structure and direction, ensuring that valuable information can be preserved and shared across the organisation.",
    "keyContributionEmphasis": [
      "turning organisational knowledge into a resource that people can access, understand and use.",
      "dependable execution and consistent follow-through,",
      "give the function both structure and direction"
    ],
    "personalFact": "Ani has always enjoyed travelling and discovering new places, but recent months have brought the beginning of an entirely new journey. Having recently become a mother, she is now embracing a new chapter centred around her growing family.",
    "personalFactEmphasis": [
      "enjoyed travelling and discovering new places",
      "have brought the beginning of an entirely new journey",
      "she is now embracing a new chapter centred around her growing family."
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-002",
    "displayOrder": 2,
    "name": "Kaloyan Dzhokin",
    "role": "Expert",
    "team": "BPT & Testing Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Analytical and observant, Kaloyan has a natural instinct for getting to the heart of a problem.",
    "shortBioEmphasis": [
      "Analytical and observant,",
      "getting to the heart of a problem."
    ],
    "keyContribution": "Kaloyan was among the first testing proffesionals to join the team and remains one of its most knowledgeable experts. His broad experience across different testing activities brings precision, consistency and a deep understanding of the overall process. With his sharp eye for detail, he often spots what others might overlook.",
    "keyContributionEmphasis": [
      "remains one of its most knowledgeable experts.",
      "broad experience across different testing activities brings precision, consistency",
      "deep understanding of the overall process."
    ],
    "personalFact": "Kaloyan leads an active, healthy lifestyle and is a devoted football and cat fan. Whenever possible, he heads to the Greek coast to relax and recharge by the sea.",
    "personalFactEmphasis": [
      "Kaloyan leads an active, healthy lifestyle and is a devoted football and cat fan.",
      "Greek coast to relax and recharge by the sea."
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-003",
    "displayOrder": 3,
    "name": "Valentin Stoev",
    "role": "Program Manager",
    "team": "Project Management Team",
    "isLeadership": true,
    "leadershipOrder": 3,
    "photoPosition": "center",
    "shortBio": "Always ready to lend a hand, Valentin brings genuine involvement and close attention to detail to every task he takes on. He sets deliberately high standards - especially for himself - and makes sure that the same level of ownership and commitment is maintained from those he works with.",
    "shortBioEmphasis": [
      "Always ready to lend a hand, Valentin brings genuine involvement and close attention to detail",
      "He sets deliberately high standards - especially for himself"
    ],
    "keyContribution": "Valio is one of the team's founding members. Over the years, he has not only grown into an outstanding professional and manager, but has also actively mentored every single colleague, offering guidance and clarity through complex challenges. Recognized across the organization as a top subject-matter expert in multiple domains, he is frequently sought out for assistance even beyond his assigned projects.",
    "keyContributionEmphasis": [
      "actively mentored every single colleague, offering guidance and clarity through complex challenges. Recognized across the organization",
      "frequently sought out for assistance even beyond his assigned projects."
    ],
    "personalFact": "Valio rarely does anything half-heartedly. Whether planning a new journey, exploring new technology or refining a visual idea, his curiosity quickly becomes a search for the best possible experience. Yet those experiences matter most when shared with the people closest to him — he is happiest surrounded by those he trusts and cares about, with an unmistakable soft spot for animals completing the picture.",
    "personalFactEmphasis": [
      "Valio rarely does anything half-heartedly.",
      "those experiences matter most when shared with the people closest to him",
      "unmistakable soft spot for animals completing the picture."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-003",
    "displayOrder": 3,
    "name": "Tatyana Stoyneva",
    "role": "Senior Expert",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Tatyana combines strong professional expertise with consistently high standards of execution. Approachable and easy to work with, she communicates clearly, provides constructive feedback and can be relied upon for timely support whenever it is needed.",
    "shortBioEmphasis": [
      "strong professional expertise with consistently high standards of execution.",
      "Approachable and easy to work with",
      "be relied upon for timely support whenever it is needed."
    ],
    "keyContribution": "Tatyana’s contribution is closely connected to the continuous development and optimisation of ICT processes. She brings quality, structure and practical thinking to this work, helping identify opportunities for improvement and supporting more effective ways of working. Alongside this core focus, she also contributes to ISO certification activities, applying the same attention to detail, reliability and commitment to high standards.",
    "keyContributionEmphasis": [
      "quality, structure and practical thinking",
      "opportunities for improvement and supporting more effective ways of working",
      "same",
      "attention to detail, reliability and commitment to high standards."
    ],
    "personalFact": "Away from work, Tatyana values the time she shares with her family, whether enjoying everyday moments together or setting out to discover a new destination. Travelling gives her the opportunity to step beyond the familiar, recharge and create new experiences with the people closest to her.",
    "personalFactEmphasis": [
      ", Tatyana values the time she shares with her family, whether enjoying everyday moments together or setting out to discover a new destination.",
      "recharge",
      "create new experiences with the people closest to her."
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-003",
    "displayOrder": 3,
    "name": "Luka Tsekov",
    "role": "Senior Specialist",
    "team": "BPT & Testing Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Luka brings an open mind, a practical outlook and plenty of personality to every situation.",
    "shortBioEmphasis": [
      "open mind, a practical outlook and plenty of personality to every situation."
    ],
    "keyContribution": "Luka is a versatile testing professional who combines solid expertise with a thoughtful and adaptable approach. His experience spans testing, collection activities, customer service and a variety of operational scenarios, enabling him to view challenges from both a technical and customer perspective. He brings practical judgement and a strong customer focus to every assignment.",
    "keyContributionEmphasis": [
      "solid expertise with a thoughtful and adaptable approach.",
      "view challenges from both a technical and customer perspective. He brings practical judgement and a strong customer focus to every assignment."
    ],
    "personalFact": "Luka is the team’s unofficial comedy department and an excellent storyteller. He is a true music enthusiast who can appreciate almost any genre — and, when it comes to food and drinks, considers himself a professional taster. \r\nOr in other words - quality control is always applied outside work too!",
    "personalFactEmphasis": [
      "Luka is the team’s unofficial comedy department and an excellent storyteller.",
      "Or in other words - quality control is always applied outside work too!"
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-004",
    "displayOrder": 4,
    "name": "Mariela Mincheva",
    "role": "Senior Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Mimi has extensive experience and excels at analyzing, structuring, and presenting complex information. Highly goal-oriented and consistently meets all deadlines.",
    "shortBioEmphasis": [
      "extensive experience and excels at analyzing, structuring, and presenting complex information."
    ],
    "keyContribution": "As one of the first people to join the team, Mariela has built extensive experience leading some of the most complex and high-risk projects. Equally confident across internal and ICT initiatives, she combines diligence and close attention to detail with a strong ability to help the people around her perform at their best.",
    "keyContributionEmphasis": [
      "extensive experience leading some of the most complex and high-risk projects.",
      "diligence and close attention to detail with a strong ability to help the people around her perform at their best."
    ],
    "personalFact": "The sea is Mariela’s favourite escape — ideally with a beautiful beach, sunshine from sunrise to sunset, good food and a glas (or two) of fine wine.",
    "personalFactEmphasis": [
      "The sea is Mariela’s favourite escape",
      "beautiful beach, sunshine from sunrise to sunset, good food and a glas (or two) of fine wine."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-004",
    "displayOrder": 4,
    "name": "Galina Gekova",
    "role": "Expert",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Galia brings unmistakable determination to everything she takes on. Once committed to an objective, she pursues it with persistence and directness, while her candid and distinctly individual style ensures there is rarely any doubt about what she thinks.",
    "shortBioEmphasis": [
      "unmistakable determination",
      "Once committed to an objective, she pursues it with persistence and directness",
      "andid and distinctly individual style ensures there is rarely any doubt about what she thinks"
    ],
    "keyContribution": "Galia combines domain knowledge with the tenacity to follow challenges through until they are resolved. Her experience supporting the BPM system brought her close to its business users, where her practical guidance and persistence established her as a trusted point of reference.",
    "keyContributionEmphasis": [
      "domain knowledge",
      "tenacity to follow challenges through",
      "her practical guidance and persistence established her as a trusted point of reference."
    ],
    "personalFact": "Galia is refreshingly unfiltered and unmistakably herself — she has a talent for saying out loud what others may still be editing in their heads,  is genuine fun being around her.",
    "personalFactEmphasis": [
      "Galia is refreshingly unfiltered and unmistakably herself",
      "saying out loud what others may still be editing in their heads"
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-004",
    "displayOrder": 4,
    "name": "Mariya Tudakova",
    "role": "Senior Specialist",
    "team": "BPT & Testing Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Mariya moves easily between different worlds, always bringing a clear head and a practical point of view.",
    "shortBioEmphasis": [
      "always bringing a clear head and a practical point of view."
    ],
    "keyContribution": "Mariya’s experience spans both testing and BPT, giving her a well-rounded understanding of the team’s work. Having moved from testing into BPT activities, she can connect hands-on testing experience with standard change processes, see the wider context and bring practical insight to every assignment.",
    "keyContributionEmphasis": [
      "well-rounded understanding of the team’s work",
      "she can connect hands-on testing experience with standard change processes, see the wider context and bring practical insight to every assignment."
    ],
    "personalFact": "Mariya loves travelling, listening to music, watching series and, naturally, spending time by the sea. \r\nShe is also a proud mum of two and knows that managing priorities is a must have skill outside work too!",
    "personalFactEmphasis": [
      "Mariya loves travelling, listening to music, watching series and, naturally, spending time by the sea.",
      "proud mum of two",
      "managing priorities is a must have skill outside work too!"
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-005",
    "displayOrder": 5,
    "name": "Aneliya Panayotova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Ani is the kind of project manager who never settles for understanding only the surface of a subject. She combines intellectual range, steady judgement and a sharp eye for quality, allowing her to lead with both precision and perspective.",
    "shortBioEmphasis": [
      "never settles for understanding only the surface of a subject.",
      "intellectual range, steady judgement and a sharp eye for quality",
      "to lead with both precision and perspective."
    ],
    "keyContribution": "Anelia’s real strength is turning complexity into command. She sees how every part of a project connects, creates order among the moving pieces and keeps decisions firmly anchored in facts. Even difficult conversations become more constructive when she brings the focus back to the outcome that truly matters.",
    "keyContributionEmphasis": [
      "Anelia’s real strength is turning complexity into command.",
      "creates order",
      "keeps decisions firmly anchored in facts.",
      "she brings the focus back to the outcome that truly matters."
    ],
    "personalFact": "Away from work, Ani measures time well spent by the people she shares it with. Family is her constant, and the sea is simply one of the best backdrops for being together.",
    "personalFactEmphasis": [
      "Family is her constant, and the sea is simply one of the best backdrops for being together."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-005",
    "displayOrder": 5,
    "name": "Elitsa Tsvetanova",
    "role": "Expert",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Eli brings a thoughtful and understated presence to the team, allowing the quality of her work to speak for itself. Experienced, dependable and precise, she is someone colleagues can confidently trust with assignments that require both responsibility and sound judgement.",
    "shortBioEmphasis": [
      "thoughtful and understated presence",
      "quality of her work to speak for itself. Experienced",
      "dependable",
      "precise",
      "can confidently trust"
    ],
    "keyContribution": "Eli plays an active role in the department’s certification activities, including ISO, while also coordinating its portfolio input across the wider organisation. Whatever the challenge, she approaches it with care and close attention to detail, maintains clear ownership throughout and follows every task through to completion with a consistent commitment to high-quality delivery.",
    "keyContributionEmphasis": [
      "Whatever the challenge, she approaches it with care and close attention to detail, maintains clear ownership",
      "completion with a consistent commitment to high-quality delivery."
    ],
    "personalFact": "Eli has recently welcomed a new and deeply personal chapter in her life by becoming a mother. Beyond her established professional role, she is now embracing an entirely new experience centred around her growing family.",
    "personalFactEmphasis": [
      "new and deeply personal chapter in her life by becoming a mother.",
      "now embracing an entirely new experience centred around her growing family."
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-005",
    "displayOrder": 5,
    "name": "Martin Chalev",
    "role": "Specialist",
    "team": "BPT & Testing Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "A natural problem-solver, Martin is always interested in how things work and how they can work better.",
    "shortBioEmphasis": [
      "natural problem-solver",
      "how things work and how they can work better."
    ],
    "keyContribution": "Martin is a detail-oriented testing specialist with a strong understanding of processes and information management. He looks beyond individual testing activities to understand how organisation, accurate information and interconnected processes contribute to successful delivery. \r\nThis broader perspective helps him bring structure and precision to complex work.",
    "keyContributionEmphasis": [
      "detail-oriented",
      "strong understanding of processes and information management",
      "beyond individual testing activities to understand how organisation, accurate information and interconnected processes contribute to successful delivery."
    ],
    "personalFact": "Martin is a passionate motorcycle enthusiast with a natural talent for fixing cars. He also enjoys films, great fantasy series and good food. \r\nGenerally if something has an engine, a compelling story or an excellent menu, it is likely to catch his interest.",
    "personalFactEmphasis": [
      "passionate motorcycle enthusiast with a natural talent for fixing cars.",
      "Generally if something has an engine, a compelling story or an excellent menu, it is likely to catch his interest."
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-006",
    "displayOrder": 6,
    "name": "Vesela Grigorova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Precise, clear in her communication and highly organized, Vesi approaches every task with energy and genuine commitment. She pays close attention to even the smallest details.",
    "shortBioEmphasis": [
      "Precise, clear in her communication and highly organized,",
      "genuine commitment.",
      "close attention to even the smallest details."
    ],
    "keyContribution": "Vesi approaches her work with confidence and a strong sense of responsibility. She makes decisions decisively and never shies away from new or unfamiliar challenges. Even the most complex assignments become structured, manageable and action-oriented in her hands.",
    "keyContributionEmphasis": [
      "confidence and a strong sense of responsibility.",
      "shies away from new or unfamiliar challenges.",
      "most complex assignments become structured, manageable and action-oriented"
    ],
    "personalFact": "A keen sports enthusiast, Vesi especially enjoys tennis and rarely misses a major sporting event. Away from work, she has a soft spot for Italy, fine wine and long, meaningful conversations with friends.",
    "personalFactEmphasis": [
      "A keen sports enthusiast",
      "tennis and rarely misses a major sporting event.",
      "soft spot for Italy, fine wine and long, meaningful conversations with friends."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-006",
    "displayOrder": 6,
    "name": "Kameliya Dakova",
    "role": "Expert",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Kameliya combines process expertise with energy, strong coordination and a highly collaborative approach. Engaged and dependable, she works effectively across teams and is equally comfortable managing established activities or taking on assignments that fall outside the conventional process management scope.",
    "shortBioEmphasis": [
      "process expertise",
      "energy",
      "strong coordination",
      "highly collaborative approach",
      "Engaged",
      "dependable",
      "activities",
      "fall outside the conventional process management scope."
    ],
    "keyContribution": "Kami’s contribution extends beyond process optimisation into the delivery of the solutions that follow. By redesigning and rebuilding the FixIT and Memo approval processes in Power Apps, she helped establish an internal alternative to the vendor-provided BPM solution. The result improved both processes and enabled the retirement of a legacy system with ongoing maintenance costs — turning process expertise into tangible operational and financial value.",
    "keyContributionEmphasis": [
      "improved both processes and enabled the retirement of a legacy system with ongoing maintenance costs — turning process expertise into tangible operational and financial value."
    ],
    "personalFact": "Family is at the centre of Kameliya’s world, with her husband and son beside her in many of the moments she values most. Whether walking in the mountains, spending time by the sea, enjoying the ski slopes or simply relaxing in the comfort of home, the common thread is being together.",
    "personalFactEmphasis": [
      "Family is at the centre of Kameliya’s world, with her husband and son beside her in many of the moments she values most."
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-006",
    "displayOrder": 6,
    "name": "Nadezhda Peycheva",
    "role": "Senior Specialist",
    "team": "BPT & Testing Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Nadezhda moves through change with flexibility, confidence and an excellent sense of rhythm.",
    "shortBioEmphasis": [
      "through change with flexibility,",
      "confidence",
      "excellent",
      "sense of rhythm."
    ],
    "keyContribution": "Nadezhda combines substantial experience in both BPT and testing, giving her a broad view of the team’s two core areas. This versatility enables her to navigate different requests and testing challenges effectively. She approaches each assignment with flexibility, experience and a clear focus on workable solutions.",
    "keyContributionEmphasis": [
      "enables her to navigate different requests and testing challenges effectively",
      "lexibility, experience and a clear focus on workable solutions."
    ],
    "personalFact": "Nadezhda is a professional dancer with the “Slavey” ensemble, so rhythm and coordination are very much part of her world. She loves travelling and is always ready for a trip to the Greek coast whenever the opportunity arises.",
    "personalFactEmphasis": [
      "professional dancer with the “Slavey” ensemble",
      "rhythm and coordination are very much part of her world.",
      "loves travelling",
      "always ready for a trip to the Greek"
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-007",
    "displayOrder": 7,
    "name": "Veselin Slavkov",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Vesko combines strong professional discipline with a constant thrive for learning and improving. Highly organized, reliable and attentive in his work, he maintains consistently high standards while using new knowledge and ideas to make the way he works even more effective.",
    "shortBioEmphasis": [
      "strong professional discipline with a constant thrive for learning and improving.",
      "organized, reliable and attentive",
      "consistently high standards",
      "more effective."
    ],
    "keyContribution": "One of Vesko’s defining strengths is the balance he creates between discipline and approachability. He brings clarity and structure to demanding work while fostering the kind of team environment in which people connect, support one another and perform with confidence.",
    "keyContributionEmphasis": [
      "the balance he creates between discipline and approachability",
      "clarity and structure",
      "people connect, support one another and perform with confidence."
    ],
    "personalFact": "Vesko has a strong appreciation for experiences that combine freedom and high adrenaline. His passion for automotive culture is balanced by an equally genuine connection with nature.",
    "personalFactEmphasis": [
      "freedom and high adrenaline.",
      "passion for automotive culture is balanced by an equally genuine connection with nature"
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-007",
    "displayOrder": 7,
    "name": "Mariya Grigorova",
    "role": "Expert",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Mariya brings a careful and dependable approach to her work in Knowledge Management. She values precision, takes ownership of her responsibilities and makes sure that every important detail is properly addressed.",
    "shortBioEmphasis": [
      "precision",
      "takes ownership of her responsibilities and makes sure that every important detail is properly addressed."
    ],
    "keyContribution": "Mariya’s contribution lies in the consistency and thoroughness she brings to the team’s day-to-day work. She follows tasks closely from start to finish, works carefully through the details and ensures that each deliverable is complete and well prepared. Her reliable execution helps maintain quality and continuity across the Knowledge Management function.",
    "keyContributionEmphasis": [
      "consistency",
      "thoroughness",
      "follows tasks closely from start to finish,",
      "each deliverable is complete and well prepared.",
      "maintain quality and continuity"
    ],
    "personalFact": "Family holds a special place in Mariya’s life, with her son at the heart of many of her favourite moments. She enjoys travelling together with close friends, turning each trip into shared time where friendship, family life and new experiences naturally come together.",
    "personalFactEmphasis": [
      "Family holds a special place in Mariya’s life, with her son at the heart of many of her favourite moments. She enjoys travelling"
    ],
    "accent": "Champagne"
  },
  {
    "id": "BPT-007",
    "displayOrder": 7,
    "name": "Stoil Mortev",
    "role": "Senior Specialist",
    "team": "BPT & Testing Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Stoil has a talent for making complex situations feel manageable—and busy days more enjoyable.",
    "shortBioEmphasis": [
      "making complex situations feel manageable—and busy days more enjoyable."
    ],
    "keyContribution": "Stoil was among the first testing proffesionals to join the team and is one of its most experienced ones. His expertise is particularly strong in fixed services and SAP-related activities, where accuracy, sound process knowledge and experience are essential. Colleagues can rely on him not only to solve a problem, but also to offer a practical idea for making the solution even better.",
    "keyContributionEmphasis": [
      "expertise is particularly strong in fixed services and SAP-related activities, where accuracy, sound process knowledge and experience are essential.",
      "offer a practical idea for making the solution even better."
    ],
    "personalFact": "Stoil is rarely without a good mood, a joke or an entertaining story. Always ready with useful advice and naturally inclined to plan ahead, especially when it comes to one non-negotiable part of the day- the time for coffee.",
    "personalFactEmphasis": [
      "Stoil is rarely without a good mood, a joke or an entertaining story.",
      "useful advice",
      "naturally inclined to plan ahead,",
      "especially when it comes to one non-negotiable part of the day- the time for coffee."
    ],
    "accent": "Ice blue"
  },
  {
    "id": "PM-008",
    "displayOrder": 8,
    "name": "Danaya Georgieva",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Danaya is someone colleagues can trust when the work is complex and the outcome truly matters. She meets every challenge with sound judgement, precision and a strong sense of responsibility, keeping her focus firmly on what needs to be achieved.",
    "shortBioEmphasis": [
      "someone colleagues can trust",
      "She meets every challenge with sound judgement,",
      "precision",
      "strong sense of responsibility,",
      "what needs to be achieved."
    ],
    "keyContribution": "Danaya’s value becomes clearest when the stakes are high and the relationships are complex. She keeps the noise from overtaking the objective, navigates difficult conversations with composure and brings business-critical projects to the finish line with exceptional precision.",
    "keyContributionEmphasis": [
      "when the stakes are high",
      "keeps the noise from overtaking the objective",
      "navigates difficult conversations",
      "business-critical projects to the finish line with exceptional precision."
    ],
    "personalFact": "Danaya’s time outside work belongs to the people closest to her — and that circle is about to grow. With a second child on the way, her world is about to become fuller and richer — but also busier, livelier and even more adventurous, with family firmly at the centre of it all.",
    "personalFactEmphasis": [
      "that circle is about to grow.",
      "fuller and richer",
      "busier, livelier and even more adventurous, with family firmly at the centre of it al"
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-008",
    "displayOrder": 8,
    "name": "Simona Yordanova",
    "role": "Senior Specialist",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Simona brings an open and positive energy to the Process Management team. Responsive, approachable and easy to communicate with, she is a collaborative colleague and a dependable partner who contributes to a constructive way of working.",
    "shortBioEmphasis": [
      "open and positive energy",
      "easy to communicate with",
      "she is a collaborative colleague and a dependable partner"
    ],
    "keyContribution": "Simona’s contribution is strongly reflected in the way she works with others. Her clear communication, responsiveness and willingness to collaborate help activities move forward smoothly and make her someone colleagues can readily turn to for support. She approaches her responsibilities with a positive attitude and a genuine team spirit.",
    "keyContributionEmphasis": [
      "clear communication, responsiveness and willingness to collaborate",
      "move forward smoothly",
      "colleagues can readily turn to for support.",
      "positive attitude and a genuine team spirit."
    ],
    "personalFact": "Simona enjoys travelling, being surrounded by the people closest to her and finding every possible reason to laugh. Her playful and occasionally unexpected sense of humour keeps conversations lively and ensures that things rarely remain serious for too long.",
    "personalFactEmphasis": [
      "playful",
      "occasionally",
      "unexpected sense of humour keeps conversations lively and ensures that things rarely remain serious for too long."
    ],
    "accent": "Champagne"
  },
  {
    "id": "PM-009",
    "displayOrder": 9,
    "name": "Yordanka Meshova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Dani combines remarkable energy with an impressive level of determination. Challenges rarely slow her down; instead, they bring out the persistence and initiative that define the way she works.",
    "shortBioEmphasis": [
      "remarkable energy",
      "impressive",
      "level",
      "determination",
      "Challenges",
      "bring out the persistence and initiative that define the way she works."
    ],
    "keyContribution": "Yordanka does more than move complex work forward — she makes people want to be part of it. She steps confidently into unfamiliar territory, turns scattered ideas and responsibilities into clear direction, and creates an open, friendly atmosphere in which teams work with energy and genuine commitment. Whatever the challenge, her determination keeps the work moving, the team engaged and the focus firmly on a result everyone can stand behind.",
    "keyContributionEmphasis": [
      "she makes people want to be part of it",
      "open, friendly atmosphere in which teams work with energy and genuine commitment.",
      "keeps the work moving",
      "team engaged",
      "focus firmly on a result everyone can stand behind"
    ],
    "personalFact": "For Dani, the best moments are those shared with family, friends and her dog. A spontaneous escape to the sea, plenty of sunshine and the chance to return with a little more tan make them even better.",
    "personalFactEmphasis": [
      "the best moments are those shared with family, friends and her dog.",
      "sea",
      "lenty of sunshine and the chance to return with a little more tan make them even better."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-009",
    "displayOrder": 9,
    "name": "Bozhidara Stoilova",
    "role": "Senior Specialist",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Bozhidara combines a professional and dependable approach with positive energy and a natural instinct for teamwork. Constructive and supportive, she is the kind of colleague who contributes readily and helps create working relationships built on trust.",
    "shortBioEmphasis": [
      "professional",
      "dependable",
      "positive energy",
      "natural instinct for teamwork. Constructive and supportive,"
    ],
    "keyContribution": "One of many  Bozhidara contributions is her coordination of the Trouble Ticket Reduction Program. Through her consistent involvement and reliable support, she has become a trusted point of contact for colleagues who need guidance or assistance, helping keep the programme’s activities connected and moving forward. More broadly, she approaches her responsibilities with strong ownership, keeping tasks on track and following them through to completion within the agreed timelines.",
    "keyContributionEmphasis": [
      "has become a trusted point of contact for colleagues who need guidance or assistance,",
      "connected",
      "moving forward",
      "strong ownership, keeping tasks on track and following them through to completion within the agreed timelines."
    ],
    "personalFact": "Bozhidara is at her best in good company, surrounded by close friends and the people who matter most to her. Her strong character and quick sense of humour come with what colleagues affectionately call her unmistakable “Lyulin energy” — confident, lively and rarely short of a good comeback.",
    "personalFactEmphasis": [
      "Bozhidara is at her best in good company, surrounded by close friends and the people who matter most to her.",
      "affectionately call her unmistakable “Lyulin energy” —"
    ],
    "accent": "Champagne"
  },
  {
    "id": "PM-010",
    "displayOrder": 10,
    "name": "Maya Atanasova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Maya is an exceptional communicator who instinctively adapts her approach to different people and situations. She builds understanding quickly and makes collaboration feel natural.",
    "shortBioEmphasis": [
      "exceptional communicator",
      "adapts her approach to different people and situations.",
      "understanding quickly",
      "makes collaboration feel natural"
    ],
    "keyContribution": "Maya has a natural ability to bring people together around a shared goal. Her calm and positive approach keeps unnecessary tension out of the process and helps teams navigate complex situations with clarity and ease.",
    "keyContributionEmphasis": [
      "atural ability to bring people together around a shared goal.",
      "calm",
      "positive",
      "approach",
      "keeps unnecessary tension out of the process",
      "complex situations with clarity and ease."
    ],
    "personalFact": "Maya loves kitesurfing, travelling and spending quality time with friends and her family. She is also a naturally funny storyteller who can turn almost any experience into a story worth hearing.",
    "personalFactEmphasis": [
      "loves kitesurfing, travelling",
      ".",
      "naturally funny storyteller",
      "turn almost any experience into a story worth hearing"
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-010",
    "displayOrder": 10,
    "name": "Adelina Dotseva",
    "role": "Senior Specialist",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Adelina brings a precise and conscientious approach to her role in Knowledge Management. Responsive and dependable, she takes clear responsibility for her work and can be trusted to handle every assignment with care.",
    "shortBioEmphasis": [
      "precise and conscientious approach",
      "Responsive",
      "dependable",
      "clear",
      "responsibility",
      "handle every assignment with care."
    ],
    "keyContribution": "Adelina contributes to the reliable execution of the team’s day-to-day Knowledge Management activities. She keeps close track of her responsibilities, works carefully through the details and remains responsive whenever support is needed. Her focus on follow-through ensures that tasks are completed to the expected standard and within the agreed timelines.",
    "keyContributionEmphasis": [
      "close track of her responsibilities, works carefully through the details and remains responsive whenever support is needed.",
      "tasks are completed to the expected standard and within the agreed timelines."
    ],
    "personalFact": "Adi is currently embracing a chapter in which family takes centre stage, sharing it with her husband and her boy. Her love of discovering new places has taken her from relaxed seaside destinations to the energy of major European cities, turning travel into another way of creating meaningful memories together.",
    "personalFactEmphasis": [
      "Adi is currently embracing a chapter in which family takes centre stage, sharing it with her husband and her boy.",
      "turning travel into another way of creating meaningful memories together."
    ],
    "accent": "Champagne"
  },
  {
    "id": "PM-011",
    "displayOrder": 11,
    "name": "Mila Vladova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Mila is naturally engaging and quickly builds trust in new environments. Her openness, warmth and positive energy make collaboration easy and bring people together.",
    "shortBioEmphasis": [
      "naturally engaging and quickly builds trust in new environments.",
      "openness, warmth and positive energy",
      "collaboration easy and bring people together."
    ],
    "keyContribution": "Mila combines exceptionally high standards with a strong sense of responsibility. She approaches every challenge with commitment, works with precision and can be trusted to carry even the most demanding tasks through to a polished result.",
    "keyContributionEmphasis": [
      "exceptionally high standards",
      "responsibility",
      "commitment, works with precision",
      "can be trusted to carry even the most demanding tasks through to a polished result"
    ],
    "personalFact": "Curious and sociable by nature, Mila enjoys discovering new places and sharing meaningful moments with those closest to her — ideally over an engaging conversation and a glass of fine wine.",
    "personalFactEmphasis": [
      "Curious and sociable by nature,",
      "discovering new places",
      "ideally over an engaging conversation and a glass of fine wine."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PROC-011",
    "displayOrder": 11,
    "name": "Mariela Ilieva",
    "role": "Specialist",
    "team": "Process & Procedures Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Mariela brings responsibility, precision and strong follow-through to her role in Process Management. Dependable and attentive to detail, she ensures that every task entrusted to her is completed thoroughly and to a high standard.",
    "shortBioEmphasis": [
      "responsibility, precision and strong follow-through",
      "Dependable",
      "attentive to detail,",
      "every task",
      "is completed thoroughly and to a high standard."
    ],
    "keyContribution": "One of Mariela’s notable contributions has been her administrative support for the RRF Project — a large-scale, EU-funded initiative designed to expand connectivity to more remote areas across the country. She handled every responsibility with precision and consistency, completing all outstanding tasks before beginning her maternity leave. The thoroughness of that transition reflected the ownership and attention to detail she brings to her work.",
    "keyContributionEmphasis": [
      "She handled every responsibility with precision and consistency, completing all outstanding tasks",
      "The thoroughness of that transition reflected the ownership and attention to detail she brings to her work."
    ],
    "personalFact": "Mariela has recently entered a new and meaningful chapter in her life, with her growing family now taking centre stage. Maternity leave offers her the opportunity to embrace new experiences, priorities and moments that will make this period truly special.",
    "personalFactEmphasis": [
      "new and meaningful chapter in her life, with her growing family now taking centre stage.",
      "opportunity to embrace new experiences, priorities and moments that will make this period truly special."
    ],
    "accent": "Champagne"
  },
  {
    "id": "PM-012",
    "displayOrder": 12,
    "name": "Hristina Shotekova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Calm, focused and highly consistent, Hrisi has a strong ability to immerse herself in unfamiliar and complex subjects and quickly build a clear understanding of them.",
    "shortBioEmphasis": [
      "Calm, focused and highly consistent,",
      "to immerse herself in unfamiliar and complex subjects",
      "clear understanding"
    ],
    "keyContribution": "Hrisi brings composure and sound judgement even to high-pressure situations. Thoroughly prepared for every discussion, she confidently navigates complex topics — including those beyond her immediate area of expertise — and gives project teams the clarity and direction they need to achieve their goals.",
    "keyContributionEmphasis": [
      "composure and sound judgement even to high-pressure situations.",
      "confidently navigates complex topics",
      "beyond her immediate area of expertise",
      "clarity and direction"
    ],
    "personalFact": "Travelling and discovering new places give Hrisi fresh energy — and plenty of stories to share with her colleagues. She also enjoys going out and spending quality time with friends.",
    "personalFactEmphasis": [
      "Travelling and discovering new places give Hrisi fresh energy",
      "stories to share with her colleagues."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PM-013",
    "displayOrder": 13,
    "name": "Yana Nikolova",
    "role": "Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Diligent, flexible and highly adaptable, Yana moves confidently between a wide range of projects and responsibilities. She is always ready to step in and support those around her.",
    "shortBioEmphasis": [
      "Diligent, flexible and highly adaptable",
      "wide range",
      "She is always ready to step in and support those around her."
    ],
    "keyContribution": "Yana combines close attention to detail with genuine care for the people around her. She connects easily with colleagues and brings commitment and heart to everything she takes on. A true all-rounder, she handles internal projects, ICT initiatives and organizational responsibilities with equal confidence.",
    "keyContributionEmphasis": [
      "close attention to detail with genuine care for the people around her.",
      "connects easily with colleagues",
      "brings commitment",
      "heart",
      "A true all-rounder,"
    ],
    "personalFact": "Yana loves to laugh, dance and surround herself with happy, positive people. Fun-loving, wonderfully eccentric and full of unmistakable energy, she brings her own spark wherever she goes.",
    "personalFactEmphasis": [
      "loves to laugh, dance and surround herself with happy, positive people. Fun-loving, wonderfully eccentric and full of unmistakable energy",
      "brings her own spark"
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PM-014",
    "displayOrder": 14,
    "name": "Emil Savov",
    "role": "Junior Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Thoughtful, organized and dependable, Emo approaches his work with focus and consistency. He is always ready to take on new challenges and learn along the way.",
    "shortBioEmphasis": [
      "Thoughtful, organized and dependable,",
      "focus and consistency.",
      "always ready to take on new challenges and learn along the way."
    ],
    "keyContribution": "As the newest member of the team, Emo quickly became a natural part of its diverse dynamic. He manages multiple responsibilities in parallel while keeping priorities clear and maintaining steady progress towards every goal.",
    "keyContributionEmphasis": [
      "quickly became a natural part of its diverse dynamic.",
      "keeping priorities clear and maintaining steady progress towards every goal."
    ],
    "personalFact": "Emo enjoys football, skiing and travelling. A regular at the gym, he also makes staying active and maintaining a healthy lifestyle part of his routine.",
    "personalFactEmphasis": [
      "Emo enjoys football, skiing and travelling.",
      "staying active and maintaining a healthy lifestyle part of his routine."
    ],
    "accent": "Coral rose"
  },
  {
    "id": "PM-015",
    "displayOrder": 15,
    "name": "Donna Rakov",
    "role": "Junior Project Manager",
    "team": "Project Management Team",
    "isLeadership": false,
    "photoPosition": "center",
    "shortBio": "Solution-oriented and pragmatic, Donna has a natural ability to break complex problems down into clear, efficient steps. She communicates confidently and adapts her approach effectively across diverse stakeholder groups.",
    "shortBioEmphasis": [
      "Solution-oriented and pragmatic,",
      "break complex problems down into clear, efficient steps.",
      "effectively across diverse stakeholder groups."
    ],
    "keyContribution": "Flexible, adaptable and highly driven, Donna knows how to bring out the best in the people she works with and keep project teams focused on results. Tech-savvy by nature, she works confidently with digital tools and is quick to explore and adopt emerging technologies.",
    "keyContributionEmphasis": [
      "Flexible, adaptable and highly driven,",
      "how to bring out the best in the people she works with and keep project teams focused on results. Tech-savvy by nature,",
      "quick to explore and adopt emerging technologies."
    ],
    "personalFact": "Donna loves traveling, dancing, and spending quality time surrounded by the people she cares about most.",
    "personalFactEmphasis": [
      "loves traveling, dancing, and spending quality time",
      "people she cares about most."
    ],
    "accent": "Coral rose"
  }
]

export const WB_TIMELINE: WorkbookMilestone[] = [
  {
    "id": "M-2016",
    "displayOrder": 1,
    "year": "2016",
    "title": "THE BIG BANG",
    "shortDescription": "The PMO was re-established—and a new era of disciplined, consistent and business-focused delivery began.",
    "accent": "Warm white / champagne"
  },
  {
    "id": "M-2016",
    "displayOrder": 2,
    "year": "2016",
    "title": "QUALITY, BUILT IN",
    "shortDescription": "A dedicated Testing team was established, embedding structured validation into our delivery model and making quality, risk control and implementation readiness an integral part of every project.",
    "accent": "Violet"
  },
  {
    "id": "M-2017",
    "displayOrder": 3,
    "year": "2017",
    "title": "SUCCESS BY DESIGN",
    "shortDescription": "A new project management framework connected every initiative to A1’s strategic priorities—strengthening governance, accelerating decision-making and turning strategy into measurable business impact.",
    "accent": "Champagne / coral"
  },
  {
    "id": "M-2018",
    "displayOrder": 4,
    "year": "2018",
    "title": "INNOVATION, BUILT IN-HOUSE",
    "shortDescription": "We created a tailored activity management solution that transformed how work was planned, executed, monitored and reported—bringing greater transparency, coordination and accountability across the company.",
    "accent": "Coral"
  },
  {
    "id": "M-2021",
    "displayOrder": 5,
    "year": "2018",
    "title": "FIRST BY NATURE .. A1 WAS BORN",
    "shortDescription": "We orchestrated one of the company’s most complex transformations, turning a far-reaching rebranding programme and its interconnected initiatives into a defining delivery success.",
    "accent": "Violet / ice blue"
  },
  {
    "id": "M-2022",
    "displayOrder": 6,
    "year": "2020",
    "title": "DELIVERY, UNINTERRUPTED",
    "shortDescription": "When the world moved to remote working almost overnight, our department kept projects and processes moving—protecting continuity, quality and momentum through seamless digital collaboration.",
    "accent": "Ice blue"
  },
  {
    "id": "M-2024",
    "displayOrder": 7,
    "year": "2023",
    "title": "BEYOND TELECOM",
    "shortDescription": "Our delivery scope expanded into complex ICT solutions, opening a new chapter defined by broader capabilities, greater technological diversity and an increasingly ambitious portfolio.",
    "accent": "Coral / violet"
  },
  {
    "id": "M-2025",
    "displayOrder": 8,
    "year": "2023",
    "title": "SCALING DELIVERY, STRENGTHENING LEADERSHIP",
    "shortDescription": "As the Project Management team nearly doubled in size, its leadership model evolved alongside it. A three-person leadership structure brought stronger support and the capacity to manage greater scale, complexity and delivery demands.",
    "accent": "Partial iridescent"
  },
  {
    "id": "M-2026",
    "displayOrder": 9,
    "year": "2026",
    "title": "READY FOR THE NEXT CHAPTER",
    "shortDescription": "A decade of experience, growth and delivery is not the finish line. It is the foundation for everything we build next.",
    "accent": "Full iridescent"
  }
]

export const WB_PROJECTS: WorkbookProject[] = [
  {
    "id": "PRJ-01",
    "displayOrder": 1,
    "name": "Digital signing projects",
    "category": "Digitalization",
    "description": "Integration of Evrotrust, e-signature and digital signing solutions, dynamic contracts for corporate customers, document signing via tablet during technical visits, and an upgrade of the POS AG platform.",
    "impact": "These digital-signing initiatives improved the customer experience, shortened the overall purchase-to-activation process, and generated operational savings by reducing paper, printing, and courier costs.",
    "accent": "Champagne / coral"
  },
  {
    "id": "PRJ-02",
    "displayOrder": 2,
    "name": "5G Implementation",
    "category": "Strategic Technology Delivery",
    "description": "Deployment and commercial launch of 5G services across A1 Bulgaria’s network. The initiative included network infrastructure upgrades, spectrum and technology integration, coverage expansion, and the introduction of new 5G services for customers.",
    "impact": "Strengthened A1 Bulgaria’s position as a technology leader in digitalization and innovation, while improving its competitive positioning in the delivery of complex solutions to corporate customers.",
    "accent": "Ice blue / violet"
  },
  {
    "id": "PRJ-03",
    "displayOrder": 3,
    "name": "BSS modernizations",
    "category": "Customer Experience",
    "description": "Digital CRM: A new, web-based and user-friendly CRM platform for A1 Shop agents, designed to streamline in-store processes.\r\nBSS Stack Upgrade: A comprehensive upgrade of the BSS stack to a newer version, introducing new capabilities and significant performance improvements.",
    "impact": "Reduced customer handling and employee training times, while contributing to lower staff turnover across A1 shops.",
    "accent": "Ice blue / warm white"
  },
  {
    "id": "PRJ-04",
    "displayOrder": 4,
    "name": "А1 rebranding",
    "category": "Brand identity change",
    "description": "A major transformation initiative extending beyond the introduction of a new brand identity. The project also included the launch of several new products and services presented to customers as part of the rebranding.",
    "impact": "Established a new brand identity that enabled A1 to communicate and reinforce its customer-centric strategy."
  },
  {
    "id": "PRJ-05",
    "displayOrder": 5,
    "name": "MOIN",
    "category": "Technical upgrade",
    "description": "MoIN BG was A1 Bulgaria’s implementation of the Group-wide MoIN program, migrating services from the legacy platform to a new, unified Intelligent Network platform. The scope included voice services such as VPN, Extra SIM, HomeBox and the NTS (SURE) Green Line, as well as Tariff Transparency Announcement, National Interconnect Fraud, VAS Voice Number Regulation (090), and A1BG Guard.",
    "impact": "Modernized the underlying service platforms and eliminated risks associated with unsupported legacy services and functionalities."
  },
  {
    "id": "PRJ-06",
    "displayOrder": 6,
    "name": "Transition to EURO",
    "category": "Regulatory",
    "description": "A company-wide euro transition initiative covering IT systems, billing and charging platforms, financial processes, customer-facing channels, contracts, pricing catalogues, reporting, and regulatory compliance. The project was designed to ensure a seamless and legally compliant conversion while maintaining uninterrupted customer services and business operations.",
    "impact": "Delivered a large-scale regulatory transformation without service disruption, compliance gaps, or regulatory penalties."
  },
  {
    "id": "PRJ-07",
    "displayOrder": 7,
    "name": "E-ticket and Е-tracker",
    "category": "Digitalization",
    "description": "E-ticket: A digital self-service tool that guides customers through troubleshooting issues with their internet or TV services and automatically escalates unresolved cases to technical experts.\r\nE-tracker: A digital widget within the My A1 app that allows customers to follow the status and progress of their fault or installation tickets in detail.",
    "impact": "Reduced call volumes to *88 and lowered operational costs by avoiding unnecessary technician visits when customers could resolve issues independently. The solutions also improved the customer experience and encouraged greater adoption of digital self-service."
  },
  {
    "id": "PRJ-08",
    "displayOrder": 8,
    "name": "My A1 new app",
    "category": "Digitalization",
    "description": "The Mobile App Transformation Project replaced A1’s existing mobile application with a modern, next-generation digital platform. It introduced an improved user experience, redesigned customer journeys, and a microservices-based architecture supporting greater scalability and performance.",
    "impact": "Significantly improved the digital customer experience and strengthened A1’s positioning as a provider of digital services."
  },
  {
    "id": "PRJ-09",
    "displayOrder": 9,
    "name": "Netflix , Skyshowtime, Film Box, Youtube Premium integration",
    "category": "Product Launch",
    "description": "Integration with the MarkerONE OTT platform, enabling customers to subscribe to a range of OTT services through the Select option included in their tariff plans.",
    "impact": "As the first operator to launch this capability, A1 gained a competitive advantage and strengthened its proposition for customers with high demand for premium digital content."
  },
  {
    "id": "PRJ-10",
    "displayOrder": 10,
    "name": "ERP customer implementations",
    "category": "ICT projects",
    "description": "Implementation and customization of ERP solutions for corporate customers, integrating key business functions within a single platform and improving process automation, visibility, and control.",
    "impact": "Solutions delivered to customers including Monbat, Postbank, Sellmark, Elmark, RAPID, NEK, Sofia Water, Toplofikatsiya, Tilcom, Bright, Energoremont, Medray, Dega Tech, Technopolis, Iteratio, Fortex, Paraflow, and Abrites."
  },
  {
    "id": "PRJ-11",
    "displayOrder": 11,
    "name": "ERP EURO customer conversions",
    "category": "ICT projects",
    "description": "The ERP Euro Migration Project enabled corporate customers to transition their ERP systems from BGN to EUR in line with regulatory requirements. The scope included system configuration, data conversion, and business process adjustments to support a smooth and accurate transition.",
    "impact": "Euro migration projects delivered to customers including RVD, Monbat, Magnum 7, Areksim, LB Bulgaricum, ElKabel, Kearoks, ZMM, FAAK, VP Brands, Bricolage, DPPI, Balev Corporation, Asarel, KCM, Toplofikatsiya, Sofia Water, Postbank, NKZI, and Mini Maritsa Iztok.",
    "accent": "Violet / coral"
  },
  {
    "id": "PRJ-12",
    "displayOrder": 12,
    "name": "Various ICT projects",
    "category": "ICT projects",
    "description": "Delivery of complex, tailor-made solutions for large corporate and public-sector customers, ranging from infrastructure and cybersecurity solutions to custom softwares, websites, applications, and IoT solutions.",
    "impact": "Solutions delivered to customers including the Customs Agency, Toplofikatsiya, BNR, Electrohold, Postbank, API, various municipalities, government agencies, and ministries.",
    "accent": "Champagne / warm white"
  },
  {
    "id": "PRJ-13",
    "displayOrder": 13,
    "name": "TV services in different hospitals",
    "category": "ICT projects",
    "description": "Delivery of end-to-end television services for hospitals, covering service purchase and payment, signal distribution, and comprehensive operational support.",
    "impact": "Solutions delivered to hospitals including ISUL, PGAGBAL Sveta Sofia, and UMBAL Sveti Georgi.",
    "accent": "Violet"
  },
  {
    "id": "PRJ-14",
    "displayOrder": 14,
    "name": "Max Sport and MAX Movie channel",
    "category": "Content Portfolio Expansion",
    "description": "Launch of A1’s own sports television channels, covering their end-to-end setup, including content acquisition, technology, broadcasting, distribution, and integration with A1’s TV platform.",
    "impact": "Created a competitive advantage through exclusive content, introduced an additional revenue stream through the licensing of selected content rights to media companies and other telecom operators, and strengthened A1’s brand positioning.",
    "accent": "Coral"
  },
  {
    "id": "PRJ-15",
    "displayOrder": 15,
    "name": "RRF Project",
    "category": "EU programme",
    "description": "The project aims to deliver modern, secure, and high-capacity digital infrastructure across the target regions, providing high-speed connectivity and expanding access to essential digital services.",
    "impact": "€15 million – A1’s own contribution\r\n€69 million – EU funding\r\nApproximately 168,000 people – Access to 1 Gbps services\r\n64 – Municipal centres\r\n950 km – New infrastructure\r\n1,280 km – Upgraded infrastructure\r\n105 – Settlements to be covered\r\n271 – Base stations with fibre-optic connectivity",
    "accent": "Warm white / champagne"
  },
  {
    "id": "PRJ-16",
    "displayOrder": 16,
    "name": "Entitlement Server Program",
    "category": "Multi-Country Programme",
    "description": "A centralized A1 Group platform based on the Amdocs Entitlement Server, designed to manage the digital provisioning and activation of services on customer devices. It primarily supports eSIM-related capabilities and customer journeys, including digital eSIM activation, Apple Watch cellular connectivity, and seamless eSIM transfers between devices. The platform also provides the foundation for future capabilities such as 5G Standalone, enhanced device onboarding, and secure phone-number verification.",
    "impact": "Improved the customer experience, reduced reliance on manual processes and store visits, and enabled faster rollout of new services across markets. It also reduced technological complexity, increased operational efficiency, and supported long-term architectural consistency across A1 Group.",
    "accent": "Iridescent"
  }
]

export const WB_FOCUS: WorkbookFocusArea[] = [
  {
    "id": "FOCUS-01",
    "displayOrder": 1,
    "title": "AI & AUTOMATION",
    "line": "Smarter tools. Sharper insight. More time for what matters.",
    "detailedDescription": "We are exploring practical AI uses cases and automation to reduce repetitive work, strengthen insight and support faster, better-informed decisions—freeing people to focus on judgement, collaboration and outcomes.",
    "accent": "Electric violet"
  },
  {
    "id": "FOCUS-02",
    "displayOrder": 2,
    "title": "MODERNISATION",
    "line": "Building the foundations for what comes next.",
    "detailedDescription": "We are evolving the systems, platforms and delivery practices behind our work—creating a more connected and adaptable foundation ready to support continuous change.",
    "accent": "Ice blue"
  },
  {
    "id": "FOCUS-03",
    "displayOrder": 3,
    "title": "CUSTOMER EXPERIENCE",
    "line": "Every decision, connected to the customer.",
    "detailedDescription": "We are strengthening the connection between delivery decisions and real customer needs, keeping the experience we create visible from the first idea through implementation.",
    "accent": "Coral rose"
  },
  {
    "id": "FOCUS-04",
    "displayOrder": 4,
    "title": "PROCESS OPTIMISATION",
    "line": "Less friction. Clearer flow. Better work.",
    "detailedDescription": "We are identifying bottlenecks, simplifying handovers and redesigning workflows so work can move with greater clarity, consistency and speed.",
    "accent": "Champagne"
  },
  {
    "id": "FOCUS-05",
    "displayOrder": 5,
    "title": "QUALITY EVOLUTION",
    "line": "Raising confidence with every change.",
    "detailedDescription": "We are evolving how quality is built into change—bringing validation earlier, strengthening collaboration and turning every release into an opportunity to learn and improve.",
    "accent": "Warm white / ice blue"
  }
]

export const WB_VOICES: WorkbookVoice[] = [
  {
    "id": "VOICE-01",
    "displayOrder": 1,
    "quote": "The team’s proven professionalism and expertise are instrumental in the successful delivery of a broad portfolio of complex projects. Its members possess an in-depth understanding of A1’s business needs and the nuances of its operating environment.",
    "emphasis": [
      "proven professionalism and expertise are instrumental in the successful delivery of a broad portfolio of complex projects",
      "in-depth understanding of A1’s business needs"
    ],
    "name": "Tsvetomil Yordanov",
    "role": "Team Manager",
    "unit": "Operational Software Development Team",
    "isHighlight": true
  },
  {
    "id": "VOICE-02",
    "displayOrder": 2,
    "quote": "The Project and Process Management team is a key driver of business transformation, translating strategic priorities into successfully delivered initiatives and more effective ways of working. Its impact is clearly demonstrated by the Euro Conversion Program, which prepared critical systems and processes for the transition to the euro, and by the digitalization of key retail processes, which simplified daily operations, accelerated execution and improved the experience of both employees and customers.\r\n\r\nThrough strong ownership, cross-functional collaboration and a consistent focus on outcomes, the team turns complex change into sustainable business value. Its contribution strengthens operational efficiency, enables company-wide transformation and supports A1’s continued development.",
    "emphasis": [
      "key driver",
      "of business transformation",
      "translating strategic priorities into successfully delivered initiatives",
      "more effective ways of working",
      "strong ownership, cross-functional collaboration and a consistent focus",
      "the team turns complex change into sustainable business value.",
      "contribution strengthens operational efficiency, enables company-wide transformation and supports A1’s continued development."
    ],
    "name": "Stefan Penchev",
    "role": "Team Manager",
    "unit": "Projects and Sales Operations team",
    "isHighlight": true
  },
  {
    "id": "VOICE-03",
    "displayOrder": 3,
    "quote": "Throughout my collaboration with the Project & Process Management Department, I have consistently been able to rely on the team’s deep expertise, professionalism and structured approach. The team has proven to be a trusted partner, making a significant contribution to the successful delivery of key initiatives and the effective management of projects. Their sound judgement, strategic perspective and ability to develop sustainable solutions consistently translate into tangible value for the business.",
    "emphasis": [
      "rely on the team’s deep expertise,",
      "professionalism and structured approach.",
      "trusted partner",
      "making a significant contribution to the successful delivery of key initiatives",
      "sound judgement, strategic perspective and ability to develop sustainable solutions consistently translate into tangible value for the business."
    ],
    "name": "Petya Karabuleva-Dincheva",
    "role": "Senior Manager",
    "unit": "Back office department",
    "isHighlight": true
  },
  {
    "id": "VOICE-04",
    "displayOrder": 4,
    "quote": "I would like to share my positive feedback on our collaboration with the colleagues from the Project Management unit. I have been particularly impressed by their ability to balance consultants’ professional requirements with client expectations while maintaining a constructive and solution-oriented dialogue. Even in more critical situations, they remain objective, preserve a neutral tone and help de-escalate tension. Their readiness to provide timely support — including with issues that extend beyond the traditional scope of the project management role — makes them highly dependable partners and contributes significantly to the success of our joint work.",
    "emphasis": [
      "ability to balance consultants’ professional requirements with client expectations while maintaining a constructive and solution-oriented dialogue.",
      "Their readiness to provide timely support",
      "makes them highly dependable partners and contributes significantly to the success of our joint work."
    ],
    "name": "Marin Donkov",
    "role": "Senior Manager",
    "unit": "ERP Customer Solution Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-05",
    "displayOrder": 5,
    "quote": "Working with colleagues from PPMD is consistently smooth and straightforward. They always respond promptly, provide clear and specific guidance, and can be relied upon whenever support is needed. Communication is direct and constructive, while solutions are delivered quickly and with careful attention to detail.",
    "emphasis": [
      "consistently smooth and straightforward.",
      "always respond promptly, provide clear and specific guidance, and can be relied upon whenever support is needed",
      "direct and constructive, while solutions are delivered quickly and with careful attention to detail."
    ],
    "name": "Biliyana Drazheva",
    "role": "Internal Communications Manager",
    "unit": "PR division",
    "isHighlight": false
  },
  {
    "id": "VOICE-06",
    "displayOrder": 6,
    "quote": "A heartfelt thank you to the outstanding Project Management team! They are always ready to offer support or provide the information I need for business cases, no matter how late the request comes in or how complex it may be. Their exceptional responsiveness, positive attitude and strong team spirit make working with them a genuine pleasure!",
    "emphasis": [
      "A heartfelt thank you to the outstanding Project Management team!",
      "always ready to offer support",
      "Their exceptional responsiveness, positive attitude and strong team spirit make working with them a genuine pleasure!"
    ],
    "name": "Nadezhda Ugrinova",
    "role": "Senior Business Cases Evaluation Expert",
    "unit": "Commercial Controlling Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-07",
    "displayOrder": 7,
    "quote": "I would like to share some feedback on the Project Management team and the value they bring to our daily collaboration.\r\n\r\nOur teams work closely together, and this active cooperation is an important factor in achieving successful outcomes. The Project Management team demonstrates a strong ability to coordinate multiple workstreams and stakeholder groups while maintaining a clear commitment to practical and sustainable solutions. Colleagues approach challenges proactively, engage with the detail behind complex issues and consistently work to identify the most appropriate way forward.\r\n\r\nI also appreciate the team’s curiosity and openness towards adopting new technologies and AI-enabled tools. Their willingness to explore new approaches supports more effective planning, analysis and task monitoring, while creating a strong foundation for a more modern and efficient way of working.\r\n\r\nThe Project Management team is a trusted and valuable partner, making a significant contribution to the delivery of key initiatives and the achievement of our shared objectives.\r\n\r\nThank you to the entire team for your professionalism, commitment and consistently strong collaboration.",
    "emphasis": [
      "value they bring to our daily collaboration.",
      "trong ability to coordinate multiple workstreams and stakeholder groups while maintaining a clear commitment to practical and sustainable solutions.",
      "challenges proactively, engage with the detail behind complex issues",
      "consistently work to identify the most appropriate way forward.",
      "I also appreciate the team’s curiosity and openness towards adopting new technologies and AI-enabled tools.",
      "trusted and valuable partner",
      "making a significant contribution to the delivery of key initiative",
      "Thank you to the entire team for your professionalism, commitment and consistently strong collaboration."
    ],
    "name": "Tsvetelina Lazarova",
    "role": "Senior Manager",
    "unit": "VIP ICT Support Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-08",
    "displayOrder": 8,
    "quote": "Celebrating the TOP team of A1 Master PMs 🎉\r\n\r\nWe have only been working together for a relatively short time — and not quite in the conventional sense of collaborating on business projects 😁 — yet from the very beginning, I have been impressed by the care, dedication and effort you bring to everything you do.\r\n\r\nI deeply value your energy, your readiness to support others and the unfailingly positive spirit that makes working together /whatever the topic/ a genuine pleasure.\r\nWishing you many more successful projects, bold ideas and achievements to be proud of over the next ten years!\r\n\r\nHustle together, win together!",
    "emphasis": [
      "Celebrating the TOP team of A1 Master PMs 🎉",
      "yet from the very beginning, I have been impressed by the care, dedication and effort you bring to everything you do.",
      "energy, your readiness to support others",
      "unfailingly positive spirit",
      "genuine pleasure.",
      "Wishing you many more successful projects, bold ideas and achievements to be proud of over the next ten years!"
    ],
    "name": "Teodora Karayazova",
    "role": "HR business partner",
    "unit": "Human resources area",
    "isHighlight": true
  },
  {
    "id": "VOICE-09",
    "displayOrder": 9,
    "quote": "Every successful project needs both a Sponsor and a Champion. Finding a Sponsor may be the easier part; finding a true Champion is where the real challenge begins. Over the past ten years, you have proven time and again that you are the true Champions behind our projects.\r\nHappy 10th anniversary to the team that turns every idea into reality and even the greatest chaos into a clear, well-structured plan!",
    "emphasis": [
      "the true Champions behind our projects.",
      "Happy 10th anniversary to the team that turns every idea into reality and even the greatest chaos into a clear, well-structured plan!"
    ],
    "name": "Petar Babanov",
    "role": "Principal expert",
    "unit": "Billing and Enterprise Systems Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-10",
    "displayOrder": 10,
    "quote": "Whenever I work on a project with your team, I feel an immediate sense of confidence, knowing that the work will be delivered to a high standard and in a spirit of genuine partnership and mutual respect. Thank you for being not only highly capable professionals, but also people who make collaboration genuinely enjoyable.",
    "emphasis": [
      "mmediate sense of confidence, knowing that the work will be delivered to a high standard and in a spirit of genuine partnership and mutual respect. Thank you for being not only highly capable professionals, but also people who make collaboration genuinely enjoyable."
    ],
    "name": "Georgi Tsanev",
    "role": "Senior Business analyst",
    "unit": "Billing and Enterprise Systems Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-11",
    "displayOrder": 11,
    "quote": "An outstanding team—dedicated, accountable, and always willing to go above and beyond what is expected of you. You do more than simply move projects forward; you bring commitment, energy, and heart to everything you take on. You are always ready to help, find a solution, and go the extra mile whenever needed.\r\n\r\nStef is not only an exceptional manager but also a remarkable person—with clear and structured thinking, sound judgment, and genuine care for people. He is a leader who leads by example and has truly earned the respect of all his colleagues.\r\n\r\nKeep being the outstanding team you are. It is a genuine pleasure to work with you! ❤️",
    "emphasis": [
      "outstanding team—dedicated, accountable, and always willing to go above and beyond what is expected of you.",
      "you bring commitment, energy, and heart to everything you take on. You are always ready to help, find a solution, and go the extra mile whenever needed.",
      "exceptional manager but also a remarkable person—with clear and structured thinking, sound judgment, and genuine care for people.",
      "has truly earned the respect of all his colleagues.",
      "Keep being the outstanding team you are. It is a genuine pleasure to work with you! ❤️"
    ],
    "name": "Lliliya Spasova",
    "role": "Senior Manager",
    "unit": "Residential Products, Services and Roaming Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-12",
    "displayOrder": 12,
    "quote": "My collaboration with the Project Office team has consistently been highly productive. Together, we have successfully delivered a range of initiatives, including External Financing and the exchange of data on defaulting debtors. I particularly value the clear allocation of specialized expertise among individual team members, which enables much faster familiarization with the subject matter and significantly more efficient collaboration.",
    "emphasis": [
      "My collaboration with the Project Office team",
      "has consistently been highly productive.",
      "specialized expertise among individual team members, which enables much faster familiarization with the subject matter and significantly more efficient collaboration."
    ],
    "name": "Nikolay Petrov",
    "role": "Senior Manager",
    "unit": "Customer Risk Management and Collection Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-13",
    "displayOrder": 13,
    "quote": "In my view, PPMD distinguishes itself through a consistently constructive mindset and a genuine culture of collaboration. Even when faced with differing viewpoints or highly demanding timelines, you have remained composed, pragmatic and firmly focused on finding the right solution, while adapting your approach to the needs of each SPOC involved. The successful delivery of initiatives such as Netflix, e-ticket and SkyShowtime is a clear testament to the value and impact of this way of working.\r\n\r\nMy sincere thanks to every colleague across the department for your professionalism, commitment and continued support.",
    "emphasis": [
      "consistently constructive mindset and a genuine culture of collaboration",
      "adapting your approach to the needs of each SPOC involved. The successful delivery of initiatives such as Netflix, e-ticket and SkyShowtime is a clear testament to the value and impact of this way of working.",
      "My sincere thanks to every colleague across the department for your professionalism, commitment and continued support."
    ],
    "name": "Hristo Valkov",
    "role": "Senior Manager",
    "unit": "Marketing Communications Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-14",
    "displayOrder": 14,
    "quote": "A complex project? A tight deadline? A seemingly impossible task? This team always finds a way forward—and does it with a smile! They turns complex challenges into achievable outcomes and great ideas into tangible results. Professionalism, exceptional energy, and people who are genuinely a pleasure to work with!",
    "emphasis": [
      "This team always finds a way forward—and does it with a smile!",
      "turns complex challenges into achievable outcomes and great ideas into tangible results",
      "Professionalism, exceptional energy, and people who are genuinely a pleasure to work with!"
    ],
    "name": "Radostina Kalburova",
    "role": "Senior Business Analyst",
    "unit": "Operational Support Systems Department",
    "isHighlight": true
  },
  {
    "id": "VOICE-15",
    "displayOrder": 15,
    "quote": "Collaborating with the Project & Process Management Department is a genuine pleasure. The team brings energy, flexibility and a consistently positive attitude to every interaction, making work progress quickly, smoothly and without unnecessary complexity. We can always rely on their support, and I particularly value their readiness to adapt and find practical solutions, even when circumstances require an immediate response. They are a highly dependable and collaborative team that makes working together both effective and enjoyable.",
    "emphasis": [
      "Collaborating",
      "is a genuine pleasure.",
      "energy, flexibility and a consistently positive attitude to every interaction, making work progress quickly, smoothly and without unnecessary complexity",
      "We can always rely on their support,",
      "They are a highly dependable and collaborative team that makes working together both effective and enjoyable."
    ],
    "name": "Mariya Peychevska",
    "role": "Chief Legal Advisor",
    "unit": "Legal & Regulatory Affairs Area",
    "isHighlight": false
  },
  {
    "id": "VOICE-16",
    "displayOrder": 16,
    "quote": "The Project and Process Management team plays an important role in our day-to-day work. I particularly appreciate their strong organization, their ability to coordinate across different teams and their focus on keeping things moving, especially when timelines are tight and topics are complex.\r\n\r\nWhat I value most is their collaborative approach — being attentive to colleagues, open to different perspectives and willing to support while keeping the end result in sight. I appreciate the professionalism, positive energy and commitment they bring to our joint work.\r\n\r\nHappy anniversary, and wishing the team continued success and many more achievements together!",
    "emphasis": [
      "team plays an important role in our day-to-day work.",
      "strong organization, their ability to coordinate across different teams and their focus on keeping things moving, especially when timelines are tight and topics are complex.",
      "being attentive to colleagues, open to different perspectives",
      "willing to support",
      "Happy anniversary, and wishing the team continued success and many more achievements together!"
    ],
    "name": "Hristina Burdasheva",
    "role": "Senior Director",
    "unit": "Legal & Regulatory Affairs Area",
    "isHighlight": false
  },
  {
    "id": "VOICE-18",
    "displayOrder": 18,
    "quote": "Ten years — and still going strong after tight deadlines, changing requirements and countless  last-minute surprises. If that isn’t teamwork, I don’t know what is! \r\nHere’s to another ten years of coffee, successful projects and plenty of good emotions!",
    "emphasis": [
      "still",
      "going",
      "strong",
      "tight deadlines, changing requirements and countless  last-minute surprises. If that isn’t teamwork, I don’t know what is!",
      "Here’s to another ten years of coffee, successful projects and plenty of good emotions!"
    ],
    "name": "Diyana Neycheva",
    "role": "Change Management Group Supervisor",
    "unit": "Customer Service Division",
    "isHighlight": false
  },
  {
    "id": "VOICE-19",
    "displayOrder": 19,
    "quote": "The Project Management team brings together an exceptional group of highly capable professionals. Communication with every team member has consistently been open, constructive and straightforward, and they are always ready to offer support whenever it is needed. They lead projects with confidence, energy and an impressive drive to deliver. You are an outstanding team — keep up the excellent work!",
    "emphasis": [
      "Communication",
      "open, constructive and straightforward",
      "always ready to offer support whenever it is needed.",
      "They lead projects with confidence, energy and an impressive drive to delive",
      ". You are an outstanding team — keep up the excellent work!"
    ],
    "name": "Simeon Tomov",
    "role": "Technical Lead and Senior Software Engineer",
    "unit": "Operational Support Systems Department",
    "isHighlight": false
  },
  {
    "id": "VOICE-20",
    "displayOrder": 20,
    "quote": "I would like to give a resounding BRAVO to our colleagues in PPMD! 👏\r\n\r\nBeyond being exceptional professionals, what I value most is the way you work with your internal customers — with a genuine understanding of the business, its needs and, sometimes… our “we need it as of yesterday” situations. 😊\r\n\r\nYour focus is always on “How can we make it happen?”, rather than on “Why it cannot be done”. Even when the situation is critical, the timelines seem impossible and the right solution is far from obvious, you keep exploring options, proposing alternatives and finding a way forward.\r\n\r\nThank you for your professionalism, flexibility and, above all, the genuine partnership you bring to everything we do together! ❤️\r\n\r\nAnd last, but certainly not least — beyond everything you bring professionally, you are also genuinely great people! That makes working together not only successful, but truly enjoyable. 😊\r\n\r\nPPMD, you are an exceptional team! 👏",
    "emphasis": [
      "I would like to give a resounding BRAVO to our colleagues in PPMD! 👏",
      "genuine understanding of the business, its needs and, sometimes… our “we need it as of yesterday” situations. 😊",
      "How can we make it happen?",
      "finding a way forward.",
      "Thank you for your professionalism, flexibility and, above all, the genuine partnership you bring to everything we do together! ❤️",
      "you are also genuinely great people! That makes working together not only successful, but truly enjoyable. 😊",
      "PPMD, you are an exceptional team! 👏"
    ],
    "name": "Maya Rakovska",
    "role": "Director",
    "unit": "Products & Services and Roaming Division",
    "isHighlight": false
  },
  {
    "id": "VOICE-21",
    "displayOrder": 21,
    "quote": "An exceptional team that consistently delves into the details of every project and takes a flexible, solution-oriented approach to each challenge.",
    "emphasis": [
      "exceptional team that consistently delves into the details of every project",
      "flexible, solution-oriented approach to each challenge."
    ],
    "name": "Alexander Krastev",
    "role": "Senior Manager",
    "unit": "Product Portfolio and Device Management Department",
    "isHighlight": false
  }
]

export const WB_CLOSING: WorkbookClosingLine[] = [
  {
    "key": "closing.statement_1",
    "text": "A DECADE BUILT BY PEOPLE. PROVEN THROUGH DELIVERY."
  },
  {
    "key": "closing.statement_2",
    "text": "THE NEXT TEN START NOW."
  },
  {
    "key": "closing.identity",
    "text": "PPMD",
    "supporting": "Project & Processes Management Department · A1 Bulgaria · 2016—2026"
  },
  {
    "key": "closing.footer",
    "text": "PPMD · TEN YEARS IN MOTION · 2016—2026"
  }
]

export const WB_NAVIGATION: WorkbookNavItem[] = [
  {
    "id": "NAV-HERO",
    "displayOrder": 1,
    "label": "Hero",
    "anchor": "hero",
    "showWhenProjectsDisabled": true
  },
  {
    "id": "NAV-CAP",
    "displayOrder": 2,
    "label": "Capabilities",
    "anchor": "capabilities",
    "showWhenProjectsDisabled": true
  },
  {
    "id": "NAV-TIME",
    "displayOrder": 3,
    "label": "Timeline",
    "anchor": "timeline",
    "showWhenProjectsDisabled": true
  },
  {
    "id": "NAV-PROJ",
    "displayOrder": 4,
    "label": "Projects",
    "anchor": "projects",
    "showWhenProjectsDisabled": false
  },
  {
    "id": "NAV-TEAMS",
    "displayOrder": 5,
    "label": "Teams",
    "anchor": "teams",
    "showWhenProjectsDisabled": true
  },
  {
    "id": "NAV-FOCUS",
    "displayOrder": 6,
    "label": "Focus",
    "anchor": "focus",
    "showWhenProjectsDisabled": true
  },
  {
    "id": "NAV-VOICES",
    "displayOrder": 7,
    "label": "Voices",
    "anchor": "voices",
    "showWhenProjectsDisabled": true
  },
  {
    "id": "NAV-CLOSE",
    "displayOrder": 8,
    "label": "Closing",
    "anchor": "closing",
    "showWhenProjectsDisabled": true
  }
]

export const WB_SITE_CONFIG: Record<string, string> = {
  "showProjectsSection": "TRUE",
  "anniversaryStartYear": "2016",
  "anniversaryEndYear": "2026",
  "departmentName": "Project & Processes Management Department",
  "departmentAbbreviation": "PPMD"
}
