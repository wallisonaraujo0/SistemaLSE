import JWT from "jsonwebtoken";
import  credentials from "../credentials/credentials.js"
const authMiddleware = (permissions) => {
   return async (req, res, next) => {
        try {
            if (!req.headers.authorization) {res.status(401); res.json({error: "Token de sessão invalido"},); return}
            const [, token] = req.headers.authorization.split(" ")
            JWT.verify(token, "1ayydasy179s917", async function(err, decoded) {
                if (decoded) {
                    const requestUser =  credentials.find(user => user.priority === decoded.priority)
                    if (!requestUser) {
                        res.status(401)
                        res.json({error: "Não autorizado"})
                        res.end()
                    }
                    else {
                        if (permissions.includes(requestUser.priority)) {
                            console.log("passou!")
                            next()
                        }
                        else {
                            res.status(401)
                            res.json({error: "Não autorizado"})
                            res.end()
                        }
                    }
                }
                else {
                    res.status(401)
                    res.json({error: "Token de sessão invalido"})
                }
            })
        }
        catch (err) {
            res.status(401)
            res.json({error: "Token de sessão invalido"})
        }
    }
}
export default authMiddleware