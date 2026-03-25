import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceEntries = ["app", "components", "lib", "middleware.js"];
const requiredDocs = [
  "README.md",
  "docs/linting.md",
  "docs/generate_docs.md",
  "docs/architecture.md",
  "docs/business-logic.md",
  "docs/component-interactions.md",
  "docs/test-driven-documentation.md",
];

const exportPattern =
  /^\s*export\s+(default\s+)?(async\s+)?function\s+\w+|^\s*export\s+const\s+\w+|^\s*export\s+\{\s*handlers,\s*auth,\s*signIn,\s*signOut\s*\}|^\s*export\s+const\s+\{\s*GET,\s*POST\s*\}/gm;

async function collectJsFiles(entryPath) {
  const absolutePath = path.join(root, entryPath);
  const fileStat = await stat(absolutePath);

  if (fileStat.isFile()) {
    return absolutePath.endsWith(".js") ? [absolutePath] : [];
  }

  const items = await readdir(absolutePath, { withFileTypes: true });
  const files = await Promise.all(
    items.map(async (item) => {
      const nextPath = path.join(entryPath, item.name);

      if (item.isDirectory()) {
        return collectJsFiles(nextPath);
      }

      return nextPath.endsWith(".js") ? [path.join(root, nextPath)] : [];
    })
  );

  return files.flat();
}

function hasLeadingJsdoc(content, exportIndex) {
  const beforeExport = content.slice(0, exportIndex).replace(/\s*$/, "");

  if (!beforeExport.endsWith("*/")) {
    return false;
  }

  const lastJsdocStart = beforeExport.lastIndexOf("/**");
  const lastBlockCommentStart = beforeExport.lastIndexOf("/*");

  return lastJsdocStart !== -1 && lastJsdocStart >= lastBlockCommentStart;
}

async function checkExports() {
  const sourceFiles = (await Promise.all(sourceEntries.map(collectJsFiles))).flat();
  const undocumentedExports = [];
  let documentedExports = 0;

  for (const filePath of sourceFiles) {
    const content = await readFile(filePath, "utf8");
    const matches = content.matchAll(exportPattern);

    for (const match of matches) {
      if (hasLeadingJsdoc(content, match.index)) {
        documentedExports += 1;
        continue;
      }

      undocumentedExports.push(path.relative(root, filePath));
    }
  }

  return {
    documentedExports,
    undocumentedExports,
  };
}

async function checkDocsFiles() {
  const missingDocs = [];
  const invalidDocs = [];

  for (const docPath of requiredDocs) {
    const absolutePath = path.join(root, docPath);

    try {
      const content = await readFile(absolutePath, "utf8");
      const trimmed = content.trim();

      if (!trimmed.startsWith("#")) {
        invalidDocs.push(`${docPath} must start with a markdown heading`);
      }
    } catch {
      missingDocs.push(docPath);
    }
  }

  return {
    invalidDocs,
    missingDocs,
  };
}

async function checkDocumentationTests() {
  const testsPath = path.join(root, "tests/documentation");

  try {
    const items = await readdir(testsPath);
    const testFiles = items.filter((item) => item.endsWith(".test.js"));

    return {
      testFiles,
    };
  } catch {
    return {
      testFiles: [],
    };
  }
}

async function main() {
  const [{ documentedExports, undocumentedExports }, { invalidDocs, missingDocs }, { testFiles }] =
    await Promise.all([checkExports(), checkDocsFiles(), checkDocumentationTests()]);

  const uniqueUndocumentedExports = [...new Set(undocumentedExports)];
  const failures = [];

  if (missingDocs.length) {
    failures.push(`Missing documentation files:\n- ${missingDocs.join("\n- ")}`);
  }

  if (invalidDocs.length) {
    failures.push(`Invalid documentation files:\n- ${invalidDocs.join("\n- ")}`);
  }

  if (uniqueUndocumentedExports.length) {
    failures.push(
      `Public exports without leading JSDoc:\n- ${uniqueUndocumentedExports.join("\n- ")}`
    );
  }

  if (!testFiles.length) {
    failures.push("No executable documentation tests were found in tests/documentation.");
  }

  if (failures.length) {
    console.error("Documentation quality check failed.\n");
    console.error(failures.join("\n\n"));
    process.exit(1);
  }

  console.log("Documentation quality check passed.");
  console.log(`Documented public exports: ${documentedExports}`);
  console.log(`Documentation test files: ${testFiles.length}`);
}

main();
