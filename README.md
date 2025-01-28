# 🐦 Pigeon - NestJS Route Mapper CLI

Pigeon is a **CLI tool** that scans a NestJS project and **automatically maps all API routes** into an **Insomnia or Postman**-compatible **import file**. 🚀

🔍 **It recursively searches for controllers, extracts all endpoints**, and organizes them neatly into **Insomnia or Postman collections**.

📦 **Available on NPM:** [Pigeon Nest Mapper on NPM](https://www.npmjs.com/package/pigeon-nest-mapper)
🔍 **GitHub Repository:** [Pigeon on GitHub](https://github.com/Claquettes/pigeon)

---

## **✨ Features**
- 🔍 **Scans NestJS projects** to detect all `@Controller()` routes.
- 📁 **Groups routes by controller** inside **Insomnia or Postman**.
- 📂 **Recursively finds controllers** in the entire project.
- 📝 **Exports to `insomnia.json` or `postman.json`** for easy import.
- 💡 **Simple CLI usage** with just one command.
- 🕊️ **New:** Now you can choose between **Insomnia** (default) and **Postman**, or exit the CLI with "Quit Pigeon".

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

### **Example:**
```sh
pigeon /home/user/my-nest-app
```

This will prompt:
```
🪹 Scanning NestJS project at: /home/user/my-nest-app 🐦
Choose the export format:
  ❯ Insomnia
    Postman
    ──────────
    Quit Pigeon
```

- If you choose **Insomnia**, the output file will be **`insomnia.json`**.
- If you choose **Postman**, the output file will be **`postman.json`**.
- If you choose **Quit Pigeon**, the CLI will exit.

After selecting a format:
```
🎉 Scan Completed! Routes Found:
📁 Controller: AuthController
➡️  POST /auth/register
➡️  POST /auth/login

📁 Controller: UserController
➡️  GET /user/profile
➡️  POST /user/money

📁 Insomnia import file generated at: /home/user/my-nest-app/insomnia.json
```

Then, **import the generated file (`insomnia.json` or `postman.json`) into your API tool to test all routes instantly!** 🚀

---

## **📦 Dependencies**
Pigeon relies on:
- 📜 **[`commander`](https://www.npmjs.com/package/commander)** - CLI command parsing.
- 🏗 **[`ts-morph`](https://www.npmjs.com/package/ts-morph)** - TypeScript AST parsing.
- 🗂 **[`fs-extra`](https://www.npmjs.com/package/fs-extra)** - File system utilities.
- 🎨 **[`chalk`](https://www.npmjs.com/package/chalk)** - Colored terminal output.
- 🎛️ **[`inquirer`](https://www.npmjs.com/package/inquirer)** - CLI user input handling.

---

## **🌟 Contributing**
- **Fork this repository**
- Create a feature branch (`git checkout -b feature-name`)
- Make your changes and commit (`git commit -m "Added cool feature"`)
- Push the branch (`git push origin feature-name`)
- Open a **Pull Request** 🚀

---

## **📝 License**
MIT © [Claquettes](https://github.com/Claquettes)