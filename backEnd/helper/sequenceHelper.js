const counter_model = require('../model/counter');

/**
 * Get next sequence number for a given model type
 * This is concurrency-safe using MongoDB's findOneAndUpdate with atomic operations

 */
const getNextSequence = async (modelType) => {
  try {
    // Use findOneAndUpdate with upsert to atomically increment the counter
    // This ensures no duplicate numbers even with parallel requests
    const counter = await counter_model.findOneAndUpdate(
      { _id: modelType },
      { $inc: { sequence_value: 1 } },
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true // Set default value on insert
      }
    );

    return counter.sequence_value;
  } catch (error) {
    console.error(`Error getting next sequence for ${modelType}:`, error);
    throw new Error(`Failed to generate sequence number for ${modelType}`);
  }
};

module.exports = {
  getNextSequence,
};

