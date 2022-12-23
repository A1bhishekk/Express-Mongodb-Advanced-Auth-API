import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
      const DB_OPTIONS = {
        dbName: "id_manager",
      }
      mongoose.set('strictQuery', true);
      await mongoose.connect(DATABASE_URL, DB_OPTIONS)


      console.log('Connected To Database Successfully...')
    } catch (error) {
      console.log(error)
    }
  }
  
  export default connectDB