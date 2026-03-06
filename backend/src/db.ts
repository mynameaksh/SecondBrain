import mongoose from "mongoose";


export async function connectDb() {
    await mongoose.connect("Your Url").then(() => {
        console.log("connected to db");

    }

    );

}


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
})

export const UserModel = mongoose.model('User', UserSchema);

const ContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,

    },
    link: {
        type: String,
        required: true
    },
    tags: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tag'
    }],
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export const ContentModel = mongoose.model('Content', ContentSchema);
