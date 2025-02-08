import simpleGit from "simple-git";

export default async function tagCommand(options) {
  const git = simpleGit();

  try {
    const branchSummary = await git.branch();
    console.log("branchSummary", branchSummary);
    console.log("Current branch:", branchSummary.current);
  } catch (error) {
    console.error("❌ Error: Unable to determine the current branch.");
    console.error("🔹 Tip: Make sure you are inside a Git repository.");
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
}
