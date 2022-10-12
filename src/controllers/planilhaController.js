import xlsx from "node-xlsx"
import path from "path"
import planilhaServices from "../services/planilhaServices.js"
import fs from "fs"
import dotenv from "dotenv"
import JWT from "jsonwebtoken"
import credentials from "../credentials/credentials.js"
dotenv.config()
export const planilhaController =  {
    async planilhaUpload (req, res) { 
            if (req.file) {
                const token = req.body
                const file = req.file
                if (!token.token) {
                    res.sendFile(path.resolve("src", "frontend", "pages", "nosend.html"))
                    return
                }
                JWT.verify(token.token, "1ayydasy179s917", async (err, decoded) => {
                    if (decoded.priority != "admin") {
                        res.sendFile(path.resolve("src", "frontend", "pages", "nosend.html"))
                        return
                    }else {
                        const planilha = await new planilhaServices().planilhaUploadService(file, "pdv.xlsx")
                        setTimeout(() => {
                            planilhaController.verifyEmpityRows()
                        }, 3000);
                        if (planilha instanceof Error) {
                            res.sendFile(path.resolve("src", "frontend", "pages", "nosend.html"))
                        }
                        else {
                            res.sendFile(path.resolve("src", "frontend", "pages", "send.html"))
                        }
                    }
                })
            }
            else{res.send("Planilha invalida")}
    },
    async getProductsByPlanilha (req, res) {
        let planilhaObject = []
        const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
        const produtos = planilha.find(pagina => pagina.name === "Produtos")
        produtos.data = produtos.data.filter(produtoArray => !produtoArray.includes("Codigo") || !produtoArray.includes("Nome") || !produtoArray.includes("Valor"))
        produtos.data.forEach(produtoArray => {
            let produtoObject = { // so trocar as posiçoes do produto array e manter as chaves com os nomes iguais o do codigo do front
                codigo: produtoArray[0],
                nome: produtoArray[1],
                preço: produtoArray[2],
            }
            planilhaObject.push(produtoObject)
        })
        res.json({produtos: planilhaObject})
    },
    async addVendasByPlanilha (req, res) {
        const { newVendas } = req.body
        if (!newVendas) {
            res.send(new Error("Parametros passados incorretamente"))
        }
       try {
        const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
        const vendas = planilha.find(pagina => pagina.name === "Vendas")
        newVendas.forEach(vd => {
            vendas.data.push([vd.codigo, vd.data , vd.cupom , vd.cliente])
        });
        planilhaController.updatePdvPlanilha(vendas.data, "vendas")
        res.json({status: "Venda adicionada"})
       } catch (err) {
        console.log(err)
       }
    },
    async addCuponByPlanilha (req, res) {
        const { newCupon } = req.body
        if (!newCupon) {
            res.send(new Error("Parametros passados incorretamente"))
        }
        try {
            const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
            const cupons = planilha.find(pagina => pagina.name === "Cupons")
            cupons.data.push([newCupon.cupom, newCupon.data, newCupon.valorTotal , newCupon.metodo1, newCupon.valor1, newCupon.metodo2, newCupon.valor2, newCupon.loja, newCupon.cliente])
            planilhaController.updatePdvPlanilha(cupons.data, "cupons")
            res.json({status: "Cupon adicionado"})
        } catch (err) {
            console.log(err)
        }
    },
    async download (req, res) {
        try {
        res.sendFile(path.resolve("src", "planilhas", "pdv.xlsx"))
        }catch (err) {
            res.send({error: "houve um erro no servidor"})
        }
    },
    async getVendaNumber () { // fora de uso
        const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
        const venda = planilha.find(pagina => pagina.name === "Cupons")
        const number = venda.data.forEach(element => {
        });
    },
    async getCuponNUmber (req, res) {
        const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
        const cupons = planilha.find(pagina => pagina.name === "Cupons")
        const numbersArray = [""]
       cupons.data.forEach(element => {
            if (element[0] !== "Cupom") {
                numbersArray.push(element[0])
            }
        });
        if (numbersArray.length < 1) {
            res.json({number: 1}) 
        }else {
            const number = numbersArray.reduce(function(a, b) {
                return Math.max(a, b);
              }, -Infinity);
              res.json({number: number + 1}) 
        }
    },
    async xlsxParser () {
        const workSheetsFromFile = xlsx.parse(path.resolve("src", "P.xlsx"));
        return workSheetsFromFile
    },
    async updatePdvPlanilha (data, type) {
        try {
            const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
            const produtos = planilha.find(pagina => pagina.name === "Produtos")
            const vendas = planilha.find(pagina => pagina.name === "Vendas")
            const cupons = planilha.find(pagina => pagina.name === "Cupons")
            const clientes = planilha.find(pagina => pagina.name === "Clientes")
            const produtosOprions = {'!cols': [{wch: 20}, {wch: 35}, {wch: 20}]}
            const vendasOprions = {'!cols': [{wch: 20}, {wch: 20}, {wch: 20}, {wch: 35}]}
            const cuponsOprions = {'!cols': [{wch: 20}, {wch: 20}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 10},  {wch: 10}, {wch: 10}, {wch: 35}]}
            const clientesOptions = {'!cols': [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}]}
            let buffer 
            if (type === "produtos") { 
                buffer = xlsx.build([
                    {name: 'Produtos', data: data, options: produtosOprions},
                    {name: 'Vendas', data: vendas.data, options: vendasOprions},
                    {name: 'Cupons', data: cupons.data, options: cuponsOprions},
                    {name: 'Clientes', data: clientes.data, options: clientesOptions},
                ]);
            }
            else if (type === "vendas") {
                buffer = xlsx.build([
                    {name: 'Produtos', data: produtos.data, options: produtosOprions},
                    {name: 'Vendas', data: data, options: vendasOprions},
                    {name: 'Cupons', data: cupons.data, options: cuponsOprions},
                    {name: 'Clientes', data: clientes.data, options: clientesOptions},
                ]);            
            }
            else if (type === "cupons") {
                buffer = xlsx.build([
                    {name: 'Produtos', data: produtos.data, options: produtosOprions},
                    {name: 'Vendas', data: vendas.data, options: vendasOprions},
                    {name: 'Cupons', data: data, options: cuponsOprions},
                    {name: 'Clientes', data: clientes.data, options: clientesOptions},
                ]);
            }
            else if (type === "clientes") {
                buffer = xlsx.build([
                    {name: 'Produtos', data: produtos.data, options: produtosOprions},
                    {name: 'Vendas', data: vendas.data, options: vendasOprions},
                    {name: 'Cupons', data: cupons.data, options: cuponsOprions},
                    {name: 'Clientes', data: data, options: clientesOptions},
                ]);
            }
            fs.writeFile(path.resolve("src", "planilhas", `pdv.xlsx`), buffer, err => { 
                if (err) {
                    throw new Error("Error SALVAR ARQUIVO")
                } else {
                    console.log("File written");
                }
            }); 
        } catch (err) {
            console.log(err)
        }
        return
    },
    //Clients
    async getAllClientsByPlanilha (req, res) {
        try {
            const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
            const clientes = planilha.find(pagina => pagina.name === "Clientes")
            const clientsArray = []
            clientes.data = clientes.data.filter(produtoArray => !produtoArray.includes("Nome") || !produtoArray.includes("Telefone"))
            clientes.data.forEach(clienteArray => {
                let clientObject = { // so trocar as posiçoes do produto array e manter as chaves com os nomes iguais o do codigo do front
                    nome: clienteArray[0],
                    telefone: clienteArray[1],
                    instagram: clienteArray[2],
                    loja: clienteArray[3],
                    data: clienteArray[4],
                }
                clientsArray.push(clientObject)
        })
        res.json({clients: clientsArray})
        }catch (err) {
            console.log(err)
        }
    },
    addClient (req, res) {
        const { newClient } = req.body
        try {
        if (!newClient || newClient.nome === "") {
            res.send(new Error("Parametros passados incorretamente"))
            return
        }
            const planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
            const clientes = planilha.find(pagina => pagina.name === "Clientes")
            clientes.data.push([newClient.nome, newClient.telefone, newClient.instagram , newClient.loja, newClient.data])
            planilhaController.updatePdvPlanilha(clientes.data, "clientes")
            res.json({status: "Cliente adicionado"})
            res.end()
        } catch (err) {
            console.log(err)
        }
    },
    //Users
    login (req, res) {
        const { username, password} = req.body
        const user = credentials.find(user => user.user === username)
        if (!user) {
            res.json({response: "Email ou senha invalidos"})
        }
        if (user.password === password) {
            const token = JWT.sign({priority: user.priority}, "1ayydasy179s917", {expiresIn: "5h"})
            res.json({response:{token: token, loja: user.loja}})
        }
        else {
            res.json({response: "Email ou senha invalidos"})
        }  
    },
    verifyToken (req, res) {
        const { token} = req.body
        if (JWT.verify(token, "1ayydasy179s917")) {
            res.json({token: "true"})
        }else {
            res.json({token: "false"})
        }
    },
    verifyEmpityRows () {
        let planilha = xlsx.parse(path.resolve("src", "planilhas", "pdv.xlsx"))
        let newPlanilha = []
        planilha.forEach(pagina => {
            const filtredData = pagina.data.filter(row => row.length > 1)
            newPlanilha.push({name: pagina.name, data: filtredData})
        });
        var buffer = xlsx.build(newPlanilha)
        fs.writeFileSync(path.resolve("src", "planilhas", "pdv.xlsx"), buffer)
    }
}
planilhaController.verifyEmpityRows()
