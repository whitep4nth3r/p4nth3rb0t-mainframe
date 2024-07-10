import mongoose from "mongoose";

const conn_string = process.env.DB_CONN_STRING;

const connect = () => {
  if (conn_string) {
    mongoose
      .connect(conn_string, {
        authSource: "admin",
      })
      .then(() => {
        console.log("🧁 Database connected!");
      })
      .catch((e) => {
        console.error("Connection error", e.message);
      });
  }
};

export default { connect };
