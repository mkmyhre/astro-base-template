import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";

export default tseslint.config(
	{
		ignores: ["dist/", ".astro/", ".wrangler/", "node_modules/", "worker-configuration.d.ts"],
	},
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...astro.configs.recommended,
	{
		files: ["**/*.astro"],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		files: ["*.config.{js,mjs,ts}", "eslint.config.js"],
		extends: [tseslint.configs.disableTypeChecked],
	},
	prettier,
);
