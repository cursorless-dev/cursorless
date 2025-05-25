#!/usr/bin/env node

/**
 * Script to generate multiple llms.txt files following the llms.txt specification.
 * See https://llmstxt.org/ for format details.
 */

import * as fs from "fs/promises";
import * as path from "path";

/**
 * Recursively find all markdown files in a directory
 * @param dir The directory to search
 * @returns Array of file paths
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const filesPromises = entries.map(async (entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findMarkdownFiles(entryPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
    ) {
      return [entryPath];
    }
    return [];
  });

  const files = await Promise.all(filesPromises);
  return files.flat();
}

/**
 * Get the title from a markdown file
 * @param filePath Path to the markdown file
 * @returns The title or a fallback based on filename
 */
async function getMarkdownTitle(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    
    // Look for frontmatter title first
    const frontmatterMatch = content.match(/^---\s*\n[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?\n---/);
    if (frontmatterMatch) {
      return frontmatterMatch[1].trim();
    }
    
    // Look for first H1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    // Fallback to filename
    const basename = path.basename(filePath, path.extname(filePath));
    return basename === "README" ? "Overview" : basename.replace(/-/g, " ");
  } catch {
    // Fallback to filename
    const basename = path.basename(filePath, path.extname(filePath));
    return basename === "README" ? "Overview" : basename.replace(/-/g, " ");
  }
}

/**
 * Generate a single markdown file for a docs page
 * @param filePath Path to the original markdown file
 * @param outputDir Directory to write the output file
 * @param repoRoot Repository root path
 * @returns The output file name
 */
async function generateIndividualFile(
  filePath: string,
  outputDir: string,
  repoRoot: string,
  userDocsDir: string
): Promise<string> {
  const content = await fs.readFile(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath);
  
  // Generate output filename from path relative to user docs dir
  let outputName = path.relative(userDocsDir, filePath)
    .replace(/\//g, "-")
    .replace(/\.mdx?$/, ".md");
  
  // Special handling for README files
  if (outputName.endsWith("-README.md")) {
    outputName = outputName.replace("-README.md", "-overview.md");
  }
  
  // Create llms subdirectory
  const llmsDir = path.join(outputDir, "llms");
  await fs.mkdir(llmsDir, { recursive: true });
  
  const outputPath = path.join(llmsDir, outputName);
  
  // Add source comment at the top
  const fileContent = `<!-- Source: ${relativePath} -->\n\n${content}`;
  
  await fs.writeFile(outputPath, fileContent);
  
  return `llms/${outputName}`;
}

/**
 * Create a directory page following llms.txt format
 * @param title Page title
 * @param description Page description
 * @param sections Sections with files
 * @param outputPath Output file path
 */
async function createDirectoryPage(
  title: string,
  description: string,
  sections: Array<{ name: string; files: Array<{ name: string; filename: string; description?: string }> }>,
  outputPath: string
): Promise<void> {
  let content = `# ${title}\n\n> ${description}\n\n`;
  
  for (const section of sections) {
    content += `## ${section.name}\n\n`;
    for (const file of section.files) {
      content += `- [${file.name}](${file.filename})`;
      if (file.description) {
        content += `: ${file.description}`;
      }
      content += "\n";
    }
    content += "\n";
  }
  
  await fs.writeFile(outputPath, content.trim());
}

/**
 * Generate a full concatenated file
 * @param files Array of file paths
 * @param outputPath Output file path
 * @param repoRoot Repository root path
 * @param title Title for the file
 */
async function generateFullFile(
  files: string[],
  outputPath: string,
  repoRoot: string,
  title: string
): Promise<void> {
  let content = `# ${title}\n\nThis file is auto-generated from all relevant Markdown files in the Cursorless documentation.\n`;

  for (const filePath of files) {
    const relativePath = path.relative(repoRoot, filePath);
    content += `\n\n<!-- File: ${relativePath} -->\n\n`;
    
    const fileContent = await fs.readFile(filePath, "utf8");
    content += fileContent;
  }

  await fs.writeFile(outputPath, content.trim());
}

/**
 * Main function to generate all llms.txt files
 */
export async function generateLlmsTxt(): Promise<void> {
  // Get repo root from environment variable
  const repoRoot = process.env.CURSORLESS_REPO_ROOT;
  if (!repoRoot) {
    throw new Error("CURSORLESS_REPO_ROOT environment variable must be set");
  }

  const docsDir = path.resolve(repoRoot, "packages/cursorless-org-docs/src/docs");
  const outputDir = path.resolve(repoRoot, "packages/cursorless-org/out");

  console.log("Generating llms.txt files...");

  try {
    // Create the output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Find user docs only
    const userDocsDir = path.join(docsDir, "user");
    const userFiles = await findMarkdownFiles(userDocsDir);
    
    console.log(`Found ${userFiles.length} user docs`);

    // Generate individual files for user docs
    const userIndividualFiles: Array<{ name: string; filename: string; description?: string; isRootReadme?: boolean }> = [];
    
    // Process user files
    for (const filePath of userFiles) {
      const outputName = await generateIndividualFile(filePath, outputDir, repoRoot, userDocsDir);
      const title = await getMarkdownTitle(filePath);
      const relativePath = path.relative(repoRoot, filePath);
      
      // Check if this is the root README
      const isRootReadme = relativePath.endsWith("user/README.md");
      
      userIndividualFiles.push({
        name: title,
        filename: outputName,
        isRootReadme
      });
    }
    
    // Sort files by name
    userIndividualFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    // Separate root README from other files
    const rootReadme = userIndividualFiles.find(f => f.isRootReadme);
    const otherFiles = userIndividualFiles.filter(f => !f.isRootReadme);

    // 1. Generate main llms.txt (directory page)
    const sections = [];
    
    if (rootReadme) {
      sections.push({
        name: "Core Documentation",
        files: [{ name: rootReadme.name, filename: rootReadme.filename }]
      });
    }
    
    sections.push({
      name: "Optional",
      files: [
        ...otherFiles,
        { name: "Complete Documentation", filename: "llms-full.txt", description: "Full concatenated documentation" }
      ]
    });
    
    await createDirectoryPage(
      "Cursorless",
      "Cursorless is a spoken language for structural navigation and editing. Use voice commands to edit code faster than with a keyboard.",
      sections,
      path.join(outputDir, "llms.txt")
    );

    // 2. Generate llms-full.txt (complete user documentation)
    await generateFullFile(
      userFiles,
      path.join(outputDir, "llms-full.txt"),
      repoRoot,
      "Cursorless Documentation"
    );

    console.log("Successfully generated llms.txt files:");
    console.log("  - llms.txt (main directory page)");
    console.log("  - llms-full.txt (complete documentation)");
    console.log(`  - ${userIndividualFiles.length} individual documentation files`);
  } catch (error) {
    console.error("Error generating llms.txt files:", error);
    process.exit(1);
  }
}

// Run the main function directly
void generateLlmsTxt();
