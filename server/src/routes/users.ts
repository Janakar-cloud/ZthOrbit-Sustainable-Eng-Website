import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || req.query.pageSize || 20);
  const skip = (page - 1) * limit;

  const search = (req.query.search as string | undefined)?.trim();
  const statusFilter = req.query.status as string | undefined;
  const roleFilter = req.query.role as string | undefined;
  const sortField = (req.query.sort as string) || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (statusFilter) filter.status = statusFilter;
  if (roleFilter) filter.role = roleFilter;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const data = items.map((u) => {
    const obj = u.toObject();
    return {
      id: String(obj._id),
      name: obj.name || "",
      email: obj.email,
      role: obj.role,
      status: obj.status,
      isVerified: Boolean(obj.emailVerified),
      avatarUrl: obj.avatarUrl || null,
      createdAt: obj.createdAt,
    };
  });

  res.json({ data, meta: { page, limit, total } });
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["superadmin", "admin", "editor", "viewer"]).default("viewer"),
  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

router.post("/", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return res.status(400).json({ error: "Email already exists" });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ ...parsed.data, passwordHash });
  const { passwordHash: _ph, ...safeUser } = user.toObject();
  res.status(201).json(safeUser);
});

const updateSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["superadmin", "admin", "editor", "viewer"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  password: z.string().min(8).optional(),
});

router.put("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: any = { ...parsed.data };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// PATCH endpoint for status updates
router.patch("/:id/status", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const parsed = z.object({
    status: z.enum(["active", "inactive"]),
  }).safeParse(req.body);
  
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status },
    { new: true }
  ).select("-passwordHash");
  
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

export default router;
