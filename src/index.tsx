import express from 'express';
import { configDotenv } from "dotenv";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

configDotenv();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});