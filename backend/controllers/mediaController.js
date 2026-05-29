const Media = require("../model/media");

const getMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { type, sport, search } = req.query;

    const query = { status: "published" };
    if (type) query.type = type;
    if (sport) query.sport = sport;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const media = await Media.find(query)
      .populate("authorId", "firstName lastName")
      .populate("teamId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ publishedAt: -1 });

    const total = await Media.countDocuments(query);

    res.json({
      media,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate("authorId", "firstName lastName")
      .populate("teamId", "name");

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    media.views += 1;
    await media.save();

    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createMedia = async (req, res) => {
  try {
    const { title, description, type, sport, teamId, visibility, status, tags } = req.body;
    
    if (!title) return res.status(400).json({ message: "Title is required" });
    
    let mediaUrl = '';
    let mediaType = 'image';
    
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('video/')) mediaType = 'video';
      else if (mimeType.startsWith('image/')) mediaType = 'image';
      else mediaType = 'document';
    }
    
    const mediaData = mediaUrl ? [{ url: mediaUrl, type: mediaType }] : [];

    const newMedia = await Media.create({
      title,
      description,
      type: type || mediaType || "image",
      media: mediaData,
      sport: sport || "basketball",
      teamId,
      authorId: req.user._id,
      visibility,
      status: status || "published",
      publishedAt: status === "published" ? new Date() : null,
      tags,
    });

    await newMedia.populate("authorId", "firstName lastName");

    res.status(201).json(newMedia);
  } catch (error) {
    console.error("Create media error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const allowedUpdates = [
      "title", "description", "type", "media", "sport", "teamId",
      "visibility", "status", "tags", "featured"
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        media[field] = req.body[field];
      }
    });

    if (media.status === "published" && !media.publishedAt) {
      media.publishedAt = new Date();
    }

    await media.save();
    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    await media.deleteOne();
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
};
