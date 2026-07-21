import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: function passwordRequired() {
        return !this.googleId
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword() {
  if (!this.password || !this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', userSchema)
