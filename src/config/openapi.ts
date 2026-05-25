import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Extend Zod with .openapi() — must run before any schema uses it
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register bearer auth scheme once here
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "ERP API",
      version: "1.0.0",
      description: "ERP Backend API — auto-generated from Zod schemas",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
  });
}
