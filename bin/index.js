#!/usr/bin/env node

import { program, Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { readFile } from "fs/promises";

import forkCommand from "../commands/fork.js";
import tagCommand from "../commands/tag.js";
import finalTagCommand from "../commands/tagFinal.js";

// Load CLI package.json for versioning
async function loadCliPackageJson() {
  try {
    const packageData = await readFile(
      new URL("../package.json", import.meta.url),
      "utf-8"
    );
    return JSON.parse(packageData);
  } catch (error) {
    console.error(
      "❌ Error: Unable to read package.json. Falling back to default version."
    );
    return { version: "0.0.0" };
  }
}

// Initialize CLI
async function main() {
  const cliPackageJson = await loadCliPackageJson();

  program
    .name("homer")
    .version(cliPackageJson.version, "-v, --version", "Display the CLI version")
    .description("CLI for managing tags and branches in Git repositories")
    .action(() => {
      console.log(
        chalk.greenBright(
          figlet.textSync("Homer CLI", { horizontalLayout: "full" })
        )
      );
      program.help();
    });

  // Define 'tag' command with a subcommand
  const tag = new Command("tag")
    .description("Create a tag in the current branch")
    .action(tagCommand); // Default action if just 'homer tag' is run;
  tag
    .command("final")
    .description("Create a final tag in the current branch")
    .action(finalTagCommand);

  // Define 'fork' command with subcommands
  const fork = new Command("fork").description(
    "Fork a release branch from the current branch"
  );
  fork
    .command("minor")
    .description("Create a new minor release")
    .action(() => forkCommand("minor"));
  fork
    .command("major")
    .description("Create a new major release")
    .action(() => forkCommand("major"));

  program.addCommand(fork);
  program.addCommand(tag);

  // Parse user input
  program.parse(process.argv);
}

main();
