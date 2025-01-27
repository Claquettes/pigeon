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
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getAllTsFiles(fullPath)); // Recursive call
        } else if (file.endsWith(".ts")) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Scans a NestJS project to extract routes and generate Insomnia-compatible JSON.
 * @param projectPath Path to the NestJS project root
 */
export function scanNestProject(projectPath: string) {
    const projectFolderName = path.basename(projectPath); // Get the folder name as workspace name
    const controllersDir = path.join(projectPath, "src");
    const project = new Project();
    const routesByController: Record<string, any[]> = {}; // Store routes per controller

    console.log(chalk.yellow(`📂 Recursively searching for TypeScript files in: ${controllersDir}`));

    const tsFiles = getAllTsFiles(controllersDir);
    if (tsFiles.length === 0) {
        console.log(chalk.red("⚠️ No TypeScript files found in the src directory!"));
        return;
    }

    for (const filePath of tsFiles) {
        console.log(chalk.cyan(`🔍 Scanning file: ${filePath}`));

        try {
            const sourceFile = project.addSourceFileAtPath(filePath);
            const controllerClasses = sourceFile.getClasses().filter(cls => cls.getDecorator("Controller"));

            for (const cls of controllerClasses) {
                const controllerDecorator = cls.getDecorator("Controller");
                let basePath = "";

                if (controllerDecorator) {
                    const arg = controllerDecorator.getArguments()[0];
                    if (arg && arg.getKind() === SyntaxKind.StringLiteral) {
                        basePath = arg.getText().replace(/['"]/g, ""); // Remove quotes
                    }
                }

                const controllerName = cls.getName() || "UnknownController";
                console.log(chalk.green(`✅ Found Controller: ${controllerName} (Base Path: "/${basePath}")`));

                if (!routesByController[controllerName]) {
                    routesByController[controllerName] = [];
                }

                cls.getMethods().forEach(method => {
                    const routeDecorators = method.getDecorators().filter(decorator =>
                        ["Get", "Post", "Put", "Delete", "Patch"].includes(decorator.getName())
                    );

                    for (const decorator of routeDecorators) {
                        const httpMethod = decorator.getName().toUpperCase();
                        let routePath = "";

                        const args = decorator.getArguments();
                        if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
                            routePath = args[0].getText().replace(/['"]/g, ""); // Remove quotes
                        }

                        const fullPath = `/${basePath}/${routePath}`.replace(/\/+/g, "/"); // Normalize slashes
                        console.log(chalk.blue(`➡️  ${httpMethod} ${fullPath} (Method: ${method.getName()})`));

                        const parameters = method.getParameters().map((param: ParameterDeclaration) => ({
                            name: param.getName(),
                            type: param.getType().getText()
                        }));

                        if (parameters.length > 0) {
                            console.log(chalk.magenta(`   🔹 Parameters: ${JSON.stringify(parameters)}`));
                        }

                        routesByController[controllerName].push({
                            method: httpMethod,
                            url: fullPath,
                            parameters
                        });
                    }
                });
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error processing file: ${filePath}\n${error}`));
        }
    }

    console.log(chalk.green("\n🎉 Scan Completed! Routes Found:"));
    Object.entries(routesByController).forEach(([controller, routes]) => {
        console.log(`📁 Controller: ${controller}`);
        routes.forEach(route => {
            console.log(`➡️  ${route.method} ${route.url}`);
        });
    });

    const workspaceId = `wrk_${Math.random().toString(36).substring(7)}`;

    // per controller
    const requestGroups = Object.keys(routesByController).map(controllerName => ({
        _id: `fld_${Math.random().toString(36).substring(7)}`,
        _type: "request_group",
        parentId: workspaceId,
        name: controllerName,
    }));

    // requests grouped under their controllers
    const requests = Object.entries(routesByController).flatMap(([controllerName, routes]) => {
        const groupId = requestGroups.find(group => group.name === controllerName)?._id || workspaceId;

        return routes.map(route => ({
            _id: `req_${Math.random().toString(36).substring(7)}`,
            parentId: groupId,
            _type: "request",
            method: route.method,
            url: `{{base_url}}${route.url}`,
            name: route.url,
            parameters: route.parameters.map((param: { name: string; type: string }) => ({
                name: param.name,
                type: param.type
            })),
            headers: [],
            body: {},
        }));
    });

    return {
        _type: "export",
        __export_source: "Created by Pigeon",
        __export_format: 4,
        __export_date: new Date().toISOString(),
        resources: [
            {
                _id: workspaceId,
                _type: "workspace",
                name: projectFolderName, // Use folder name as workspace name
            },
            ...requestGroups,
            ...requests,
        ]
    };
}
