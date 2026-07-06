const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, LevelFormat
} = require("docx");

const BLUE = "0F6CBD";
const DARK = "1F2937";
const GREY = "6B7280";
const LIGHT = "EAF2FB";

// helpers
const lead = (label, text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 70, line: 240 },
  children: [
    new TextRun({ text: label + " ", bold: true, color: opts.lblColor ?? BLUE, size: 17 }),
    new TextRun({ text, size: 17, color: DARK }),
  ],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "b", level: 0 },
  spacing: { after: 30, line: 232 },
  children: [new TextRun({ text, size: 17, color: DARK })],
});

const cellHead = (title, tag) => new Paragraph({
  spacing: { after: 60 },
  children: [
    new TextRun({ text: title, bold: true, color: "FFFFFF", size: 19 }),
    new TextRun({ text: "  " + tag, italics: true, color: "DCE9F7", size: 15 }),
  ],
});

function motionCell(title, tag, tagline, objective, doItems, cadence, ask) {
  const kids = [
    new Paragraph({
      shading: { fill: BLUE, type: ShadingType.CLEAR },
      spacing: { before: 0, after: 0 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BLUE } },
      children: cellHead(title, tag).options ? [] : [],
    }),
  ];
  // simpler: build inner paragraphs
  return new TableCell({
    width: { size: 4920, type: WidthType.DXA },
    margins: { top: 80, bottom: 100, left: 140, right: 140 },
    verticalAlign: VerticalAlign.TOP,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
    },
    children: [
      new Paragraph({
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: title, bold: true, color: "FFFFFF", size: 18 }),
        ],
      }),
      new Paragraph({
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: tag, italics: true, color: "DCE9F7", size: 15 })],
      }),
      new Paragraph({
        spacing: { before: 60, after: 80, line: 236 },
        children: [new TextRun({ text: tagline, bold: true, italics: true, color: DARK, size: 17 })],
      }),
      lead("Objective:", objective),
      new Paragraph({ spacing: { before: 30, after: 20 }, children: [new TextRun({ text: "What I\u2019ll do", bold: true, color: BLUE, size: 17 })] }),
      ...doItems.map(bullet),
      lead("Cadence:", cadence, { after: 60 }),
      lead("The ask to Laurie:", ask, { after: 20, lblColor: "B45309" }),
    ],
  });
}

const m1 = motionCell(
  "Motion 1 \u2014 Priority Account Activation",
  "Targeted \u00b7 depth on named accounts \u00b7 demonstrate Hub value",
  "Bring the Hub to my priority account teams to move the needle on their customers.",
  "Partner with each AE/ATS to plan initial customer journeys, map Hub engagements to live MSX opportunities, and surface cross-solution value early \u2014 without committing the full architect bench.",
  [
    "Run a working session per account: review the top MSX opportunities and pick 1\u20132 to anchor an initial journey.",
    "Walk the team through our process (envisioning \u2192 architecture \u2192 rapid prototype \u2192 hackathon) and the one-pager that fits.",
    "Show how a Hub motion can start lightweight \u2014 with just me \u2014 scaling architects only once it is validated.",
    "Ask to be a standing participant in their account-planning meetings.",
  ],
  "Light recurring sync per account; agreed next step + outcome recorded in MSX.",
  "Endorse a standing seat for me in priority-account planning."
);

const m2 = motionCell(
  "Motion 2 \u2014 SE Community Innovation Exchange",
  "Scale \u00b7 awareness across the SE org \u00b7 two-way learning",
  "Plug into SE leaders\u2019 existing meetings to broadcast what the Hub is building.",
  "Create awareness across the SE org of the cutting-edge rapid prototypes we deliver with customers, so field SEs can reuse them \u2014 and so we learn what they are seeing in their own accounts.",
  [
    "Join the regular team meetings run by Joyce, Bill Bladasti, and other SE managers.",
    "Demo the newest innovative outcomes from recent Hub engagements \u2014 live prototypes, not slides.",
    "Hand off reusable assets and patterns SEs can take directly into their customer work.",
    "Capture field signals back into the Hub to shape our next prototypes.",
  ],
  "Recurring guest slot inside existing SE forums \u2014 no new meeting overhead.",
  "A warm intro to Joyce and Bill, and support for a recurring Hub demo slot."
);

const doc = new Document({
  numbering: {
    config: [{
      reference: "b",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { run: { color: BLUE }, paragraph: { indent: { left: 260, hanging: 180 } } } }],
    }],
  },
  styles: { default: { document: { run: { font: "Arial", size: 18, color: DARK } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, right: 900, bottom: 600, left: 900 } } },
    children: [
      // Title band
      new Paragraph({
        spacing: { after: 20 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: BLUE, space: 4 } },
        children: [new TextRun({ text: "Proactive Engagement Plan", bold: true, size: 40, color: BLUE })],
      }),
      new Paragraph({
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({ text: "Two motions to extend the Innovation Hub \u2014 deeper into priority accounts and wider across the SE community", size: 19, color: DARK }),
        ],
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({ text: "Mark Franco", bold: true, size: 16, color: GREY }),
          new TextRun({ text: "  \u00b7  Sr Solution Engineer, Americas Innovation Hub  \u00b7  Prepared for Laurie Roseland-Barnes  \u00b7  FY26", size: 16, color: GREY }),
        ],
      }),
      // Objective (single-cell table for a clean bordered box)
      new Table({
        width: { size: 10440, type: WidthType.DXA },
        columnWidths: [10440],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "C7D7E8" },
          insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
        },
        rows: [new TableRow({ children: [new TableCell({
          width: { size: 10440, type: WidthType.DXA },
          shading: { fill: LIGHT, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          children: [new Paragraph({
            spacing: { after: 0, line: 240 },
            children: [
              new TextRun({ text: "My intent:  ", bold: true, size: 18, color: BLUE }),
              new TextRun({ text: "Stop waiting for inbound and proactively put the Hub in front of the people who shape customer outcomes. Both motions below are proactive \u2014 ", size: 18 }),
              new TextRun({ text: "Motion 1 drives depth", bold: true, size: 18 }),
              new TextRun({ text: " on named priority accounts and demonstrates Hub value; ", size: 18 }),
              new TextRun({ text: "Motion 2 drives breadth", bold: true, size: 18 }),
              new TextRun({ text: " \u2014 awareness of our innovation across the SE community, with a two-way learning loop.", size: 18 }),
            ],
          })],
        })] })],
      }),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      // Two-motion table
      new Table({
        width: { size: 10440, type: WidthType.DXA },
        columnWidths: [5220, 5220],
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
        },
        rows: [new TableRow({ children: [m1, m2] })],
      }),
      // Proof points
      new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [new TextRun({ text: "Proof points I can demo now (live, customer-built rapid prototypes)", bold: true, size: 18, color: BLUE })],
      }),
      new Paragraph({
        spacing: { after: 60, line: 236 },
        children: [new TextRun({ text: "Hydro One \u2014 Agentic AI rapid prototype  \u00b7  Magna International \u2014 M365 Copilot + SAP integration  \u00b7  Scotiabank \u2014 Agent Day (retail banking ops)  \u00b7  Brookfield \u2014 IT-in-a-Box  \u00b7  Bombardier \u2014 architecture design session", size: 16, color: DARK })],
      }),
      new Paragraph({
        spacing: { before: 60, after: 40 },
        children: [
          new TextRun({ text: "Priority accounts in scope (Motion 1):  ", bold: true, size: 17, color: BLUE }),
          new TextRun({ text: "BMO  \u00b7  Constellation Software  \u00b7  Government of Ontario  \u00b7  Metrolinx  \u00b7  RBC  \u00b7  Saputo  \u00b7  WSIB  \u00b7  WSP", size: 16, color: DARK }),
        ],
      }),
      new Paragraph({
        spacing: { before: 60, after: 0 },
        children: [
          new TextRun({ text: "How I\u2019ll measure it:  ", bold: true, size: 17, color: BLUE }),
          new TextRun({ text: "priority accounts with a planned journey and a standing planning seat  \u00b7  MSX opportunities mapped to a Hub motion  \u00b7  SE forums with a recurring Hub demo slot  \u00b7  reusable assets shared and field insights captured.", size: 16, color: DARK }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("C:/projects/documentation/pro-active-planning/Proactive Engagement Plan - Mark Franco.docx", buf);
  console.log("written");
});
