import express from "express";
import cors from "cors";
import { PORT } from "./config.js";

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET","POST","OPTIONS"]
}));

app.get("/", (req, res) => {
    res.send("<h1>Hello World</h1>");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});