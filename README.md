⚛️ React + TypeScript + Vite
This template provides a minimal setup to get React working in Vite with Hot Module Replacement (HMR) and some useful ESLint rules.

Github Repository Frontend : https://github.com/ClarkGenesis/Frontend-fe-

🚀 Getting Started
Currently, two official plugins are available:

@vitejs/plugin-react – uses Babel for Fast Refresh

@vitejs/plugin-react-swc – uses SWC for Fast Refresh

💻 2. Frontend Setup
🔹 Open Terminal in Frontend Folder
Go to your frontend folder location:
C:\xampp\htdocs\frontend
Open a terminal window inside the folder.

🔹 Install Dependencies
Run this command to install the necessary packages:
npm install


🔹 Run the Development Server
After installation completes, start the development server with:
npm run dev

🔹 Access the Frontend
Your terminal will display a local development link, usually like:
http://localhost:5173

👉 Hold Ctrl and click the link, or copy and paste it into your browser to open the frontend app.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


Install Dependencies
npm install

Run the Development Server
npm run dev

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
