import path from "path";
import { fileURLToPath } from "url";
import app from "./src/app.js";
import dotenv from "dotenv";
import supabase from "./src/config/supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "src/.env") });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🔌 Checking Supabase connection...");
    const { error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    console.log("✅ Backend connected to Supabase");
  } catch (err) {
    console.error("❌ Failed to connect to Supabase:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
