// Reference example: https://ui.tailor.tech/patterns/supplier-cascader
export type MockSupplier = {
  id: string;
  companyName: string;
  groupIds: string[];
};

export type MockGroup = {
  id: string;
  name: string;
  memberCount: number;
};

export const MOCK_GROUPS: MockGroup[] = [
  { id: "asset", name: "Asset Management Division", memberCount: 109 },
  { id: "engineering", name: "Engineering Division", memberCount: 41 },
  { id: "digital", name: "Digital Transformation Dept.", memberCount: 38 },
  { id: "procurement", name: "Procurement Division", memberCount: 72 },
  { id: "quality", name: "Quality Assurance Dept.", memberCount: 24 },
  { id: "overseas", name: "Overseas Business Division", memberCount: 56 },
  { id: "sustainability", name: "Sustainability Office", memberCount: 18 },
  { id: "logistics", name: "Logistics & Delivery Dept.", memberCount: 33 },
];

export const MOCK_SUPPLIERS: MockSupplier[] = [
  {
    id: "s-eng-1",
    companyName: "Kanto Heavy Industries Ltd.",
    groupIds: ["engineering"],
  },
  {
    id: "s-eng-2",
    companyName: "Tanaka Metal Works Co.",
    groupIds: ["engineering"],
  },
  {
    id: "s-eng-3",
    companyName: "Suzuki Electronic Components Inc.",
    groupIds: ["engineering"],
  },
  {
    id: "s-eng-4",
    companyName: "Naha Materials Co.",
    groupIds: ["engineering"],
  },
  {
    id: "s-eng-5",
    companyName: "Tokai Precision Ltd.",
    groupIds: ["engineering"],
  },
  {
    id: "s-asset-1",
    companyName: "Tailor Supply Co.",
    groupIds: ["asset"],
  },
  {
    id: "s-asset-2",
    companyName: "Hokuriku Parts Industries Ltd.",
    groupIds: ["asset"],
  },
  {
    id: "s-digital-1",
    companyName: "Digital Works Inc.",
    groupIds: ["digital"],
  },
  {
    id: "s-digital-2",
    companyName: "Cloud Materials LLC",
    groupIds: ["digital"],
  },
  {
    id: "s-proc-1",
    companyName: "West Japan Trading Co.",
    groupIds: ["procurement"],
  },
  {
    id: "s-proc-2",
    companyName: "Chubu Procurement Services Inc.",
    groupIds: ["procurement"],
  },
  {
    id: "s-quality-1",
    companyName: "Quality Inspection Center Co.",
    groupIds: ["quality"],
  },
  {
    id: "s-overseas-1",
    companyName: "Global Parts Pte. Ltd.",
    groupIds: ["overseas"],
  },
  {
    id: "s-overseas-2",
    companyName: "Shanghai Components Co.",
    groupIds: ["overseas"],
  },
  {
    id: "s-sus-1",
    companyName: "Green Supply Chain Inc.",
    groupIds: ["sustainability"],
  },
  {
    id: "s-log-1",
    companyName: "Kansai Logistics Partners Ltd.",
    groupIds: ["logistics"],
  },
  {
    id: "s-unaff-1",
    companyName: "Independent Parts Works",
    groupIds: [],
  },
  {
    id: "s-unaff-2",
    companyName: "Freehand Co.",
    groupIds: [],
  },
  {
    id: "s-unaff-3",
    companyName: "Jonan Industrial Co.",
    groupIds: [],
  },
];

export const MOCK_TOTAL_ACTIVE_COUNT = 436;

export const PAGE_SIZE = 8;
