const express = require("express");
const { authenticateUser } = require("./middleware/auth-user");
const { asyncHandler } = require("./middleware/async-handler");
const { User, Course } = require("./db").models;

// Construct a router instance.
const router = express.Router();

// Setup request body JSON parsing.
router.use(express.json());

// GET Route - Returns the currently authenticated user.
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      where: { emailAddress: req.currentUser.emailAddress },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });
    res.json({
      user,
    });
  })
);

// POST Route - Creates a new user.
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).location("/").end();
    } catch (err) {
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = err.errors.map((error) => error.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// GET Route - Returns a list of all courses including the user that owns each course.
router.get("/courses", async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });
  res.json({ courses });
});

// GET Route - Returns the course (and its user) that is asssociated with course ID specified in the id parameter.
router.get("/courses/:id", async (req, res) => {
  const course = await Course.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: User,
        as: "user",
        attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  if (course) {
    res.json({ course });
  } else {
    res.status(400).end();
  }
});

// POST Route - Creates a new course.
router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.create(req.body);
      res.status(201).location(`/api/courses/${course.id}`).end();
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        const errors = err.errors.map((error) => error.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// PUT Route - Updates the corresponding course determined by the id parameter.
router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({ where: { id: req.params.id } });
    if (course.userId === req.currentUser.id) {
      try {
        await course.update(req.body);
        res.status(204).end();
      } catch (err) {
        const errors = err.errors.map((error) => error.message);
        res.status(400).json({ errors });
      }
    } else {
      res.status(403).end();
    }
  })
);

// DELETE Route - Deletes the corresponding course determined by the id parameter.
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course.userId === req.currentUser.id) {
      try {
        await course.destroy();
        res.status(204).end();
      } catch (err) {
        const errors = err.errors.map((error) => error.message);
        res.status(400).json({ errors });
      }
    } else {
      res.status(403).end();
    }
  })
);

module.exports = router;
