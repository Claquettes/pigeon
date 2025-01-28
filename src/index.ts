#!/usr/bin/env node

import { Command } from "commander";
import { scanNestProject } from "./scanner";
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";

const program = new Command();

program
    .version("1.1.0")
    .description("Pigeon - NestJS Route Mapper CLI")
    .argument("<projectPath>", "Path to the NestJS project")
    .action(async (projectPath) => {
        const fullPath = path.resolve(projectPath);
        if (!fs.existsSync(fullPath)) {
            console.error(chalk.red(`Error: The provided path does not exist: ${fullPath}`));
            process.exit(1);
        }

        console.log(chalk.blue(`🪹 Scanning NestJS project at: ${fullPath} 🐦`));

        // Ask user for the output format or to quit
        const { format } = await inquirer.prompt([
            {
                type: "list",
                name: "format",
                message: "Choose the export format:",
                choices: ["Insomnia", "Postman", new inquirer.Separator(), "Quit Pigeon"],
            },
        ]);

        // Handle "Quit Pigeon" option
        if (format === "Quit Pigeon") {
            console.log(chalk.yellow("\n👋 Pigeon is taking off. Goodbye! 🕊️\n"));
            process.exit(0);
        }

        // Scan the project and generate the correct format
        const routes = scanNestProject(fullPath, format);
        const fileName = format === "Insomnia" ? "insomnia.json" : "postman.json";
        const outputPath = path.join(fullPath, fileName);

        fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2));
        console.log(chalk.green(`\n📁 ${format} import file generated at: ${outputPath}`));
    });

program.parse(process.argv);
