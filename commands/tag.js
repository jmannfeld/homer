import { execSync } from "child_process";
import simpleGit from "simple-git";
import { pullAndFetch, pushVersionCommitAndTag } from "../lib/utils.js";

export default async function tagCommand(options) {
  const git = simpleGit();

  try {
    // get the current branch
    const branchSummary = await git.branch();
    console.log(branchSummary);
    if (branchSummary.current) {
      console.log("Current branch:", branchSummary.current);
    } else {
      console.error("❌ Error: Unable to determine the current branch.");
      console.error(
        "🔹 Tip: Make sure a commit has been made in the Git repository."
      );
      process.exit(1);
    }
    // get the latest tag from the current branch
    const tags = await git.tags();
    console.log(tags);

    // Run `npm version prerelease` in the current branch
    pullAndFetch(branchSummary.current);
    if (branchSummary.current === "main") {
      console.log("Running `npm version prerelease`...");
      execSync("npm version prerelease --preid=dev", {
        stdio: "inherit",
      });
      pushVersionCommitAndTag(branchSummary.current);
    } else if (branchSummary.current.includes("release/")) {
      console.log("Running `npm version prerelease`...");
      execSync("npm version prerelease --preid=rc", {
        stdio: "inherit",
      });
      pushVersionCommitAndTag(branchSummary.current);
    } else {
      console.log("need to handle feature branches");
    }
    console.log("Version updated successfully.");
  } catch (error) {
    console.error("❌ Error: Unable to determine the current branch.");
    console.error("🔹 Tip: Make sure you are inside a Git repository.");
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
}
