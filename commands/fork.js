import chalk from "chalk";
import { execSync } from "child_process";
import simpleGit from "simple-git";
import {
  createReleaseBranchAndTag,
  getPackageVersion,
  pushVersionCommitAndTag,
  pullAndFetch,
  updateMainBranchVersion,
} from "../lib/utils.js";

/**
 * Handles the process of forking a new release branch from the main branch.
 *
 * - Ensures the current branch is `main`.
 * - Pulls the latest changes from the remote repository.
 * - Retrieves the current package version.
 * - Creates a new release branch and tag based on the fork type (major or minor).
 * - Increments the main branch version accordingly.
 * - Pushes all changes and tags to the remote repository.
 *
 * @async
 * @param {string} typeOfFork - The type of fork to create (`major` or `minor`).
 * @param {string} skipPrompt - The type of tag to create (e.g.,
 */
export default async function forkCommand(typeOfFork, skipPrompt = false) {
  const git = simpleGit();

  try {
    const branchSummary = await git.branch();
    console.log(`📌 Current branch: ${branchSummary.current}\n`);

    if (branchSummary.current !== "main") {
      console.error("❌ Error: Not on the 'main' branch.");
      console.error(
        "🔹 Tip: The fork command should be run from the 'main' branch."
      );
      process.exit(1);
    }

    // Pull latest changes from remote
    pullAndFetch(branchSummary.current);

    const currentVersion = await getPackageVersion();

    await createReleaseBranchAndTag(currentVersion, typeOfFork, skipPrompt);

    console.log(chalk.gray("────────────────────────────────────\n"));

    console.log("🔼 Incrementing main branch...");
    execSync(`git checkout ${branchSummary.current}`, { stdio: "ignore" });

    updateMainBranchVersion(typeOfFork, currentVersion);

    pushVersionCommitAndTag(branchSummary.current);

    console.log(
      `✅ ${
        typeOfFork.charAt(0).toUpperCase() + typeOfFork.slice(1)
      } fork completed successfully!`
    );
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}
