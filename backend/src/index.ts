import crypto from "node:crypto";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDb, ContentModel, LinkModel, UserModel } from "./db.js";
import { userMiddleware, type AuthenticatedRequest } from "./middleware.js";

const app = express();

const PORT = Number(process.env.PORT ?? 3000);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER ?? "dev_pepper_change_me";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

type ContentType = "twitter" | "youtube";

function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(`${password}${PASSWORD_PEPPER}`)
    .digest("hex");
}

function isValidUrl(input: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

function createShareHash(): string {
  return crypto.randomBytes(8).toString("hex");
}

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().length < 3 ||
    password.length < 8
  ) {
    res.status(400).json({
      message:
        "Invalid input. Username must be at least 3 chars and password at least 8 chars.",
    });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ username: normalizedUsername });
  if (existingUser) {
    res.status(409).json({ message: "Username already exists" });
    return;
  }

  const passwordHash = hashPassword(password);
  await UserModel.create({ username: normalizedUsername, password: passwordHash });

  res.status(201).json({ message: "User signed up successfully" });
});

app.post("/api/v1/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().length < 3 ||
    password.length < 8
  ) {
    res.status(400).json({
      message:
        "Invalid input. Username must be at least 3 chars and password at least 8 chars.",
    });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existingUser = await UserModel.findOne({ username: normalizedUsername });
  if (!existingUser) {
    res.status(401).json({ message: "Incorrect username or password" });
    return;
  }

  const passwordHash = hashPassword(password);
  if (existingUser.password !== passwordHash) {
    res.status(401).json({ message: "Incorrect username or password" });
    return;
  }

  const token = jwt.sign({ id: existingUser._id.toString() }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

app.post(
  "/api/v1/content",
  userMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, link, type } = req.body as {
      title?: string;
      link?: string;
      type?: ContentType;
    };

    if (
      typeof title !== "string" ||
      typeof link !== "string" ||
      (type !== "twitter" && type !== "youtube")
    ) {
      res.status(400).json({ message: "Invalid payload" });
      return;
    }

    if (!isValidUrl(link)) {
      res.status(400).json({ message: "Link must be a valid URL" });
      return;
    }

    const content = await ContentModel.create({
      title: title.trim(),
      link: link.trim(),
      type,
      userId: req.userId!,
    });

    res.status(201).json({
      message: "Content created",
      content: {
        id: content._id,
        title: content.title,
        link: content.link,
        type: content.type,
        createdAt: content.createdAt,
      },
    });
  }
);

app.get(
  "/api/v1/content",
  userMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const type = req.query.type;
    const filter: { userId: string; type?: ContentType } = { userId: req.userId! };

    if (type === "twitter" || type === "youtube") {
      filter.type = type;
    }

    const content = await ContentModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({
      content: content.map((item) => ({
        id: item._id,
        title: item.title,
        link: item.link,
        type: item.type,
        createdAt: item.createdAt,
      })),
    });
  }
);

app.delete(
  "/api/v1/content/:contentId",
  userMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const contentId = req.params.contentId;

    if (typeof contentId !== "string" || !mongoose.Types.ObjectId.isValid(contentId)) {
      res.status(400).json({ message: "Invalid content id" });
      return;
    }

    const deleted = await ContentModel.findOneAndDelete({
      _id: contentId,
      userId: req.userId!,
    });

    if (!deleted) {
      res.status(404).json({ message: "Content not found" });
      return;
    }

    res.json({ message: "Content deleted" });
  }
);

app.post(
  "/api/v1/brain/share",
  userMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const { share } = req.body as { share?: boolean };
    if (typeof share !== "boolean") {
      res.status(400).json({ message: "share must be boolean" });
      return;
    }

    if (share) {
      const existing = await LinkModel.findOne({ userId: req.userId! });
      if (existing) {
        res.json({ hash: existing.hash });
        return;
      }

      const hash = createShareHash();
      await LinkModel.create({ userId: req.userId!, hash });
      res.json({ hash });
      return;
    }

    await LinkModel.deleteOne({ userId: req.userId! });
    res.json({ message: "Share link disabled" });
  }
);

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
  const shareLink = req.params.shareLink;
  if (typeof shareLink !== "string" || !shareLink.trim()) {
    res.status(400).json({ message: "Invalid share link" });
    return;
  }

  const link = await LinkModel.findOne({ hash: shareLink }).lean();

  if (!link) {
    res.status(404).json({ message: "Invalid share link" });
    return;
  }

  const [user, content] = await Promise.all([
    UserModel.findById(link.userId).lean(),
    ContentModel.find({ userId: link.userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({
    username: user.username,
    content: content.map((item) => ({
      id: item._id,
      title: item.title,
      link: item.link,
      type: item.type,
      createdAt: item.createdAt,
    })),
  });
});

async function startServer() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`backend listening on port ${PORT}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error("failed to start server", error);
  process.exit(1);
});
