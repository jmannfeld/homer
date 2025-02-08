import simpleGit from "simple-git";

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
    }
    // get the latest tag from the current branch
    const tags = await git.tags();
    console.log(tags);
  } catch (error) {
    console.error("❌ Error: Unable to determine the current branch.");
    console.error("🔹 Tip: Make sure you are inside a Git repository.");
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
}
