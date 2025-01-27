import { Project, SyntaxKind, ParameterDeclaration } from "ts-morph";
import path from "path";
import fs from "fs-extra";

/**
 * Scans a NestJS project to extract routes and generate Insomnia-compatible JSON.
 * @param projectPath Path to the NestJS project root
 */
export function scanNestProject(projectPath: string) {
    const controllersDir = path.join(projectPath, "src");
    const project = new Project();

    const tsFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith(".ts"));
    const routes: any[] = [];

    for (const file of tsFiles) {
        const filePath = path.join(controllersDir, file);
        const sourceFile = project.addSourceFileAtPath(filePath);

        const controllerClasses = sourceFile.getClasses().filter(cls =>
            cls.getDecorator("Controller")
        );

        for (const cls of controllerClasses) {
            const controllerDecorator = cls.getDecorator("Controller");
            let basePath = "";

            if (controllerDecorator) {
                const arg = controllerDecorator.getArguments()[0];
                if (arg && arg.getKind() === SyntaxKind.StringLiteral) {
                    basePath = arg.getText().replace(/['"]/g, ""); // Remove quotes
                }
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
                    const parameters = method.getParameters().map((param: ParameterDeclaration) => ({
                        name: param.getName(),
                        type: param.getType().getText()
                    }));

                    routes.push({
                        method: httpMethod,
                        url: fullPath,
                        parameters
                    });
                }
            });
        }
    }

    return {
        _type: "export",
        __export_source: "Created by Pigeon",
        __export_format: 4,
        __export_date: new Date().toISOString(),
        resources: routes.map(route => ({
            _id: `req_${Math.random().toString(36).substring(7)}`,
            parentId: "__ROOT__",
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
        }))
    };
}
