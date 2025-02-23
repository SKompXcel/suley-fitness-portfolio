// src/pages/api/leetcode.js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
  await page.setViewport({ width: 1280, height: 800 });

  const profileURL = "https://leetcode.com/kianis4/";
  await page.goto(profileURL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.waitForFunction(() => document.body.innerText.includes("submissions in the past one year"), { timeout: 60000 });

  const fullText = await page.evaluate(() => document.body.innerText);
  const lines = fullText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  const scrapedData = {
    leetcode_profile_stats: {},
    profile_information: {},
    recent_submissions: [],
    languages_used: [],
    skills: {
      advanced: [],
      intermediate: [],
      fundamental: []
    },
    performance_stats: {}
  };

  // 1) Solve / Rank / Attempting
  {
    const solvedMatch = /(\d+)\s*\/\s*(\d+)\s*Solved/.exec(fullText);
    if (solvedMatch) {
      scrapedData.leetcode_profile_stats.total_solved = {
        count: parseInt(solvedMatch[1], 10),
        out_of: parseInt(solvedMatch[2], 10)
      };
    }
    const easyMatch = /Easy\s+(\d+)\s*\/\s*(\d+)/.exec(fullText);
    const medMatch = /Med.\s+(\d+)\s*\/\s*(\d+)/.exec(fullText);
    const hardMatch = /Hard\s+(\d+)\s*\/\s*(\d+)/.exec(fullText);
    scrapedData.leetcode_profile_stats.solved_by_difficulty = {
      easy: easyMatch ? { count: parseInt(easyMatch[1]), out_of: parseInt(easyMatch[2]) } : null,
      medium: medMatch ? { count: parseInt(medMatch[1]), out_of: parseInt(medMatch[2]) } : null,
      hard: hardMatch ? { count: parseInt(hardMatch[1]), out_of: parseInt(hardMatch[2]) } : null
    };
    const rankM = /Rank\s+([\d,]+)/.exec(fullText);
    if (rankM) {
      scrapedData.leetcode_profile_stats.rank = parseInt(rankM[1].replace(/,/g, ""), 10);
    }
    const attemptM = /(\d+)\s+Attempting/.exec(fullText);
    if (attemptM) {
      scrapedData.leetcode_profile_stats.currently_attempting = parseInt(attemptM[1], 10);
    }
    const subsYearM = /(\d+)\s+submissions in the past one year/.exec(fullText);
    if (subsYearM) {
      scrapedData.leetcode_profile_stats.submissions_past_year = parseInt(subsYearM[1], 10);
    }
  }

  // 2) Extract lines that show location, university, site, etc.
  {
    const rankIndex = lines.indexOf("Rank");
    const commStatsIndex = lines.indexOf("Community Stats");
    if (rankIndex !== -1 && commStatsIndex !== -1) {
      const profileBlock = lines.slice(rankIndex + 2, commStatsIndex);
      if (profileBlock.length >= 1) {
        scrapedData.profile_information.location = profileBlock[0] || null;
      }
      if (profileBlock.length >= 2) {
        scrapedData.profile_information.university = profileBlock[1] || null;
      }
      if (profileBlock.length >= 3) {
        scrapedData.profile_information.website = profileBlock[2] || null;
      }
      if (profileBlock.length >= 4) {
        scrapedData.profile_information.github = profileBlock[3] || null;
      }
      if (profileBlock.length >= 5) {
        scrapedData.profile_information.linkedin = profileBlock[4] || null;
      }
    }
  }

  // 3) Skills - same approach as before
  {
    const advancedBlock = /Advanced([\s\S]*?)(?=Intermediate|Fundamental|Badges|\n\n)/.exec(fullText);
    if (advancedBlock) {
      const linesArr = advancedBlock[1].split("\n").map(x => x.trim());
      for (const line of linesArr) {
        const match = /(.*?)x(\d+)/.exec(line);
        if (match) {
          scrapedData.skills.advanced.push({
            skill: match[1].trim(),
            count: parseInt(match[2], 10)
          });
        }
      }
    }

    const intermediateBlock = /Intermediate([\s\S]*?)(?=Fundamental|Badges|\n\n)/.exec(fullText);
    if (intermediateBlock) {
      const linesArr = intermediateBlock[1].split("\n").map(x => x.trim());
      for (const line of linesArr) {
        const match = /(.*?)x(\d+)/.exec(line);
        if (match) {
          scrapedData.skills.intermediate.push({
            skill: match[1].trim(),
            count: parseInt(match[2], 10)
          });
        }
      }
    }

    const fundamentalBlock = /Fundamental([\s\S]*?)(?=Badges|\n\n)/.exec(fullText);
    if (fundamentalBlock) {
      const linesArr = fundamentalBlock[1].split("\n").map(x => x.trim());
      for (const line of linesArr) {
        const match = /(.*?)x(\d+)/.exec(line);
        if (match) {
          scrapedData.skills.fundamental.push({
            skill: match[1].trim(),
            count: parseInt(match[2], 10)
          });
        }
      }
    }
  }

  // 4) "Recent Submissions"? Actually your text uses "Recent AC"
  {
    const blockRegex = /Recent AC\s*\n([\s\S]*?)(?=\nCopyright|$)/;
    const blockMatch = blockRegex.exec(fullText);
    if (blockMatch) {
      const linesArr = blockMatch[1].split("\n").map(l => l.trim()).filter(Boolean);
      for (let i = 0; i < linesArr.length; i += 2) {
        const title = linesArr[i];
        const time = linesArr[i + 1] || "";
        if (/(^List$|^Solutions$|^Discuss$)/i.test(title)) continue;
        scrapedData.recent_submissions.push({
          title,
          time_ago: time
        });
      }
    }
  }

  // 5) "Languages used" e.g. "Python3\n317 problems solved"
  {
    for (let i = 0; i < lines.length - 1; i++) {
      const line1 = lines[i];
      const line2 = lines[i + 1];
      const match = /^(\d+)\s+problems solved$/.exec(line2);
      if (match) {
        scrapedData.languages_used.push({
          name: line1,
          count: parseInt(match[1], 10)
        });
      }
    }
  }

  await browser.close();
  res.status(200).json(scrapedData);
}