import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/second-brain";

export async function connectDb() {
  const mongoUri = process.env.MONGO_URI ?? DEFAULT_MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log("connected to db");
}

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 64,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  { timestamps: true }
);

const ContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["twitter", "youtube"],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const LinkSchema = new Schema(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema>;
export type ContentDocument = InferSchemaType<typeof ContentSchema>;
export type LinkDocument = InferSchemaType<typeof LinkSchema>;

export const UserModel = mongoose.model("User", UserSchema);
export const ContentModel = mongoose.model("Content", ContentSchema);
export const LinkModel = mongoose.model("Link", LinkSchema);
