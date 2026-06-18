require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const [username, password, name = "Store Owner"] = process.argv.slice(2);

if (!username || !password) {
  console.error("Usage: node seed-owner.js <username> <password> [display-name]");
  process.exit(1);
}

const connectionString =
  "mongodb://satya_db_user:Uk6JfRgqTlthP2i3@ac-jfg5h1o-shard-00-00.fkauydv.mongodb.net:27017,ac-jfg5h1o-shard-00-01.fkauydv.mongodb.net:27017,ac-jfg5h1o-shard-00-02.fkauydv.mongodb.net:27017/Ecommerce_fullstack?ssl=true&replicaSet=atlas-orn0ee-shard-0&authSource=admin";

const Owner = mongoose.model("Owner", {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "Store Owner",
  },
  role: {
    type: String,
    default: "owner",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

async function main() {
  await mongoose.connect(connectionString);
  const hashedPassword = await bcrypt.hash(password, 8);
  await Owner.findOneAndUpdate(
    { username },
    {
      username,
      password: hashedPassword,
      name,
      role: "owner",
    },
    { upsert: true, new: true },
  );
  console.log(`Owner credential saved for username: ${username}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
