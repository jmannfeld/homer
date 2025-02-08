import { execSync } from "child_process";
import { readFile } from "fs/promises";
import semver from "semver";
import { findUp } from "find-up";

export function createTag(tag) {
  console.log(`Creating new tag: ${tag}`);
  try {
    execSync(`npm version ${tag}`, { stdio: "inherit" });
    return;
  } catch (error) {
    console.error(`❌ ${error}`);
    process.exit(1);
  }
}

export function createBranch(branchName) {
  console.log(`Creating new branch: ${branchName}`);
  try {
    execSync(`git checkout -b ${branchName}`, {
      stdio: "inherit",
    });
    return;
  } catch (error) {
    console.error(`❌ ${error}`);
    process.exit(1);
  }
}

export function createReleaseBranchAndTag(currentVersion, typeOfFork) {
  // Determine the next minor version
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
  createBranch(releaseBranch);

  // Create the next rc tag
  const rcTag = `${shortVersion}.0-rc.0`;
  createTag(rcTag);
  // this will take you to 1.1.0-beta.0
  // npm version preminor --preid=rc

  // Push the new branch and tag
  console.log("Pushing changes to the remote repository...");
  execSync(`git push origin ${releaseBranch} && git push --tags`, {
    stdio: "inherit",
  });

  return releaseBranch, rcTag;
}

export function pullAndFetch(branch) {
  console.log(
    "Pulling and fetching the latest changes from the remote repository..."
  );
  execSync(`git pull origin ${branch} && git fetch`, {
    stdio: "inherit",
  });
}

export function pushVersionCommitAndTag(branch) {
  // Push the commit and tag
  console.log("Pushing changes to the remote repository...");
  execSync(`git push origin ${branch} && git push --tags`, {
    stdio: "inherit",
  });
}

export function getNextReleaseBranchName(currentVersion) {
  const shortVersion = getShortVersion(nextMinorVersion);
  const branchName = `release/${shortVersion}`;
  return branchName;
}

export async function getPackageVersion() {
  const packagePath = await findUp("package.json");
  if (!packagePath) {
    console.error("package.json not found");
    return "unknown";
  }

  const packageJson = JSON.parse(await readFile(packagePath, "utf-8"));
  return packageJson.version;
}

export function getShortVersion(version) {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
}

export function getNextMinorVersion(currentVersion) {
  const nextMinorVersion = semver.inc(currentVersion, "prerelease", "rc");
  if (!nextMinorVersion) {
    throw new Error("Failed to determine the next minor version.");
  }
  console.log("Next minor version:", nextMinorVersion);
  return nextMinorVersion;
}

export function getNextMajorVersion(currentVersion) {
  const nextMajorVersion = semver.inc(currentVersion, "premajor", "rc");
  if (!nextMajorVersion) {
    throw new Error("Failed to determine the next major version.");
  }
  console.log("Next major version:", nextMajorVersion);
  return nextMajorVersion;
}
