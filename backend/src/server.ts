import "dotenv/config";
import express from "express";

const environment = process.env["NODE_ENV"];
const PORT = process.env["PORT_BACKEND_LOCAL"];

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }))

if (!PORT) {
    throw new Error("se espera puerto de comunicacion")
}

app.listen(PORT, () => {
    console.log(`escuchando en puerto ${PORT}`)
})