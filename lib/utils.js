import semver from "semver";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { readFile } from "fs/promises";
import { findUp } from "find-up";

/**
 * Creates a new Git tag using npm versioning.
 *
 * - Runs `npm version <tag>` to create a new version tag.
 * - Captures and logs the created tag.
 * - Suppresses command output unless an error occurs.
 *
 * @param {string} tag - The version tag to create.
 */
export function createTag(tag) {
  try {
    const newTag = execSync(`npm version ${tag}`, { stdio: "pipe" })
      .toString()
      .trim();
    console.log(`\n🏷️ New tag created: \x1b[1m${newTag}\x1b[0m\n`);
    return;
  } catch (error) {
    console.error(`❌ ${error}`);
    process.exit(1);
  }
}

/**
 * Creates a new Git branch and switches to it.
 *
 * - Runs `git checkout -b <branchName>` to create and switch to the new branch.
 * - Suppresses command output unless an error occurs.
 * - Logs the newly created branch name.
 *
 * @param {string} branchName - The name of the branch to create.
 */
export function createBranch(branchName) {
  try {
    execSync(`git checkout -b ${branchName}`, {
      stdio: "ignore",
    });
    console.log(`\n🔀 New branch created: \x1b[1m${branchName}\x1b[0m`);
    return;
  } catch (error) {
    console.error(`❌ ${error}`);
    process.exit(1);
  }
}

/**
 * Creates a new release branch and an associated release candidate (RC) tag.
 *
 * - Determines the next version based on the type of fork (major or minor).
 * - Extracts the short version (major.minor) to use in branch and tag names.
 * - Creates a new release branch (`release/X.Y`).
 * - Creates a corresponding RC tag (`X.Y.0-rc.0`).
 * - Pushes the new branch and tag to the remote repository.
 *
 * @param {string} currentVersion - The current version of the project.
 * @param {string} typeOfFork - The type of fork (`"major"` or `"minor"`).
 * @param {string} skipPrompt - Overriding the yes prompt.
 */
export async function createReleaseBranchAndTag(
  currentVersion,
  typeOfFork,
  skipPrompt = false
) {
  let nextVersion;
  if (typeOfFork === "major") {
    nextVersion = getNextMajorVersion(currentVersion);
  } else {
    nextVersion = getNextMinorVersion(currentVersion);
  }

  // Extract only the major and minor parts (e.g., "1.1" from "1.1.0")
  const shortVersion = getShortVersion(nextVersion);

  // Create the new release branch
  const releaseBranch = `release/${shortVersion}`;

  // If --yes is provided, bypass prompt and create the branch immediately
  if (skipPrompt) {
    console.log(`🏗️ Creating branch: \x1b[1m${releaseBranch}\x1b[0m`);
    executeBranchCreation(releaseBranch, shortVersion);
    return;
  }

  // Otherwise, prompt the user for confirmation
  const prompt = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Create branch: ${releaseBranch}?`,
    },
  ]);

  if (prompt.confirm) {
    executeBranchCreation(releaseBranch, shortVersion);
  } else {
    console.log("\n🚧 Branch creation aborted.");
    process.exit(0);
  }
}

// Helper function to execute branch creation
function executeBranchCreation(releaseBranch, shortVersion) {
  createBranch(releaseBranch);

  // Create the next rc tag
  const rcTag = `${shortVersion}.0-rc.0`;
  createTag(rcTag);

  // Push the new branch and tag
  pushVersionCommitAndTag(releaseBranch);
}

/**
 * Pulls the latest changes from the remote repository and fetches updates.
 *
 * - Runs `git pull origin <branch>` to sync the local branch with the remote.
 * - Runs `git fetch` to update remote-tracking branches.
 * - Suppresses command output to keep logs clean.
 * - Exits the process if the pull or fetch operation fails.
 *
 * @param {string} branch - The name of the branch to pull from remote.
 *
 * @throws {Error} If the `git pull` or `git fetch` command fails.
 */
export function pullAndFetch(branch) {
  console.log("📥 Pulling latest from remote...\n");
  try {
    execSync(`git pull origin ${branch} && git fetch`, {
      stdio: "ignore",
    });
    return;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error("🔹 Tip: Make sure the branch has been pushed to remote.");
    process.exit(1);
  }
}

/**
 * Pushes the latest commit and tags to the remote repository.
 *
 * - Pushes the specified branch to the remote (`origin`).
 * - Pushes all tags to the remote.
 * - Suppresses command output to keep logs clean.
 *
 * @param {string} branch - The branch name to push.
 *
 * @throws {Error} If the `git push` command fails.
 */
export function pushVersionCommitAndTag(branch) {
  console.log("🚀 Pushing tag to remote...\n");
  execSync(`git push origin ${branch} && git push --tags`, {
    stdio: "ignore",
  });
}

/**
 * Retrieves the version from the nearest `package.json` file.
 *
 * - Searches for `package.json` in the current or parent directories.
 * - Reads and parses the `package.json` file to extract the version.
 * - Returns `"unknown"` if `package.json` is not found.
 *
 * @returns {Promise<string>} The package version (e.g., `"1.2.3"`) or `"unknown"` if not found.
 *
 * @throws {Error} If an error occurs while reading or parsing `package.json`.
 */
export async function getPackageVersion() {
  const packagePath = await findUp("package.json");
  if (!packagePath) {
    console.error("package.json not found");
    return "unknown";
  }

  const packageJson = JSON.parse(await readFile(packagePath, "utf-8"));
  return packageJson.version;
}

/**
 * Extracts the major and minor version from a full semantic version string.
 *
 * - Example: `"1.2.3"` → `"1.2"`
 * - Example: `"4.5.0-rc.1"` → `"4.5"`
 *
 * @param {string} version - The full semantic version string (e.g., `"1.2.3"` or `"4.5.0-rc.1"`).
 * @returns {string} The shortened version string containing only the major and minor parts (e.g., `"1.2"`).
 * @throws {Error} If the input is not a valid semantic version or is missing required parts.
 */
export function getShortVersion(version) {
  if (typeof version !== "string" || !version.match(/^\d+\.\d+(\.\d+.*)?$/)) {
    throw new Error("Invalid version format. Expected 'X.Y.Z' or 'X.Y'");
  }

  const parts = version.split(".");
  if (parts.length < 2) {
    throw new Error("Version must include at least major and minor numbers");
  }

  const [major, minor] = parts;
  return `${major}.${minor}`;
}

/**
 * Calculates the next major pre-release version.
 *
 * - Increments the **major** version and sets the pre-release identifier to `"rc"`.
 * - Example: `"1.2.3"` → `"2.0.0-rc.0"`.
 *
 * @param {string} currentVersion - The current semantic version (e.g., `"1.2.3"`).
 * @returns {string} The next major pre-release version (e.g., `"2.0.0-rc.0"`).
 *
 * @throws {Error} If the version increment fails.
 */
export function getNextMajorVersion(currentVersion) {
  const nextMajorVersion = semver.inc(currentVersion, "premajor", "rc");
  if (!nextMajorVersion) {
    throw new Error("Failed to determine the next major version.");
  }
  return nextMajorVersion;
}

/**
 * Calculates the next minor pre-release version.
 *
 * - Increments the **prerelease** version while keeping the same minor version.
 * - Sets the pre-release identifier to `"rc"`.
 * - Example: `"1.2.0-rc.0"` → `"1.2.0-rc.1"`.
 *
 * @param {string} currentVersion - The current semantic version (e.g., `"1.2.0-rc.0"`).
 * @returns {string} The next minor pre-release version (e.g., `"1.2.0-rc.1"`).
 *
 * @throws {Error} If the version increment fails.
 */
export function getNextMinorVersion(currentVersion) {
  const nextMinorVersion = semver.inc(currentVersion, "prerelease", "rc");
  // If the version is a final release (no prerelease identifier), throw an error
  if (!nextMinorVersion || !semver.prerelease(currentVersion)) {
    throw new Error("Failed to determine the next minor version.");
  }
  return nextMinorVersion;
}

/**
 * Updates the main branch version based on the type of fork (major or minor).
 *
 * - For a **major** fork:
 *   - Increments the **premajor** version (e.g., `1.2.3-dev.0` → `2.0.0-dev.0`).
 *   - Then increments the **preminor** version (e.g., `2.0.0-dev.0` → `2.1.0-dev.0`).
 *
 * - For a **minor** fork:
 *   - Runs `npm version preminor --preid=dev` to increment the **preminor** version.
 *
 * @param {string} typeOfFork - The type of version increment (`"major"` or `"minor"`).
 * @param {string} currentVersion - The current version string (e.g., `"1.2.3-dev.0"`).
 * @returns {void}
 *
 * @throws {Error} If the `npm version` command fails.
 */
export function updateMainBranchVersion(typeOfFork, currentVersion) {
  let nextVersion;
  if (typeOfFork === "major") {
    const nextPreMajor = semver.inc(currentVersion, "premajor", "dev");
    nextVersion = semver.inc(nextPreMajor, "preminor", "dev");
  } else {
    nextVersion = "preminor --preid=dev";
  }

  const newTag = execSync(`npm version ${nextVersion}`, { stdio: "pipe" })
    .toString()
    .trim();

  console.log(`\n🏷️ New tag created: \x1b[1m${newTag}\x1b[0m\n`);
}
