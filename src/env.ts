import { z } from "zod";

// Populate this schema before referencing fields via getEnv() — until you do, Env is `{}`.
const schema = z
	.object({
		// API_KEY: z.string().min(1),
		// STRIPE_SECRET: z.string().startsWith("sk_"),
	})
	.loose();

export type Env = z.infer<typeof schema>;

export function getEnv(runtimeEnv: unknown): Env {
	const result = schema.safeParse(runtimeEnv);
	if (!result.success) {
		throw new Error(`Invalid runtime env: ${z.prettifyError(result.error)}`);
	}
	return result.data;
}
