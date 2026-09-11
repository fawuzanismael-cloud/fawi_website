export const NATURAL_SCIENCE_DEPARTMENTS = [
  {
    id: "dept-statistics",
    code: "STAT",
    name: "Statistics",
    shortName: "Statistics",
    description: "Probability, inferential statistics, data modeling and research design.",
  },
  {
    id: "dept-computer-science",
    code: "CS",
    name: "Computer Science",
    shortName: "CS",
    description: "Algorithms, data structures, operating systems, networking and software engineering.",
  },
  {
    id: "dept-mathematics",
    code: "MATH",
    name: "Mathematics",
    shortName: "Mathematics",
    description: "Calculus, linear algebra, real analysis and quantitative reasoning.",
  },
  {
    id: "dept-physics",
    code: "PHYS",
    name: "Physics",
    shortName: "Physics",
    description: "Mechanics, electricity, modern physics and laboratory problem solving.",
  },
  {
    id: "dept-chemistry",
    code: "CHEM",
    name: "Chemistry",
    shortName: "Chemistry",
    description: "Organic, inorganic, physical chemistry and applied analytical chemistry.",
  },
  {
    id: "dept-biology",
    code: "BIO",
    name: "Biology",
    shortName: "Biology",
    description: "Genetics, ecology, anatomy and exam-centered life science practice.",
  },
  {
    id: "dept-geology",
    code: "GEO",
    name: "Geology",
    shortName: "Geology",
    description: "Mineralogy, geodynamics, earth systems and geological interpretation.",
  },
  {
    id: "dept-biotechnology",
    code: "BIOT",
    name: "Biotechnology",
    shortName: "Biotech",
    description: "Cell biology, molecular methods, genetic engineering and biotech applications.",
  },
] as const;

export const ACADEMIC_YEARS = [
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

export const DEPARTMENT_MAP = Object.fromEntries(
  NATURAL_SCIENCE_DEPARTMENTS.map((department) => [department.code, department]),
) as Record<string, (typeof NATURAL_SCIENCE_DEPARTMENTS)[number]>;
