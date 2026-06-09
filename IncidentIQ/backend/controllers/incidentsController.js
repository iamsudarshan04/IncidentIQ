const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const db = require('../database');
const aiService = require('../services/aiService');

exports.processOcr = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const processedImageBuffer = await sharp(req.file.buffer)
      .greyscale()
      .normalize()
      .png()
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(
      processedImageBuffer,
      'eng'
    );

    res.json({ text: text.trim() });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Failed to process image OCR' });
  }
};

exports.testAi = async (req, res) => {
  const prompt = `Test prompt. Return a tiny Markdown document with exactly the heading "# Incident Summary" and the content "AI is successfully integrated."`;

  try {
    const response = await aiService.generateContent(prompt);
    res.json({ result: response.text, provider: response.provider });
  } catch (err) {
    console.error('AI Test Error:', err);
    res.status(500).json({ error: 'Failed to generate from AI', details: err.message });
  }
};

exports.createIncident = async (req, res) => {
  const { title, timeline, logs, gitDiff, ocrText } = req.body;

  try {
    db.run(
      `INSERT INTO Incidents (title, developer_id, timeline_text, logs_text, git_diff_text, ocr_text) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, req.user.id, timeline, logs, gitDiff, ocrText],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Failed to save incident' });
        
        const incidentId = this.lastID;

        const prompt = `You are a Multi-Agent AI System tasked with performing Root Cause Analysis.
Act sequentially as the following 6 agents:

Agent 1: Input Processing Agent - Clean and normalize the data.
Agent 2: Timeline Analysis Agent - Extract events and build a chronological sequence.
Agent 3: Log Analysis Agent - Identify errors and patterns from the logs.
Agent 4: Git Diff Analysis Agent - Correlate risky code changes (if provided).
Agent 5: Root Cause Analysis Agent - Combine findings to identify the root cause and calculate a confidence score (0-100).
Agent 6: RCA Report Generation Agent - Generate the final structured Markdown report.

You MUST format your ONLY output as a single valid Markdown document.
You MUST NOT return JSON. You MUST NOT return plain text.
You MUST include EXACTLY the following headings in your Markdown document, in this order:

# Incident Summary
# Timeline Analysis
# Error Analysis
# Git Diff Analysis
# Root Cause
# Impact Assessment
# Severity
# Confidence Score
# Recommended Fixes
# Prevention Actions

For "Severity", it MUST be exactly one of: Low, Medium, High, Critical.
For "Confidence Score", it MUST be just a number between 0 and 100.

Incident Data:
Title: ${title}
Timeline: ${timeline}
Logs: ${logs}
Git Diff: ${gitDiff}
OCR Data: ${ocrText}`;

        let markdownReport = '';
        let execSummary = '';
        let severity = 'Medium';
        let confidence = 85;

        try {
          const response = await aiService.generateContent(prompt, 'rca');
          markdownReport = response.text.trim();
          console.log(`[Backend Log] RCA generated successfully via ${response.provider} for Incident ID: ${incidentId}`);

          // Extract Severity
          const severityMatch = markdownReport.match(/#\s*Severity\s*\n+([A-Za-z]+)/i);
          if (severityMatch && severityMatch[1]) {
            const parsedSeverity = severityMatch[1].trim();
            if (['Low', 'Medium', 'High', 'Critical'].includes(parsedSeverity)) {
              severity = parsedSeverity;
            }
          }

          // Extract Confidence
          const confidenceMatch = markdownReport.match(/#\s*Confidence Score\s*\n+(\d+)/i);
          if (confidenceMatch && confidenceMatch[1]) {
            confidence = parseInt(confidenceMatch[1].trim(), 10) || confidence;
          }
          
          // Extract a snippet for executive summary
          const execMatch = markdownReport.match(/#\s*Incident Summary\s*\n+([\s\S]*?)(?=#\s*Timeline Analysis)/i);
          if (execMatch && execMatch[1]) {
             execSummary = execMatch[1].trim().substring(0, 150) + '...';
          }

        } catch (genErr) {
          console.error("[Backend Log] AI Generation Error:", genErr);
          return res.status(500).json({ error: 'Failed to generate RCA report via AI.', details: genErr.message || 'Unknown API Error' });
        }

        db.run(
          `INSERT INTO RCAReports (incident_id, developer_id, executive_summary, root_cause, markdown_report, confidence_score, severity_level, recommendations) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [incidentId, req.user.id, execSummary, '', markdownReport, confidence, severity, ''],
          function (err2) {
            if (err2) {
              console.error("[Backend Log] Database Save Error for Report:", err2);
              return res.status(500).json({ error: `Failed to save generated report to database: ${err2.message}` });
            }
            console.log(`[Backend Log] Report saved to SQLite successfully.`);
            console.log(`[Backend Log] Generated Report ID: ${this.lastID} for Incident ID: ${incidentId}`);
            res.status(201).json({ message: 'Incident analyzed and report generated', incidentId, reportId: this.lastID });
          }
        );
      }
    );
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: 'Server error during incident creation' });
  }
};
