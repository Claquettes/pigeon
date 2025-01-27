# 🐦 Pigeon - NestJS Route Mapper CLI

Pigeon is a **CLI tool** that scans a NestJS project and **automatically maps all API routes** into an Insomnia-compatible **import file**. 🚀

🔍 **It recursively searches for controllers, extracts all endpoints**, and organizes them neatly into **Insomnia workspaces and folders**.

📦 **Available on NPM:** [Pigeon Nest Mapper on NPM](https://www.npmjs.com/package/pigeon-nest-mapper)

## **✨ Features**
- 🔍 **Scans NestJS projects** to detect all `@Controller()` routes.
- 📁 **Groups routes by controller** inside Insomnia.
- 📂 **Recursively finds controllers** in the entire project.
- 📝 **Exports to `insomnia.json`** for easy import into **Insomnia**.
- 💡 **Simple CLI usage** with just one command.

---

## **📥 Installation**
### **From NPM (Recommended)**
```sh
npm install -g pigeon-nest-mapper
```

### **From Source**
1. Clone the repo:
   ```sh
   git clone https://github.com/claquettes/pigeon.git
   cd pigeon
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build & link:
   ```sh
   npm run build
   npm link
   ```

---

## **🚀 Usage**
Once installed globally, run:
```sh
pigeon /path/to/nestjs-project
```

Example:
```sh
pigeon /home/user/my-nest-app
```

This will output:
```
🪹 Scanning NestJS project at: /home/user/my-nest-app 🐦
📂 Recursively searching for TypeScript files in: /home/user/my-nest-app/src

🎉 Scan Completed! Routes Found:
📁 Controller: AuthController
➡️  POST /auth/register
➡️  POST /auth/login

📁 Controller: UserController
➡️  GET /user/profile
➡️  POST /user/money

📁 Insomnia import file generated at: /home/user/my-nest-app/insomnia.json
```

Then, **import `insomnia.json` into Insomnia** to test all routes instantly! 🚀

---

## **📦 Dependencies**
Pigeon relies on:
- 📜 **[`commander`](https://www.npmjs.com/package/commander)** - CLI command parsing.
- 🏗 **[`ts-morph`](https://www.npmjs.com/package/ts-morph)** - TypeScript AST parsing.
- 🗂 **[`fs-extra`](https://www.npmjs.com/package/fs-extra)** - File system utilities.
- 🎨 **[`chalk`](https://www.npmjs.com/package/chalk)** - Colored terminal output.

---

## **🌟 Contributing**
- **Fork this repository**
- Create a feature branch (`git checkout -b feature-name`)
- Make your changes and commit (`git commit -m "Added cool feature"`)
- Push the branch (`git push origin feature-name`)
- Open a **Pull Request** 🚀

---

## **📝 License**
MIT © [Claquettes ](https://github.com/Claquettes)