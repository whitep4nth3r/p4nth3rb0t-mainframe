import mongoose from "mongoose";

const conn_string = process.env.DB_CONN_STRING;

const connect = () => {
  if (conn_string) {
    mongoose.connect(conn_string, {
      authSource: "admin",
    });
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
      console.log("🧁 Database connected!");
    });
  }
};

export default { connect };
