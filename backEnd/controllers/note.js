const note_model = require('../model/note');
const mongoose = require('mongoose');

/**
 * Create a new note
 * POST /api/admin/notes
 */
exports.create_note = async (req, res) => {
  try {
    const { title, content } = req.body;
    const adminId = req.admin._id; // From authorization middleware

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Note title is required',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Note content is required',
      });
    }

    // Create note
    const note = await note_model.create({
      title: title.trim(),
      content: content.trim(),
      createdBy: adminId,
    });

    // Populate createdBy field
    await note.populate('createdBy', 'name email');

    return res.status(201).json({
      status: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create note',
    });
  }
};

/**
 * Get all notes (latest first)
 * GET /api/admin/notes
 */
exports.get_all_notes = async (req, res) => {
  try {
    const notes = await note_model
      .find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }) // Latest first
      .lean();

    return res.status(200).json({
      status: true,
      message: 'Notes fetched successfully',
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch notes',
    });
  }
};

/**
 * Get single note by ID
 * GET /api/admin/notes/:id
 */
exports.get_note_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid note ID',
      });
    }

    const note = await note_model
      .findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!note) {
      return res.status(404).json({
        status: false,
        message: 'Note not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Note fetched successfully',
      data: note,
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch note',
    });
  }
};

/**
 * Update note by ID
 * PUT /api/admin/notes/:id
 */
exports.update_note = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid note ID',
      });
    }

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Note title is required',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Note content is required',
      });
    }

    // Update note
    const note = await note_model.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!note) {
      return res.status(404).json({
        status: false,
        message: 'Note not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update note',
    });
  }
};

/**
 * Delete note by ID
 * DELETE /api/admin/notes/:id
 */
exports.delete_note = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid note ID',
      });
    }

    const note = await note_model.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        status: false,
        message: 'Note not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to delete note',
    });
  }
};
