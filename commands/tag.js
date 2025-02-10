import { execSync } from "child_process";
import simpleGit from "simple-git";
import {
  getPackageVersion,
  pullAndFetch,
  pushVersionCommitAndTag,
} from "../lib/utils.js";

/**
 * Handles the tagging process for a given branch.
 *
 * - Determines the current branch.
 * - Ensures the latest changes are pulled before tagging.
 * - Computes the appropriate `preid` based on the branch type.
 * - Creates a new pre-release tag using `npm version prerelease`.
 * - Pushes the new version commit and tag to the remote repository.
 * @async
 */
export default async function tagCommand() {
  const git = simpleGit();

  try {
    const branchSummary = await git.branch();
    const currentBranch = branchSummary.current;

    if (!currentBranch) {
      throw new Error(
        "Unable to determine the current branch. Make sure you have at least one commit."
      );
    }

    console.log(`📌 Current branch: ${currentBranch}\n`);

    // Ensure we have the latest changes before tagging
    pullAndFetch(currentBranch);

    const currentVersion = await getPackageVersion();

    // Determine the preid based on the branch type
    let preid = getPreidForBranch(currentBranch);
    if (!preid) {
      console.log("🚧 Skipping version bump: Unhandled branch type.");
      return;
    }

    const newTag = execSync(`npm version prerelease --preid='${preid}'`, {
      stdio: "pipe",
    })
      .toString()
      .trim();
    console.log(`🏷️ New tag created: \x1b[1m${newTag}\x1b[0m\n`);

    // Push new version commit and tag
    pushVersionCommitAndTag(currentBranch);

    console.log("✅ Version updated successfully!");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Determines the appropriate pre-release identifier (`preid`) based on the branch name.
 *
 * - `main` branch uses `"dev"`.
 * - `release/X.X` branches use `"rc"`.
 * - All other branches use their name as the `preid`, replacing `/` with `-` for compatibility.
 *
 * @param {string} branch - The current Git branch name.
 * @returns {string} The formatted pre-release identifier (`preid`).
 */
function getPreidForBranch(branch) {
  if (branch === "main") return "dev";
  if (branch.startsWith("release/")) return "rc";

  // Default to the branch name for all other branches
  // Replace invalid characters (e.g., `/` → `-`)
  return branch.replace(/\//g, "-");
}
