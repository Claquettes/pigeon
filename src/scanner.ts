import { Project, SyntaxKind, ParameterDeclaration } from "ts-morph";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";

/**
 * Recursively retrieves all TypeScript files from a given directory.
 * @param dir The directory to scan.
 * @returns List of .ts file paths.
 */
function getAllTsFiles(dir: string): string[] {
    let results: string[] = [];
    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                results = results.concat(getAllTsFiles(fullPath));
            } else if (file.endsWith(".ts")) {
                results.push(fullPath);
            }
        }
    } catch (error) {
        console.log(chalk.red(`❌ Error reading directory: ${dir}\n${error}`));
    }
    return results;
}

/**
 * Scans a NestJS project to extract routes and generate Insomnia or Postman-compatible JSON.
 * @param projectPath Path to the NestJS project root
 * @param format The export format (Insomnia or Postman)
 */
export function scanNestProject(projectPath: string, format: string) {
    const projectFolderName = path.basename(projectPath);
    const controllersDir = path.join(projectPath, "src");
    const project = new Project();
    const routesByController: Record<string, any[]> = {};

    console.log(chalk.yellow(`📂 Recursively searching for TypeScript files in: ${controllersDir}`));

    const tsFiles = getAllTsFiles(controllersDir);
    if (tsFiles.length === 0) {
        console.log(chalk.red("⚠️ No TypeScript files found in the src directory!"));
        return;
    }

    for (const filePath of tsFiles) {
        try {
            const sourceFile = project.addSourceFileAtPath(filePath);
            const controllerClasses = sourceFile.getClasses().filter(cls => cls.getDecorator("Controller"));

            for (const cls of controllerClasses) {
                try {
                    const controllerDecorator = cls.getDecorator("Controller");
                    if (!controllerDecorator) {
                        continue;
                    }

                    let basePath = "";
                    const arg = controllerDecorator.getArguments()[0];
                    if (arg && arg.getKind() === SyntaxKind.StringLiteral) {
                        basePath = arg.getText().replace(/['"]/g, "");
                    }

                    const controllerName = cls.getName() || "UnknownController";
                    if (!routesByController[controllerName]) {
                        routesByController[controllerName] = [];
                    }

                    cls.getMethods().forEach(method => {
                        try {
                            const routeDecorators = method.getDecorators().filter(decorator =>
                                ["Get", "Post", "Put", "Delete", "Patch"].includes(decorator.getName())
                            );

                            for (const decorator of routeDecorators) {
                                const httpMethod = decorator.getName().toUpperCase();
                                let routePath = "";

                                const args = decorator.getArguments();
                                if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
                                    routePath = args[0].getText().replace(/['"]/g, "");
                                }

                                const fullPath = `/${basePath}/${routePath}`.replace(/\/+/g, "/");
                                const parameters = method.getParameters().map((param: ParameterDeclaration) => ({
                                    name: param.getName(),
                                    type: param.getType().getText()
                                }));

                                routesByController[controllerName].push({
                                    method: httpMethod,
                                    url: fullPath,
                                    parameters
                                });
                            }
                        } catch (error) {
                            console.log(chalk.red(`❌ Error processing method ${method.getName()} in ${filePath}:\n${error}`));
                        }
                    });
                } catch (error) {
                    console.log(chalk.red(`❌ Error processing controller in ${filePath}:\n${error}`));
                }
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error processing file: ${filePath}\n${error}`));
        }
    }

    console.log(chalk.green("\n🎉 Scan Completed! Routes Found:"));
    Object.entries(routesByController).forEach(([controller, routes]) => {
        console.log(chalk.blue(`📁 Controller: ${controller}`));
        routes.forEach(route => {
            console.log(`➡️  ${route.method} ${route.url}`);
        });
    });

    if (format === "Postman") {
        return {
            info: {
                name: projectFolderName,
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: Object.entries(routesByController).map(([controllerName, routes]) => ({
                name: controllerName,
                item: routes.map(route => ({
                    name: route.url,
                    request: {
                        method: route.method,
                        url: {
                            raw: `{{base_url}}${route.url}`,
                            host: ["{{base_url}}"],
                            path: route.url.split("/").filter(Boolean)
                        }
                    }
                }))
            }))
        };
    } else {
        const workspaceId = `wrk_${Math.random().toString(36).substring(7)}`;
        return {
            _type: "export",
            __export_source: "Created by Pigeon",
            __export_format: 4,
            __export_date: new Date().toISOString(),
            resources: [
                { _id: workspaceId, _type: "workspace", name: projectFolderName },
                ...Object.entries(routesByController).flatMap(([controllerName, routes]) => ({
                    _id: `fld_${Math.random().toString(36).substring(7)}`,
                    _type: "request_group",
                    parentId: workspaceId,
                    name: controllerName
                })),
            ]
        };
    }
}
