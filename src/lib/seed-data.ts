export const DEPARTMENT_CATALOG = [
  {
    code: "STAT",
    name: "Statistics",
    shortName: "Statistics",
    description: "Probability, inferential statistics, data modeling and research design.",
  },
  {
    code: "CS",
    name: "Computer Science",
    shortName: "CS",
    description: "Algorithms, data structures, networking, software engineering and systems.",
  },
  {
    code: "MATH",
    name: "Mathematics",
    shortName: "Mathematics",
    description: "Calculus, linear algebra, analysis and quantitative reasoning.",
  },
  {
    code: "PHYS",
    name: "Physics",
    shortName: "Physics",
    description: "Mechanics, electricity, modern physics and applied problem solving.",
  },
  {
    code: "CHEM",
    name: "Chemistry",
    shortName: "Chemistry",
    description: "Organic, inorganic and physical chemistry with analytical methods.",
  },
  {
    code: "BIO",
    name: "Biology",
    shortName: "Biology",
    description: "Genetics, ecology, anatomy and molecular life science practice.",
  },
  {
    code: "GEO",
    name: "Geology",
    shortName: "Geology",
    description: "Earth systems, minerals, geophysics and geological interpretation.",
  },
  {
    code: "BIOT",
    name: "Biotechnology",
    shortName: "Biotech",
    description: "Genetic engineering, molecular biology and applied biotech methods.",
  },
] as const;

export function buildEthiopianExamYears() {
  const currentGregorianYear = new Date().getFullYear();
  const currentEthiopianYear = currentGregorianYear - 7;
  const startYear = 2015;
  const years: string[] = [];

  for (let year = startYear; year <= currentEthiopianYear; year += 1) {
    years.push(`${year}/${year + 1}`);
  }

  return years;
}
