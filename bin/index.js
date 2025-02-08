#!/usr/bin/env node

import { program, Command } from "commander";
import chalk from "chalk";
``;
import figlet from "figlet";

import { readFile } from "fs/promises";

import forkCommand from "../commands/fork.js";
import tagCommand from "../commands/tag.js";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf-8")
);

program
  .name("homer")
  .version(packageJson.version, "-v, --version")
  .description("CLI for managing tags in git repositories")
  .action(() => {
    console.log(
      chalk.greenBright(
        figlet.textSync("Homer CLI", { horizontalLayout: "full" })
      )
    );
  });

program
  .command("tag")
  .description("Create a new tag in the current branch")
  .action(tagCommand);

const fork = new Command("fork").description(
  "Create a new release branch from the current branch"
);

program.addCommand(fork);

fork
  .command("minor")
  .description("Create a new minor release")
  .action(() => {
    forkCommand("minor");
  });
fork
  .command("major")
  .description("Create a new major release")
  .action(() => {
    forkCommand("major");
  });

program.parse(process.argv);
