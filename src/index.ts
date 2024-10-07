import dotenv from "dotenv";
import connectDB from "./db";
import app from "./app";

dotenv.config({
  path: ".env"
});

connectDB()
.then(() => {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log("Server is running on port => ", PORT);
  });

})
.catch((err) => {
  console.error("MongoDB connection Failed!!!", err);
  
})