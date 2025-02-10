import inquirer from "inquirer";
import simpleGit from "simple-git";
import semver from "semver";
import { execSync } from "child_process";
import {
  getPackageVersion,
  pushVersionCommitAndTag,
  pullAndFetch,
} from "../lib/utils.js";

/**
 * Creates a final tag in a release branch.
 *
 * - Ensures the command is run on a `release/X.X` branch.
 * - Pulls the latest changes before tagging.
 * - Determines the next stable version (e.g., converting an RC tag to a final release).
 * - Runs `npm version` to apply the version bump.
 * - Pushes the new version commit and tag to remote.
 *
 * @async
 * @throws {Error} If the command is run outside a release branch or if tagging fails.
 */
export default async function finalTagCommand() {
  const git = simpleGit();

  try {
    // Get current branch name
    const branchSummary = await git.branch();
    const currentBranch = branchSummary.current;

    if (!currentBranch.startsWith("release/")) {
      console.error(
        "❌ Error: 'homer tag final' can only be run on a 'release/X.X' branch."
      );
      process.exit(1);
    }

    console.log(`📌 Current branch: ${currentBranch}\n`);

    const latestTag = await getPackageVersion();

    // Ensure we have the latest changes before tagging
    pullAndFetch(currentBranch);

    // Determine next version bump (major, minor, patch)
    const nextVersion = semver.inc(latestTag, getNextReleaseType(latestTag));

    const prompt = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Create final tag: ${nextVersion}?`,
      },
    ]);

    if (prompt.confirm) {
      // Run npm version command
      const newTag = execSync(`npm version ${nextVersion}`, { stdio: "pipe" })
        .toString()
        .trim();
      console.log(`\n🏷️ New tag created: \x1b[1m${newTag}\x1b[0m\n`);

      // Push version commit and tag
      pushVersionCommitAndTag(currentBranch);

      console.log("✅ Final version updated successfully!");
    } else {
      console.log("\n🚧 Tag creation aborted.");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error: Unable to tag final version.");
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Determines the next release type based on the current version.
 *
 * - If the current version is a pre-release, it returns "patch" to finalize it as a stable release.
 * - If the version is not a pre-release, an error is logged, and the process exits.
 *
 * @param {string} currentVersion - The current semantic version.
 * @returns {string} The next release type ("patch") if a pre-release is detected.
 */
function getNextReleaseType(currentVersion) {
  if (semver.prerelease(currentVersion)) {
    return "patch"; // Convert pre-release (e.g., 1.2.0-rc.0) to stable (1.2.0)
  } else {
    console.error("❌ Error: Cannot determine next release type.");
    console.error("🔹 Tip: Ensure an RC tag has been created in this branch.");
    process.exit(1);
  }
}
