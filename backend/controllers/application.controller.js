import Application from "../models/application.model.js";

// GET all applications for logged in user
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single application
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create application
export const createApplication = async (req, res) => {
  try {
    const {
      company,
      role,
      jobDescriptionUrl,
      jobDescriptionText,
      status,
      appliedDate,
      notes,
      salary,
    } = req.body;

    const application = await Application.create({
      userId: req.user._id,
      company,
      role,
      jobDescriptionUrl,
      jobDescriptionText,
      status: status || "applied",
      appliedDate: appliedDate || Date.now(),
      notes,
      salary,
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update application
export const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE application
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add interview round to application
export const addInterview = async (req, res) => {
  try {
    const { round, date, notes, outcome } = req.body;
    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        $push: { interviews: { round, date, notes, outcome } },
      },
      { new: true, runValidators: true },
    );
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Application.countDocuments({ userId });

    //Recent 5 applications
    const recent = await Application.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("company role status appliedDate");

    res.json({
      success: true,
      data: {
        total,
        byStatus: stats,
        recent,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
