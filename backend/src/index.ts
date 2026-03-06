import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
const JWT_PASSWORD = "122123"
import { connectDb, UserModel } from "./db.js";
const app = express();


app.use(express.json());
app.use


app.post("/api/v1/signup", async (req, res) => {

    const { username, password } = req.body

    if (!username || !password) {
        res.json({
            message: "Enter details correctly"
        })
    }

    try {

        await UserModel.create({
            username,
            password
        })


        res.status(201).json({
            message: "User Signed Up"
        })
    } catch (error) {
        res.json({
            message: "some error occured",
            error
        }
        )
        console.log(error);

    }



})


app.post("/api/v1/signin", async (req, res) => {

    const { username, password } = req.body;


    if (!username || !password) {
        res.json({
            message: "Enter details correctly"
        })
    }

    const existingUser = await UserModel.findOne({
        username
    })

    if (existingUser) {
        const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.json({
            message: "incorrect username or password "
        })
    }





})

app.get("/api/v1/content", (req, res) => {

    const { title, description, link } = req.body

})


app.delete("/api/v1/content", (req, res) => {

})


app.post("/api/v1/brain/share", (req, res) => {

})


app.get("/api/v1/brain/:shareLink", (req, res) => {

})


app.listen(3000, async () => {
    await connectDb()
    console.log("Connected on 3000");

})