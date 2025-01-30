import { prop, buildSchema, mongoose } from "@typegoose/typegoose";

export class User {
  @prop({
    required: [true, "Username is required."],
    minlength: [4, "Username has to be atleast 4 chars long."],
    unique: true,
  })
  username: string;

  @prop({
    required: [true, "Password is required."],
    minlength: [6, "Password has to be atleast 6 chars long."],
  })
  password: string;

  @prop({ enum: ["CLIENT", "EMPLOYEE"], default: "CLIENT" })
  role: "CLIENT" | "EMPLOYEE";

  @prop()
  refreshToken: string;
}

const UserSchema = buildSchema(User);
const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
