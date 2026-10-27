// Reference example: https://ui.tailor.tech/page/document-page
import type { DocumentTreeNode } from "./DocumentEditorSidebar";

/**
 * Demo content for the document editor screen. In production the tree and the
 * document bodies come from an API; everything in this file is throwaway
 * fixture data.
 *
 * Bodies are authored as the same HTML the editor persists: page references
 * carry `data-page-id` only, and titles / URLs are resolved at render time
 * (see documentPageRegistry.ts).
 */

export type DocBody = { title: string; html: string };

const pageMention = (pageId: string) =>
  `<span data-page-mention="" data-page-id="${pageId}"></span>`;

const pageEmbed = (pageId: string) =>
  `<div data-page-embed="" data-page-id="${pageId}"></div>`;

const supplierOnboardingHtml = `
<p>A guide to what Procurement, Finance, and Legal verify — and in what order — when bringing a new supplier on board. <strong>When you receive a new application, work through this page in order.</strong> For the full purchasing flow, see ${pageMention("purchasing-rules")} as well.</p>
<h2>1. Within 24 hours of receipt</h2>
<ul>
  <li>Review the <code>company profile</code> and <code>trading terms</code> submitted by the requester</li>
  <li>Open a background screening request (external service)</li>
  <li>Ask Legal to draft the master agreement</li>
</ul>
<h2>2. Credit & compliance</h2>
<ol>
  <li>Finance obtains a credit report and sets the credit limit</li>
  <li>Export-control classification (only where applicable)</li>
  <li>Check whether the engagement involves personal data; sign a DPA if needed</li>
</ol>
<blockquote>
  As a rule of thumb, cap the credit limit at 1.5x the planned annual trade volume. Exceptions require CFO approval.
</blockquote>
<h2>3. System registration</h2>
<p>Register the master record <em>only after</em> the contract is signed. See <a href="#3-System-registration">this section</a> for the detailed steps. Registering too early causes accidental orders.</p>
<pre><code class="language-bash"># Example: import the supplier master via the Tailor CLI
tailor erp suppliers import \\
  --file ./suppliers.csv \\
  --dry-run</code></pre>
<hr />
<h3>Roles</h3>
<ul>
  <li><strong>Requester</strong>: fills in the form, submits documents</li>
  <li><strong>Procurement</strong>: reviews content, manages status</li>
  <li><strong>Legal</strong>: drafts the contract, reviews clauses</li>
  <li><strong>Finance</strong>: credit check, final approval of payment terms</li>
</ul>
${pageEmbed("supplier-master")}
<p>Leave a comment on this page if anything is unclear. See ${pageMention("purchasing-rules")} for related procedures and ${pageMention("vendor-evaluation")} for evaluation criteria.</p>
`.trim();

const purchasingRulesHtml = `
<p>Internal rules covering purchase requests through to ordering. This page covers the request-to-approval flow; master data updates follow ${pageMention("supplier-master")}.</p>
<h2>Approval flow</h2>
<ol>
  <li>The requester opens a request (see ${pageMention("supplier-onboarding")} for details)</li>
  <li>Approvals run department head → Procurement → Finance, in that order</li>
  <li>Once the order is confirmed, update the supplier master</li>
</ol>
<h2>Related documents</h2>
<p>See ${pageMention("supplier-onboarding")} for new-supplier onboarding steps. ${pageMention("vendor-evaluation")} is also useful for vendor reviews.</p>
`.trim();

const vendorEvaluationHtml = `
<p>The criteria and scoring framework for vendor evaluation. See ${pageMention("purchasing-rules")} for alignment with purchasing rules and ${pageMention("incident-response")} for escalation during outages.</p>
<h2>Evaluation criteria</h2>
<ul>
  <li>Score quarterly across three axes: quality, delivery, and cost</li>
  <li>On a major incident, escalate to Procurement via ${pageMention("incident-response")}</li>
</ul>
<h2>Next actions</h2>
<p>For low-scoring vendors, set the status to "Needs improvement" in ${pageMention("supplier-master")}.</p>
`.trim();

const incidentResponseHtml = `
<p>First-response steps when an outage occurs. Use ${pageMention("release-notes")} for internal communication templates and ${pageMention("new-hire-checklist")} for onboarding material.</p>
<h2>First response (within 15 minutes)</h2>
<ol>
  <li>Open the incident channel and share the impact scope</li>
  <li>The on-call owner logs progress in ${pageMention("supplier-onboarding")}</li>
  <li>Check the contact list in ${pageMention("vendor-evaluation")} if needed</li>
</ol>
<blockquote>If customers are affected, announce it with the ${pageMention("release-notes")} template after Legal approval.</blockquote>
`.trim();

const newHireChecklistHtml = `
<p>To-dos for your first day through your first week. Use the ${pageMention("supplier-onboarding")} playbook as a reference for writing wiki pages, and check ${pageMention("day-1-schedule")} for the Day 1 flow.</p>
<h2>Day 1</h2>
<ul>
  <li>Pick up your laptop and set up the VPN</li>
  <li>Confirm your team in ${pageMention("org-chart")}</li>
  <li>Read through the onboarding material (this sidebar)</li>
</ul>
<h2>Week 1</h2>
<p>Getting familiar with ${pageMention("supplier-master")} for list operations and ${pageMention("purchasing-rules")} for purchasing rules ahead of time will make things smoother.</p>
${pageEmbed("supplier-onboarding")}
`.trim();

const stub = (
  heading: string,
  mentions: { pageId: string }[] = [
    { pageId: "purchasing-rules" },
    { pageId: "vendor-evaluation" },
  ],
) => {
  const related = `<p>Related: ${mentions.map((m) => pageMention(m.pageId)).join(", ")}.</p>`;
  return `<p>This document body is a sample. Content about "${heading}" goes here.</p>${related}<h2>Overview</h2><p>Start by laying out the prerequisites, scope, and stakeholders.</p><h2>Steps</h2><ol><li>Prepare</li><li>Execute</li><li>Review</li></ol><blockquote>Switching to another document in the left sidebar keeps your in-progress edits in place.</blockquote>`;
};

export const sampleDocTree: DocumentTreeNode[] = [
  {
    type: "folder",
    id: "f-procurement",
    name: "Procurement",
    defaultExpanded: true,
    children: [
      {
        type: "doc",
        id: "supplier-onboarding",
        title: "Supplier Onboarding Playbook",
        html: supplierOnboardingHtml,
      },
      {
        type: "doc",
        id: "purchasing-rules",
        title: "Purchasing Rules",
        html: purchasingRulesHtml,
      },
      {
        type: "doc",
        id: "vendor-evaluation",
        title: "Vendor Evaluation Framework",
        html: vendorEvaluationHtml,
      },
      {
        type: "doc",
        id: "supplier-master",
        title: "Supplier Master List",
        html: stub("Supplier Master List"),
      },
      {
        type: "folder",
        id: "f-templates",
        name: "Templates",
        children: [
          {
            type: "doc",
            id: "rfp-template",
            title: "RFP Template",
            html: stub("RFP Template", [
              { pageId: "purchasing-rules" },
              { pageId: "vendor-evaluation" },
            ]),
          },
          {
            type: "doc",
            id: "contract-template",
            title: "Master Agreement Template",
            html: stub("Master Agreement Template"),
          },
        ],
      },
    ],
  },
  {
    type: "folder",
    id: "f-operations",
    name: "Operations",
    children: [
      {
        type: "doc",
        id: "incident-response",
        title: "Incident Response Runbook",
        html: incidentResponseHtml,
      },
      {
        type: "doc",
        id: "release-notes",
        title: "Release Notes Process",
        html: stub("Release Notes Process", [
          { pageId: "incident-response" },
          { pageId: "vendor-evaluation" },
        ]),
      },
    ],
  },
  {
    type: "folder",
    id: "f-people",
    name: "People",
    children: [
      {
        type: "folder",
        id: "f-onboarding",
        name: "New Hire Onboarding",
        defaultExpanded: true,
        children: [
          {
            type: "doc",
            id: "new-hire-checklist",
            title: "New Hire Checklist",
            html: newHireChecklistHtml,
          },
          {
            type: "doc",
            id: "day-1-schedule",
            title: "Day 1 Schedule",
            html: stub("Day 1 Schedule"),
          },
        ],
      },
      {
        type: "doc",
        id: "org-chart",
        title: "Org Chart",
        html: stub("Org Chart"),
      },
    ],
  },
];

export const initialSelectedDocId = "supplier-onboarding";

export const buildInitialDocs = (): Record<string, DocBody> => {
  const map: Record<string, DocBody> = {};
  const walk = (nodes: DocumentTreeNode[]) => {
    for (const node of nodes) {
      if (node.type === "doc") map[node.id] = { title: node.title, html: node.html };
      else walk(node.children);
    }
  };
  walk(sampleDocTree);
  return map;
};

/** Folder trail + current title for the breadcrumb, e.g. ["Procurement", "Purchasing Rules"]. */
export const findDocPath = (
  nodes: DocumentTreeNode[],
  id: string,
  docs: Record<string, DocBody>,
  trail: string[] = [],
): string[] => {
  for (const node of nodes) {
    if (node.type === "doc") {
      if (node.id === id) return [...trail, docs[node.id]?.title ?? node.title];
    } else {
      const found = findDocPath(node.children, id, docs, [...trail, node.name]);
      if (found.length > 0) return found;
    }
  }
  return [];
};

export const sampleCollaborators = [
  { name: "Yamada", initial: "Y" },
  { name: "Sato", initial: "S" },
  { name: "Tanaka", initial: "T" },
];
