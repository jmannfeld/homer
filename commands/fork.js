import { execSync } from "child_process";
import simpleGit from "simple-git";
import semver from "semver";
import {
  createReleaseBranchAndTag,
  getPackageVersion,
  pushVersionCommitAndTag,
  pullAndFetch,
} from "../lib/utils.js";

export default function forkCommand(typeOfFork) {
  const git = simpleGit();

  git.branch((err, branchSummary) => {
    if (err) {
      console.error("❌ Error: Unable to determine the current branch.");
      console.error("🔹 Tip: Make sure you are inside a Git repository.");
      process.exit(1); // Exit with a non-zero code to indicate failure
    }

    if (branchSummary.current === "main") {
      // Pull the latest changes from the remote repository
      pullAndFetch(branchSummary.current);

      // Get current version
      // const currentVersion = getCurrentVersion();
      getPackageVersion().then((currentVersion) => {
        console.log("Version:", currentVersion);

        const [rcBranch, rcTag] = createReleaseBranchAndTag(
          currentVersion,
          typeOfFork
        );

        // Increment the main branch version after creating release branch
        execSync(`git checkout ${branchSummary.current}`, {
          stdio: "inherit",
        });

        console.log("Running `npm version preminor/major`...");
        if (typeOfFork === "major") {
          const nextPreMajorMain = semver.inc(
            currentVersion,
            "premajor",
            "dev"
          );
          const nextPreMinorMain = semver.inc(
            nextPreMajorMain,
            "preminor",
            "dev"
          );
          execSync(`npm version ${nextPreMinorMain}`, {
            stdio: "inherit",
          });
        } else {
          execSync("npm version preminor --preid=dev", {
            stdio: "inherit",
          });
        }
        pushVersionCommitAndTag(branchSummary.current);
      });
    } else {
      console.error("❌ Error: Not on the 'main' branch.");
      console.error(
        "🔹 Tip: The fork command should be run from the 'main' branch."
      );
      process.exit(1);
    }
  });
}
