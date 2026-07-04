import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  summary: string;
  keywords: string[];
  priority: "high" | "medium" | "low";
  urgency: "immediate" | "soon" | "monitor" | "none";
  emotion: string;
  hrRecommendation: string;
  managementRecommendation: string;
  recommendedAction: string;
  analyzedAt: Date;
}

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  employeeName: string;
  employeeId: string;
  department: string;
  category: string;
  rating: number;
  message: string;
  isAnonymous: boolean;
  status: "pending" | "reviewed" | "resolved";
  aiAnalysis?: IAIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>({
  sentiment: { type: String, enum: ["positive", "neutral", "negative"], required: true },
  sentimentScore: { type: Number, min: -1, max: 1, default: 0 },
  summary: { type: String, default: "" },
  keywords: [{ type: String }],
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  urgency: { type: String, enum: ["immediate", "soon", "monitor", "none"], default: "monitor" },
  emotion: { type: String, default: "neutral" },
  hrRecommendation: { type: String, default: "" },
  managementRecommendation: { type: String, default: "" },
  recommendedAction: { type: String, default: "" },
  analyzedAt: { type: Date, default: Date.now },
});

const FeedbackSchema = new Schema<IFeedback>(
  {
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, minlength: 10 },
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    aiAnalysis: { type: AIAnalysisSchema, default: undefined },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
