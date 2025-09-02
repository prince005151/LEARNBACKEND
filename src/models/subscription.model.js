import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber : {
            type : Schema.types.ObjectId,
            ref : "User"
        },
        channel : {
            type : Schema.types.ObjectId,
            ref : "User"
        }
    },
     {timeStamps:true}
)

const subscription = mongoose.model("subscription",subscriptionSchema)

export{subscription}