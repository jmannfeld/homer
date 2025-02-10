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
  const helpText = "Display usage information for each command";

  program
    .name("homer")
    .description("CLI for managing tags and branches in Git repositories")
    .version(cliPackageJson.version, "-v, --version", "Display the CLI version")
    .helpOption("-h, --help", helpText)
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
    .helpOption("-h, --help", helpText)
    .action(tagCommand); // Default action if just 'homer tag' is run;
  tag
    .command("final")
    .description("Create a final tag in the current branch")
    .option("-y, --yes", "Skip confirmation prompts")
    .action((options) => finalTagCommand(options.yes));

  // Define 'fork' command with subcommands
  const fork = new Command("fork")
    .description("Fork a release branch from the current branch")
    .helpCommand(false) // Hide default help command
    .helpOption("-h, --help", helpText)
    .action((options) => {
      if (!options.help) {
        program.outputHelp();
        console.log("\nError: 'major' or 'minor' command is required to fork");
      }
    });
  fork
    .command("minor")
    .description("Create a new minor release")
    .option("-y, --yes", "Skip confirmation prompts")
    .action((options) => forkCommand("minor", options.yes));
  fork
    .command("major")
    .description("Create a new major release")
    .option("-y, --yes", "Skip confirmation prompts")
    .action((options) => forkCommand("major", options.yes));

  program.addCommand(fork);
  program.addCommand(tag);

  // Parse user input
  program.parse(process.argv);
}

main();
