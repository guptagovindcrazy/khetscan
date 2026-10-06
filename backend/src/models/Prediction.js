const mongoose = require('mongoose');

const topPredictionSchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: ['healthy', 'diseased'], required: true },
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    originalFileName: { type: String, required: true, maxlength: 120 },
    cropName: { type: String, required: true, index: true },
    predictedDisease: { type: String, required: true, index: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: ['healthy', 'diseased'], required: true },
    topPredictions: { type: [topPredictionSchema], default: [] },
    symptoms: { type: String, default: '' },
    treatment: { type: [String], default: [] },
    prevention: { type: [String], default: [] },
    simulated: { type: Boolean, default: false },
    modelMode: { type: String, default: 'demo' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
