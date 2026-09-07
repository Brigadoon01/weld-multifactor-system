export interface OcpDataPoint {
  day: number;
  label: string;
  "smaw-160": number;
  "smaw-170": number;
  "smaw-180": number;
  "gmaw-160": number;
  "gmaw-170": number;
  "gmaw-180": number;
  control: number;
}

export const ocpTimeSeriesData: OcpDataPoint[] = [
  { day: 0, label: "Day 0", "smaw-160": -80, "smaw-170": -80, "smaw-180": -100, "gmaw-160": -412, "gmaw-170": -297, "gmaw-180": -295, control: -125 },
  { day: 3, label: "Day 3", "smaw-160": -112, "smaw-170": -112, "smaw-180": -135, "gmaw-160": -495, "gmaw-170": -445, "gmaw-180": -402, control: -112 },
  { day: 6, label: "Day 6", "smaw-160": -120, "smaw-170": -122, "smaw-180": -120, "gmaw-160": -542, "gmaw-170": -508, "gmaw-180": -450, control: -115 },
  { day: 9, label: "Day 9", "smaw-160": -155, "smaw-170": -170, "smaw-180": -145, "gmaw-160": -575, "gmaw-170": -535, "gmaw-180": -508, control: -142 },
  { day: 12, label: "Day 12", "smaw-160": -168, "smaw-170": -168, "smaw-180": -148, "gmaw-160": -578, "gmaw-170": -545, "gmaw-180": -520, control: -150 },
  { day: 15, label: "Day 15", "smaw-160": -170, "smaw-170": -160, "smaw-180": -158, "gmaw-160": -572, "gmaw-170": -540, "gmaw-180": -518, control: -167 },
  { day: 18, label: "Day 18", "smaw-160": -198, "smaw-170": -202, "smaw-180": -195, "gmaw-160": -590, "gmaw-170": -490, "gmaw-180": -472, control: -190 },
  { day: 21, label: "Day 21", "smaw-160": -252, "smaw-170": -262, "smaw-180": -252, "gmaw-160": -595, "gmaw-170": -575, "gmaw-180": -555, control: -307 },
  { day: 25, label: "Day 25", "smaw-160": -225, "smaw-170": -218, "smaw-180": -218, "gmaw-160": -585, "gmaw-170": -542, "gmaw-180": -512, control: -250 },
  { day: 28, label: "Day 28", "smaw-160": -245, "smaw-170": -262, "smaw-180": -232, "gmaw-160": -575, "gmaw-170": -545, "gmaw-180": -512, control: -225 },
];

export interface MassLossDataPoint {
  day: number;
  label: string;
  "smaw-160": number;
  "smaw-170": number;
  "smaw-180": number;
  "gmaw-160": number;
  "gmaw-170": number;
  "gmaw-180": number;
  control: number;
}

// Cumulative % mass loss over 28 days
export const massLossTimeSeriesData: MassLossDataPoint[] = [
  { day: 0, label: "Day 0", "smaw-160": 0.0, "smaw-170": 0.0, "smaw-180": 0.0, "gmaw-160": 0.0, "gmaw-170": 0.0, "gmaw-180": 0.0, control: 0.0 },
  { day: 3, label: "Day 3", "smaw-160": 8.79, "smaw-170": 10.24, "smaw-180": 7.93, "gmaw-160": 14.27, "gmaw-170": 10.32, "gmaw-180": 9.46, control: 6.15 },
  { day: 6, label: "Day 6", "smaw-160": 11.23, "smaw-170": 14.11, "smaw-180": 10.42, "gmaw-160": 17.78, "gmaw-170": 13.32, "gmaw-180": 12.39, control: 12.33 },
  { day: 9, label: "Day 9", "smaw-160": 12.27, "smaw-170": 15.22, "smaw-180": 11.34, "gmaw-160": 18.93, "gmaw-170": 14.42, "gmaw-180": 13.33, control: 14.18 },
  { day: 12, label: "Day 12", "smaw-160": 12.55, "smaw-170": 16.07, "smaw-180": 11.67, "gmaw-160": 19.82, "gmaw-170": 14.88, "gmaw-180": 14.05, control: 15.11 },
  { day: 15, label: "Day 15", "smaw-160": 13.20, "smaw-170": 16.17, "smaw-180": 11.77, "gmaw-160": 20.63, "gmaw-170": 15.22, "gmaw-180": 14.46, control: 15.73 },
  { day: 18, label: "Day 18", "smaw-160": 13.29, "smaw-170": 16.20, "smaw-180": 11.84, "gmaw-160": 21.05, "gmaw-170": 15.45, "gmaw-180": 14.78, control: 17.43 },
  { day: 21, label: "Day 21", "smaw-160": 13.45, "smaw-170": 16.74, "smaw-180": 12.12, "gmaw-160": 21.20, "gmaw-170": 15.74, "gmaw-180": 14.82, control: 15.73 },
  { day: 25, label: "Day 25", "smaw-160": 13.79, "smaw-170": 16.81, "smaw-180": 12.17, "gmaw-160": 21.42, "gmaw-170": 15.94, "gmaw-180": 15.14, control: 16.43 },
  { day: 28, label: "Day 28", "smaw-160": 13.36, "smaw-170": 17.10, "smaw-180": 12.31, "gmaw-160": 21.78, "gmaw-170": 16.32, "gmaw-180": 15.31, control: 16.86 },
];

export interface EdsCompositionItem {
  id: string;
  name: string;
  Fe: number;
  Cr: number;
  Ni: number;
  Trace: number;
  highlight?: string;
}

export const edsCompositionData: EdsCompositionItem[] = [
  { id: "control", name: "Control", Fe: 73.91, Cr: 17.27, Ni: 7.46, Trace: 1.36, highlight: "Nominal 304 base plate" },
  { id: "smaw-160", name: "SMAW 160 A", Fe: 70.10, Cr: 17.63, Ni: 6.31, Trace: 5.96, highlight: "Intact passivity, 0% Cl/Na" },
  { id: "smaw-170", name: "SMAW 170 A", Fe: 72.81, Cr: 18.81, Ni: 6.23, Trace: 2.15, highlight: "Active pitting: 0.56% Cl, 0.37% Na" },
  { id: "gmaw-160", name: "GMAW 160 A", Fe: 72.38, Cr: 17.09, Ni: 7.64, Trace: 2.89, highlight: "Fine cellular dendritic matrix" },
  { id: "gmaw-180", name: "GMAW 180 A", Fe: 82.66, Cr: 6.21, Ni: 3.31, Trace: 7.82, highlight: "Severe Cr depletion (6.21% Cr)" },
];
