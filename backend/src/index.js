import dotenv from "dotenv";
dotenv.config();

import server from "./app.js";
import connectDb from "./db/index.js";

connectDb()
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Listening On port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed To Connect Database ", err);
  });
