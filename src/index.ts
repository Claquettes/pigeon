#!/usr/bin/env node

import { Command } from "commander";
import { scanNestProject } from "./scanner";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";

const program = new Command();

program
    .version("1.0.0")
    .description("Pigeon - NestJS Route Mapper CLI")
    .argument("<projectPath>", "Path to the NestJS project")
    .action((projectPath) => {
        const fullPath = path.resolve(projectPath);
        if (!fs.existsSync(fullPath)) {
            console.error(chalk.red(`Error: The provided path does not exist: ${fullPath}`));
            process.exit(1);
        }

        console.log(chalk.blue(`🪹 Scanning NestJS project at: ${fullPath} 🐦`));

        const routes = scanNestProject(fullPath);
        const outputPath = path.join(fullPath, "insomnia.json");

        fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2));
        console.log(chalk.green(`\nInsomnia import file generated at: ${outputPath}`));
    });

program.parse(process.argv);
