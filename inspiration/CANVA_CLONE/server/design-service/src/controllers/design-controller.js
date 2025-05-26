const Design = require("../models/design");

exports.getUserDesigns = async (req, res) => {
  try {
    const userId = req.user.userId;

    const designs = await Design.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: designs,
    });
  } catch (e) {
    console.error("Error fetching designs", e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch designs",
    });
  }
};

exports.getUserDesignsByID = async (req, res) => {
  try {
    const userId = req.user.userId;
    const designId = req.params.id;

    const design = await Design.findOne({ _id: designId, userId });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found! or you don't have permission to view it.",
      });
    }

    res.status(200).json({
      success: true,
      data: design,
    });
  } catch (e) {
    console.error("Error fetching design by ID", e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch design by ID",
    });
  }
};

exports.saveDesign = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { designId, name, canvasData, width, height, category } = req.body;
    if (designId) {
      const design = await Design.findOne({ _id: designId, userId });
      if (!design) {
        return res.status(404).json({
          success: false,
          message: "Design not found! or you don't have permission to view it.",
        });
      }

      if (name) design.name = name;
      if (canvasData) design.canvasData = canvasData;
      if (width) design.width = width;
      if (height) design.height = height;
      if (category) design.category = category;

      design.updatedAt = Date.now();
      const updatedDesign = await design.save();

      return res.status(200).json({
        success: true,
        data: updatedDesign,
      });
    } else {
      const newDesign = new Design({
        userId,
        name: name || "Untitled Design",
        width,
        height,
        canvasData,
        category,
      });

      const saveDesign = await newDesign.save();
      return res.status(200).json({
        success: true,
        data: saveDesign,
      });
    }
  } catch (e) {
    console.error("Error while saving design", e);
    res.status(500).json({
      success: false,
      message: "Failed to save design",
    });
  }
};

exports.deleteDesign = async (req, res) => {
  try {
    const userId = req.user.userId;
    const designId = req.params.id;
    const design = await Design.findOne({ _id: designId, userId });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found! or you don't have permission to delete it.",
      });
    }

    await Design.deleteOne({ _id: designId });

    res.status(200).json({
      success: true,
      message: "Design deleted successfully",
    });
  } catch (e) {
    console.error("Error while deleting design", e);
    res.status(500).json({
      success: false,
      message: "Failed to delete design",
    });
  }
};
