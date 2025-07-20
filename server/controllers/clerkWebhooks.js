import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        // Clerk/Svix expects raw body for signature verification
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        await whook.verify(JSON.stringify(req.body),headers); // Throws if not valid

        // 2. Parse JSON for event data
        const { data, type } = req.body


        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    username: data.first_name + " "+  data.last_name,
                    image: data.image_url ?? "",
                };
                await User.create(userData);
                break;
            }
            case "user.updated": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    username: data.first_name + " " + data.last_name,
                    image: data.image_url ?? "",
                };
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }
            case "user.deleted":{
                await User.findByIdAndDelete(data.id);
                break;
            }    
            default:
                console.log("Unknown Clerk webhook type:", type);
                break;
        }

        res.json({ success: true, message: "Webhook Received" });
    } catch (error) {
        console.error("Clerk webhook error:", error);
        res.json({ success: false, message: error.message });
    }
};
export default clerkWebhooks;