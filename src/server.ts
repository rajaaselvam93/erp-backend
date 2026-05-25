import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes";
import { connectDB } from "./config/database";
import { generateOpenApiSpec } from "./config/openapi";
import { STATUS_CODE } from "./constants";

// Import docs to register all paths into the OpenAPI registry
import "./docs/auth.docs";

dotenv.config();

const REQUIRED_ENV = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET", "DATABASE_HOST", "DATABASE_NAME"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(helmet());
app.use(morgan(":method :url :status"));
app.use(express.json());

app.use((req: any, res: any, next: any) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    if (
      req.method === "GET" &&
      (res.statusCode === STATUS_CODE.SUCCESS || res.statusCode === STATUS_CODE.CREATED) &&
      body &&
      (body.data === null ||
        body.data === undefined ||
        (Array.isArray(body.data) && body.data.length === 0) ||
        (typeof body.data === "object" &&
          body.data !== null &&
          body.data.constructor === Object &&
          Object.keys(body.data).length === 0))
    ) {
      res.status(STATUS_CODE.NO_CONTENT);
      return res.send();
    }
    return originalJson.call(this, body);
  };
  next();
});

const swaggerSpec = generateOpenApiSpec();
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs-json", (_req, res) => res.json(swaggerSpec));

app.get("/", (_req, res) => {
  res.send("ERP API Running");
});

app.use("/api/auth", authRoutes);

app.use((err: any, _req: any, res: any, next: any) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON in request body. Check for unescaped special characters.",
    });
  }
  next(err);
});

app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.status || 400).json({
    status: "error",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
