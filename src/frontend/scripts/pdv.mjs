import { verifyToken } from "./verifyToken.mjs"
verifyToken()
let priceTotal = 0
let itensQuantity = 0
let selectedProducts = []
let addedPayments = []
let cupomNumber

async function getCupomNumber() {
    try {
        const number = await fetch("/api/cuponumber", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const numberJson = await number.json()
        cupomNumber = numberJson.number
        document.getElementById("cupom-number").innerHTML = ` Numero do Cupom: ${cupomNumber} `
    } catch (err) {
        console.log(err)
    }
}

getCupomNumber()
class formActions {
    constructor() { }
    async searchSwitch(e) {
        e.preventDefault()
        if (actionKeys.searchMode.value == "nome") {
            const getAll = await fetch("/api/planilhas/products", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const json = await getAll.json()
            const produtos = json.produtos
            const filtredDocs = produtos.filter(produto => produto.nome.toLowerCase()
            .includes(inputs.productInput.value.toLowerCase()))
            const res = document.getElementById("results")
            if (inputs.productInput.value === "" || filtredDocs.length <= 0) {
                res.style.display = "none"
                return
            }else {
                const documentFragment = document.createDocumentFragment()
                res.style.display = "flex"
                res.innerHTML = ""
                filtredDocs.forEach(produto => {
                    const sec = document.createElement('section')
                    sec.innerHTML = `
                        <span> ${produto.nome} </span>
                        <span> ${produto.codigo} </span>
                        <span> R$${produto.preço}.00 </span>
                         <button value="${produto.codigo}" class="add-btn">Adicionar</button>`
                    documentFragment.append(sec)
                })
                res.append(documentFragment)
                removeIntemAndPaymentEvent()
                document.querySelectorAll(".add-btn").forEach(e => {
                    e.addEventListener("click", new formActions().addItem)
                })
            }
        } else {
            const getAll = await fetch("/api/planilhas/products", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const json = await getAll.json()
            const produtos = json.produtos
            const filtredDoc = produtos.find(produto => produto.codigo == inputs.productInput.value)
            if (!filtredDoc) { return }
            itensQuantity += 1
            priceTotal += parseInt(filtredDoc.preço)
            document.getElementById("quantity").innerHTML = `Quantidade de Itens: ${itensQuantity.toString()}`
            document.getElementById("total").innerHTML = `Preço total: R$${priceTotal}.00`
            const ms = (Math.floor((Math.random()*1000)*(Math.random()*1000)-(Math.random()*1000))).toString()
            selectedProducts.push({ ...filtredDoc, quantidade: 1, ms: ms })
            let data = resultsHtml[0]
            selectedProducts.forEach(product => {
                data += `<tr class="result-table-body">
                            <td>${product.codigo}</td>
                            <td>${product.nome}</td>
                            <td>${product.preço}</td>
                            <td ><button value="${product.ms}" class="red">X</button></td>
                        </tr>`
            })
            let newTotalValueWithPaments = priceTotal
            if (addedPayments.length > 0) {
                data += resultsHtml[1]
                addedPayments.forEach(payment => {
                    data +=
                        `<tr class="result-table-body">
                            <td>${payment.valor}</td>
                            <td>${payment.metodo}</td>
                            <td > <button value="${payment.codigo}" class="rm-payment-btn">X</button></td>
                        </tr>`
                    newTotalValueWithPaments = parseInt(newTotalValueWithPaments) - parseInt(payment.valor)
                })
            }
            removeIntemAndPaymentEvent()
            document.getElementById("selected-itens").innerHTML = data
            document.getElementById("total").innerHTML = `Preço total: R$${newTotalValueWithPaments}.00`
            inputs.productInput.value = ""
            inputs.productInput.focus()
        }
        removeIntemAndPaymentEvent()
        
    }
    async addItem() {
        const getAll = await fetch("/api/planilhas/products", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await getAll.json()
        const produtos = json.produtos
        const filtredDoc = produtos.find(produto => produto.codigo == this.value)
        if (!filtredDoc) { return }
        itensQuantity += 1
        priceTotal += parseInt(filtredDoc.preço)
        document.getElementById("quantity").innerHTML = `Quantidade de Itens: ${itensQuantity.toString()}`
        document.getElementById("total").innerHTML = `Preço total: R$${priceTotal}.00`
        const ms = (Math.floor((Math.random()*1000)*(Math.random()*1000)-(Math.random()*1000))).toString()
        selectedProducts.push({ ...filtredDoc, quantidade: 1, ms: ms })
        let data = resultsHtml[0]
        selectedProducts.forEach(product => {
            data +=`<tr class="result-table-body">
                        <td>${product.codigo}</td>
                        <td>${product.nome}</td>
                        <td>${product.preço}</td>
                        <td ><button value="${product.ms}" class="red">X</button></td>
                    </tr>`
        })
        let newTotalValueWithPaments = priceTotal
        if (addedPayments.length > 0) {
            data += resultsHtml[1]
            addedPayments.forEach(payment => {
                data +=`<tr class="result-table-body">
                            <td>${payment.valor}</td>
                            <td>${payment.metodo}</td>
                            <td > <button value="${payment.codigo}" class="rm-payment-btn">X</button></td>
                        </tr>`
                newTotalValueWithPaments = parseInt(newTotalValueWithPaments) - parseInt(payment.valor)
            })
        }
        document.getElementById("selected-itens").innerHTML = data
        document.getElementById("total").innerHTML = `Preço total: R$${newTotalValueWithPaments}.00`
        removeIntemAndPaymentEvent()
        document.getElementById("results").style.display = "none"
        actionKeys.searchMode.value = "codigo"
        inputs.productInput.value = ""
        inputs.productInput.focus()
    }

    async addPayment(e) {
        e.preventDefault()
        if (document.getElementById("payment").value === "") {
            alert("O VALOR não foi informado!")
            return
        }
        if (document.getElementById("payment-method").value === "") {
            alert("Selecione o Metodo de Pagamento")
            return
        }
        addedPayments.push({
            valor: document.getElementById("payment").value,
            metodo: document.getElementById("payment-method").value,
            codigo: (Math.floor((Math.random()*1000)*(Math.random()*1000)-(Math.random()*1000))).toString()
        })
        const ms = (Math.floor((Math.random()*1000)*(Math.random()*1000)-(Math.random()*1000))).toString()
        let data = resultsHtml[0]
        selectedProducts.forEach(product => {
            data += `<tr class="result-table-body">
                        <td>${product.codigo}</td>
                        <td>${product.nome}</td>
                        <td>${product.preço}</td>
                        <td ><button value="${product.ms}" class="red">X</button></td>
                    </tr>`
        })
        let newTotalValueWithPaments = priceTotal
        data += resultsHtml[1]
        addedPayments.forEach(payment => {
            data += `<tr class="result-table-body">
                        <td>${payment.valor}</td>
                        <td>${payment.metodo}</td>
                        <td > <button value="${payment.codigo}" class="rm-payment-btn">X</button></td>
                    </tr>`
            newTotalValueWithPaments = parseInt(newTotalValueWithPaments) - parseInt(payment.valor)
        })
        document.getElementById("selected-itens").innerHTML = data
        document.getElementById("total").innerHTML = `Valor Total: R$ ${newTotalValueWithPaments}.00`
        // fazer verificação do botão
        if (parseInt(newTotalValueWithPaments) <= 0) {
            document.getElementById("fn-btn-id").classList.remove("red")
            document.getElementById("fn-btn-id").removeAttribute('disabled')
        }
        else {
            document.getElementById("fn-btn-id").classList.add("red")
            document.getElementById("fn-btn-id").setAttribute('disabled', '')
        }
        removeIntemAndPaymentEvent()
    }

    async removeItem() {
        const newSelectedProduct = selectedProducts.filter(product => product.ms != this.value)
        selectedProducts = newSelectedProduct
        const ms = (Math.floor((Math.random()*1000)*(Math.random()*1000)-(Math.random()*1000))).toString()
        let data = resultsHtml[0]
        selectedProducts.forEach(product => {
            data += `<tr class="result-table-body">
                        <td>${product.codigo}</td>
                        <td>${product.nome}</td>
                        <td>${product.preço}</td>
                        <td ><button value="${product.ms}" class="red">X</button></td>
                    </tr>`
        })
        if(addedPayments.length > 0){
            data += resultsHtml[1]
        addedPayments.forEach(payment => {
            data += `<tr class="result-table-body">
                        <td>${payment.valor}</td>
                        <td>${payment.metodo}</td>
                        <td > <button value="${payment.codigo}" class="rm-payment-btn">X</button></td>
                    </tr>`
        })}
        itensQuantity = 0
        priceTotal = 0
        selectedProducts.forEach(product => {
            itensQuantity += parseInt(product.quantidade)
            priceTotal += product.quantidade * product.preço
        })
        document.getElementById("quantity").innerHTML = `Quantidade de Itens: ${itensQuantity.toString()}`
        document.getElementById("total").innerHTML = `Preço total: R$${priceTotal}.00`
        document.getElementById("selected-itens").innerHTML = data
        removeIntemAndPaymentEvent()
    }

    async removePayment() {
        const newPayments = addedPayments.filter(payment => payment.codigo.toString() !== this.value.toString())
        addedPayments = addedPayments.length > 1 ? newPayments : []
        const ms = (Math.floor((Math.random()*1000)*(Math.random()*1000)-(Math.random()*1000))).toString()
        let data = resultsHtml[0]
        selectedProducts.forEach(product => {
            data += `<tr class="result-table-body">
                        <td>${product.codigo}</td>
                        <td>${product.nome}</td>
                        <td>${product.preço}</td>
                        <td ><button value="${product.ms}" class="red">X</button></td>
                    </tr>`
        })
        let newTotalValueWithPaments = priceTotal
        if (addedPayments.length > 0) {
            data += resultsHtml[1]
            addedPayments.forEach(payment => {
                data += `<tr class="result-table-body">
                          <td>${payment.valor}</td>
                          <td>${payment.metodo}</td>
                          <td > <button value="${payment.codigo}" class="rm-payment-btn red">X</button></td>
                        </tr>`
                newTotalValueWithPaments = parseInt(newTotalValueWithPaments) - parseInt(payment.valor)
            })
        }
        itensQuantity = 0
        priceTotal = 0
        selectedProducts.forEach(product => {
            itensQuantity += parseInt(product.quantidade)
            priceTotal += product.quantidade * product.preço
        })
        document.getElementById("quantity").innerHTML = `Quantidade de Itens: ${itensQuantity.toString()}`
        document.getElementById("total").innerHTML = `Valor Total: R$ ${newTotalValueWithPaments}.00`
        document.getElementById("selected-itens").innerHTML = data
        removeIntemAndPaymentEvent()
    }

    async sendCoupon(e) {
        let usedMetodos = [...new Set(addedPayments.map(payment => { return payment.metodo }))]
        let paymentsValues = addedPayments.map(payment => { return payment.valor })
        let metodo1
        let metodo2
        let valor1
        let valor2
        if (usedMetodos.length > 1) {
            metodo1 = usedMetodos[0]
            metodo2 = usedMetodos[1]
            valor1 = paymentsValues[0]
            valor2 = paymentsValues[1]
        }
        else {
            metodo1 = usedMetodos[0]
            valor1 = paymentsValues[0]
        }
        e.preventDefault()
        const sendData = {
            produtos: selectedProducts,
            cliente: document.getElementById("client").value,
            metodo1: metodo1, // peagr totos os metodods da array d epayment
            valor1: parseFloat(valor1),
            metodo2: metodo2, // peagr totos os metodods da array d epayment
            valor2: parseFloat(valor2),
            valorTotal: parseFloat(priceTotal),
            data: new Date().toLocaleDateString("pt-BR"),
            hora: new Date().getHours(),
            minutos: new Date().getMinutes(),
            segundos: new Date().getSeconds(),
            loja: sessionStorage.getItem("userLoja"),
            cupom: cupomNumber,
        }
        if (sendData.cliente === "" || sendData.valor1 === "") {
            alert("Preencha Todos dos Campos")
            return
        }
        if (sendData.metodo1 === "") {
            alert("Selecione o Metodo de Pagamento")
            return
        }
        try {
            const newCupon = {
                cupom: sendData.cupom,
                data: sendData.data + " " + sendData.hora + ":" + sendData.minutos + ":" + sendData.segundos,
                valorTotal: sendData.valorTotal,
                metodo1: sendData.metodo1,
                valor1: sendData.valor1,
                metodo2: sendData.metodo2,
                valor2: sendData.valor2,
                loja: sendData.loja,
                cliente: sendData.cliente,
            }
            const sendCuponResult = await fetch("/api/planilhas/addcupon", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newCupon: newCupon })
            })

            const vendasArray = []
            sendData.produtos.forEach(async produto => {
                const newVenda = {
                    codigo: produto.codigo,
                    data: sendData.data + " " + sendData.hora + ":" + sendData.minutos + ":" + sendData.segundos,
                    cupom: sendData.cupom,
                    cliente: sendData.cliente,
                }
                vendasArray.push(newVenda)
            })
            const sendVendaResult = await fetch("/api/planilhas/addvenda", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newVendas: vendasArray })
            })
            if (sendVendaResult instanceof Error) {
                alert("Houve um erro ao salvar a Venda")
                return
            }
            if (sendCuponResult instanceof Error) {
                alert("Houve um erro ao salvar o Cupon")
            }
            alert("Pagamento finalizado com SUCESSO!")
            window.location.reload()
        } catch (err) {
            alert("Houve um erro: " + err)
        }
    }
}

const actionKeys = {
    searchMode: document.getElementById("search-mode"),
    sendBtn: document.getElementById("fn-btn-id"),
    addPaymentBtn: document.getElementById("add-payment")
}

const inputs = {
    form: document.getElementById('form'),
    productInput: document.getElementById("product"),
    paymentInput: document.getElementById("payment")
}

//event listners
function removeIntemAndPaymentEvent(){
    document.querySelectorAll(".rm-payment-btn").forEach(e => {
        e.addEventListener("click", new formActions().removePayment)
    })
    document.querySelectorAll(".red").forEach(e => {
        e.addEventListener("click", new formActions().removeItem)
    })
}

actionKeys.searchMode.addEventListener("change", () => { inputs.productInput.value = "" })
actionKeys.sendBtn.addEventListener("click", new formActions().sendCoupon)
actionKeys.addPaymentBtn.addEventListener("click", new formActions().addPayment)
inputs.productInput.addEventListener("input", new formActions().searchSwitch) // search product input
const resultsHtml = [
    `<tr class="result-table-head" >
        <th width="100">Codigo</th>
        <th width="100">Descrição</th>
        <th width="100">Preço</th>
        <th width="100">Excluir</th>
    </tr>`,
    `<tr class="result-table-head" >
            <th width="350">Valor pago</th>
            <th width="350">Metodo</th>
            <th width="350">Ações</th>
    </tr> `
    
]
