import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

// Load question banks
import { TARGETED_ASSESSMENT_BANK } from '../src/lib/constants/targetedAssessment.js';
import { ASSESSMENT_BANK, STAGE_THEMES } from '../src/lib/constants/assessmentBank.js';

const docChildren = [];

// Title Header
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spaceAfter: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: 'คลังชุดคำถามแบบทดสอบ Path-Finder',
        bold: true,
        size: 36, // 18pt
        color: '1A365D'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spaceAfter: { before: 0, after: 400 },
    children: [
      new TextRun({
        text: 'รวบรวมชุดคำถามโหมดล็อกเป้าหมาย (Target Lock Mode) และโหมดค้นหาตัวตน (Discovery Mode)',
        size: 24, // 12pt
        color: '4A5568'
      })
    ]
  })
);

// ==========================================
// SECTION 1: TARGET LOCK MODE
// ==========================================
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spaceBefore: 400,
    spaceAfter: 200,
    children: [
      new TextRun({
        text: 'ส่วนที่ 1: ชุดคำถามโหมดล็อกเป้าหมาย (Target Lock Mode)',
        bold: true,
        size: 32,
        color: 'C53030'
      })
    ]
  }),
  new Paragraph({
    spaceAfter: 300,
    children: [
      new TextRun({
        text: 'คำถามชุดนี้เป็นแบบทดสอบสถานการณ์จำลองเชิงลึก (Situational Judgement Test - SJT) ที่ออกแบบตามกรอบสมรรถนะเฉพาะกลุ่มสายวิชาชีพ (Functional Competency Framework) แบ่งออกเป็น 6 กลุ่มวิชาชีพหลัก',
        size: 24,
        color: '2D3748'
      })
    ]
  })
);

// Mapping Cluster Names
const CLUSTER_NAMES = {
  'medical': '1. กลุ่มวิทยาศาสตร์สุขภาพ (Medical & Health Sciences Cluster)',
  'engineering': '2. กลุ่มวิศวกรรม เทคโนโลยี และการบิน (Engineering & Technology Cluster)',
  'science': '3. กลุ่มวิทยาศาสตร์ธรรมชาติและเกษตร (Natural Sciences & Agriculture Cluster)',
  'business': '4. กลุ่มบริหาร การเงิน เศรษฐศาสตร์ และการบริการ (Business & Economics Cluster)',
  'creative': '5. กลุ่มศิลปะ สถาปัตยกรรม และนิเทศศาสตร์ (Creative & Design Cluster)',
  'social': '6. กลุ่มสังคม ภาษา ครู และกฎหมาย (Social Sciences, Education & Law Cluster)'
};

const targetedByCluster = {};
TARGETED_ASSESSMENT_BANK.forEach(q => {
  let clusterKey = 'other';
  if (q.id.startsWith('M')) clusterKey = 'medical';
  else if (q.id.startsWith('E')) clusterKey = 'engineering';
  else if (q.id.startsWith('S3')) clusterKey = 'science';
  else if (q.id.startsWith('B')) clusterKey = 'business';
  else if (q.id.startsWith('C')) clusterKey = 'creative';
  else if (q.id.startsWith('L')) clusterKey = 'social';

  if (!targetedByCluster[clusterKey]) targetedByCluster[clusterKey] = [];
  targetedByCluster[clusterKey].push(q);
});

Object.keys(CLUSTER_NAMES).forEach(clusterKey => {
  const questions = targetedByCluster[clusterKey] || [];
  if (questions.length === 0) return;

  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spaceBefore: 300,
      spaceAfter: 150,
      children: [
        new TextRun({
          text: CLUSTER_NAMES[clusterKey],
          bold: true,
          size: 28,
          color: '2B6CB0'
        })
      ]
    })
  );

  questions.forEach((q, idx) => {
    docChildren.push(
      new Paragraph({
        spaceBefore: 150,
        spaceAfter: 50,
        children: [
          new TextRun({
            text: `ข้อที่ ${idx + 1}: ${q.title}`,
            bold: true,
            size: 24,
            color: '1A202C'
          })
        ]
      }),
      new Paragraph({
        spaceAfter: 100,
        indent: { left: 240 },
        children: [
          new TextRun({
            text: `สถานการณ์: `,
            bold: true,
            size: 24,
            color: '2D3748'
          }),
          new TextRun({
            text: q.description,
            size: 24,
            color: '2D3748'
          })
        ]
      })
    );

    q.options.forEach(opt => {
      docChildren.push(
        new Paragraph({
          spaceAfter: 40,
          indent: { left: 480 },
          children: [
            new TextRun({
              text: opt.text,
              size: 24,
              color: '4A5568'
            })
          ]
        })
      );
    });

    docChildren.push(
      new Paragraph({
        spaceAfter: 100,
        children: []
      })
    );
  });
});

// ==========================================
// SECTION 2: DISCOVERY MODE
// ==========================================
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spaceBefore: 500,
    spaceAfter: 200,
    children: [
      new TextRun({
        text: 'ส่วนที่ 2: ชุดคำถามโหมดค้นหาตัวตน (Discovery Mode)',
        bold: true,
        size: 32,
        color: '2B6CB0'
      })
    ]
  }),
  new Paragraph({
    spaceAfter: 300,
    children: [
      new TextRun({
        text: 'คำถามชุดนี้เป็นแบบทดสอบสถานการณ์จำลอง 12 ด่าน (144 ข้อ) อิงตามทฤษฎี Holland RIASEC และ 5 มิติทักษะ (ตรรกะ, วิทยาศาสตร์, ภาษา, ศิลปะ, การบริหาร) เพื่อค้นหาบุคลิกภาพและความสนใจที่แท้จริงของผู้เรียน',
        size: 24,
        color: '2D3748'
      })
    ]
  })
);

STAGE_THEMES.forEach(stage => {
  const stageQuestions = ASSESSMENT_BANK.filter(q => q.stageId === stage.id);
  if (stageQuestions.length === 0) return;

  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spaceBefore: 300,
      spaceAfter: 150,
      children: [
        new TextRun({
          text: `ด่านที่ ${stage.id}: ${stage.name} (${stageQuestions.length} ข้อ)`,
          bold: true,
          size: 28,
          color: '2C7A7B'
        })
      ]
    })
  );

  stageQuestions.forEach((q, idx) => {
    docChildren.push(
      new Paragraph({
        spaceBefore: 150,
        spaceAfter: 50,
        children: [
          new TextRun({
            text: `ข้อที่ ${idx + 1}: ${q.title}`,
            bold: true,
            size: 24,
            color: '1A202C'
          })
        ]
      }),
      new Paragraph({
        spaceAfter: 100,
        indent: { left: 240 },
        children: [
          new TextRun({
            text: `สถานการณ์: `,
            bold: true,
            size: 24,
            color: '2D3748'
          }),
          new TextRun({
            text: q.description,
            size: 24,
            color: '2D3748'
          })
        ]
      })
    );

    q.options.forEach(opt => {
      docChildren.push(
        new Paragraph({
          spaceAfter: 40,
          indent: { left: 480 },
          children: [
            new TextRun({
              text: opt.text,
              size: 24,
              color: '4A5568'
            })
          ]
        })
      );
    });

    docChildren.push(
      new Paragraph({
        spaceAfter: 100,
        children: []
      })
    );
  });
});

// Build Document
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: docChildren
    }
  ]
});

// Output file path
const outputPath = path.resolve('c:/Users/User/OneDrive/Desktop/Path-Finder/PathFinder_Question_Bank.docx');

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document created successfully at ${outputPath}`);
}).catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
