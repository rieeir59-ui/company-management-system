
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const allFileNames = [
  "Architect's Supplemental Instructions",
  "Bill of Quantity",
  "Change Order",
  "Consent of Surety (Retainage)",
  "Consent of Surety (Final Payment)",
  "Construction Change Directive",
  "Construction Activity Schedule",
  "Continuation Sheet",
  "Drawings List",
  "Instruction Sheet",
  "List of Contractors",
  "List of Sub-Consultants",
  "Preliminary Project Budget",
  "Project Agreement",
  "Project Application Summary",
  "Project Checklist",
  "Project Data",
  "Proposal Request",
  "Rate Analysis",
  "Shop Drawing and Sample Record",
  "Timeline Schedule",
  "Commercial Timeline",
  "Residential Timeline",
  "Askari Bank Timeline",
  "Bank Alfalah Timeline",
  "Bank Al Habib Timeline",
  "CBD Timeline",
  "DIB Timeline",
  "FBL Timeline",
  "HBL Timeline",
  "MCB Timeline",
  "UBL Timeline",
  "My Projects",
  "Task Assignment",
  "Site Visit Proforma",
  "Site Survey Report",
  "Uploaded File"
];

const fileNameToUrlMap: Record<string, string> = {
  "Architect's Supplemental Instructions": "architects-instructions",
  "Bill of Quantity": "bill-of-quantity",
  "Change Order": "change-order",
  "Consent of Surety (Retainage)": "consent-of-surety",
  "Consent of Surety (Final Payment)": "consent-of-surety",
  "Construction Change Directive": "construction-change-director",
  "Construction Activity Schedule": "construction-schedule",
  "Continuation Sheet": "continuation-sheet",
  "Drawings List": "drawings",
  "Instruction Sheet": "instruction-sheet",
  "List of Contractors": "list-of-contractors",
  "List of Sub-Consultants": "list-of-sub-consultants",
  "Preliminary Project Budget": "preliminary-project-budget",
  "Project Agreement": "project-agreement",
  "Project Application Summary": "project-application-summary",
  "Project Checklist": "project-checklist",
  "Project Data": "project-data",
  "Proposal Request": "proposal-request",
  "Rate Analysis": "rate-analysis",
  "Shop Drawing and Sample Record": "shop-drawings-record",
  "Timeline Schedule": "time-line-schedule",
  "Commercial Timeline": "timelines-of-bank/commercial",
  "Residential Timeline": "timelines-of-bank/residential",
  "Askari Bank Timeline": "timelines-of-bank/askari-bank",
  "Bank Alfalah Timeline": "timelines-of-bank/bank-alfalah",
  "Bank Al Habib Timeline": "timelines-of-bank/bank-al-habib",
  "CBD Timeline": "timelines-of-bank/cbd",
  "DIB Timeline": "timelines-of-bank/dib",
  "FBL Timeline": "timelines-of-bank/fbl",
  "HBL Timeline": "timelines-of-bank/hbl",
  "MCB Timeline": "timelines-of-bank/mcb",
  "UBL Timeline": "timelines-of-bank/ubl",
  "My Projects": "my-projects",
};

export function getFormUrlFromFileName(fileName: string, dashboardPrefix: 'dashboard' | 'employee-dashboard'): string | null {
  const slug = fileNameToUrlMap[fileName];
  if (slug) {
    return `/${dashboardPrefix}/${slug}`;
  }
  return null;
}
