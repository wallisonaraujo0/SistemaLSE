import express from "express"
import http from "http"
import path from "path"
import mainRoutes from "./routes/routes.js"
import dotenv from "dotenv"

dotenv.config()
const app = express()
const server = http.createServer(app)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.resolve("src", "frontend")))
app.use("/api",mainRoutes)

app.get("/", (req, res) => {
    res.sendFile(path.resolve("src", "frontend", "pages", "login.html"))
})
app.get("/dashboard", (req, res) => {
    res.sendFile(path.resolve("src", "frontend", "pages", "dashboard.html"))
})
app.get("/clients", (req, res) => {
    res.sendFile(path.resolve("src", "frontend", "pages", "clients.html"))
})
app.get("/admin", (req, res) => {
    res.sendFile(path.resolve("src", "frontend", "pages", "admin.html"))
})
app.get("/send", (req, res) => {
    res.sendFile(path.resolve("src", "frontend", "pages", "send.html"))
})

server.listen(3131 , () => {
    console.log(`Servidor rodando na no endereço http://127.0.0.1:${process.env.PORT}`)
})