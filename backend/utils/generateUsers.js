// generateUser.js
const bcrypt = require("bcrypt");

// Function to generate 6-digit user ID starting with "25"
function generateUserId() {
  const randomDigits = Math.floor(10 + Math.random() * 90);
  return "25" + randomDigits.toString();
}

async function main() {
  // Take password from command line args
  const password = '1234';

  if (!password) {
    console.error("❌ Please provide a password string. Example:");
    console.error("   node generateUser.js 123456");
    process.exit(1);
  }

  const userId = generateUserId();

  // Hash the given password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log("Generated User ID:", userId);
  console.log("Plain Password   :", password);
  console.log("Hashed Password  :", hashedPassword);
}

main().catch(err => console.error(err));
