const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const providerSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
}, { _id: false });


const friendListSchema = new mongoose.Schema({
  friendId : {type: mongoose.Schema.Types.ObjectId , ref : "User"},
  isInvited : {type : Boolean , default : false},
  getInvite : {type : Boolean , default : false},
  rejectInvite : {type : Boolean , default : false},
  isConnected : {type : Boolean , default : false}
})

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, trim: true },
    password: { type: String},
    avatar: {
        url: String,
        originalName: String,
        mimetype: String,
        publicId: String,
        resourceType: String
    },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    providers: [providerSchema],
    preferences: {
      language: { type: String, default: "en" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false },
      },
    },
    friendList : [friendListSchema], 
    scheduledDeletion: { type: Date },
    otp : Number,
    isVerified : {
      type : Boolean,
      default : false
    }
   },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate access & refresh tokens
userSchema.methods.generateAuthToken = function () {
  const accessToken = jwt.sign(
    { userId: this._id, roles: this.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: this._id, roles: this.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  );

  return { accessToken, refreshToken };
};

const User = mongoose.model("User", userSchema);
module.exports = User;

