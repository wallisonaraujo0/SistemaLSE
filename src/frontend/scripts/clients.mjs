import { verifyToken } from "./verifyToken.mjs"
verifyToken()
function formatDate(input) {
    var datePart = input.match(/\d+/g),
        year = datePart[0], // .substring(2) get only two digits
        month = datePart[1],
        day = datePart[2];
    return day + '/' + month + '/' + year;
}
class usersActions {
    constructor() {
        this.searchInput = document.getElementById("user-search")
        this.showResults = document.getElementById("clients-results")
        this.tableResultsHeader = `
        <tr class="results-table-head">
                <th width="100">Nome</th>
                <th width="100">Telefone</th>
                <th width="100">instagram</th>
                <th width="100">Loja Cadastrada</th>
                <th width="100">Data Nascimento</th>
        </tr>`
    }
    async getAllClients() {
        const response = await fetch("/api/clients")
        const allClients = await response.json()
        return allClients.clients
    }
    async searchClient(name) {
        const allClients = await this.getAllClients()
        const clients = allClients.filter(client => client.nome.toLowerCase().includes(name.toLowerCase()))
        if (clients.length >= 1) {
            this.setClientsResults(clients)
        } else {
            this.setClientsResults(allClients)
        }
    }
    setClientsResults(clients) {
        this.showResults.innerHTML = this.tableResultsHeader
        clients.forEach(client => {
            this.showResults.innerHTML +=`
           <tr class="results-table-body">
           <td width="100">${client.nome}</td>
           <td width="100">${client.telefone}</td>
           <td width="100">${client.instagram}</td>
           <td width="100">${client.loja}</td>
           <td width="100">${client.data}</td>
       </tr>`
        });
    }
    async addClient(e) {
        e.preventDefault()
        const newClient = {
            nome: document.getElementById("nome").value,
            telefone: parseInt(document.getElementById("telefone").value),
            instagram: document.getElementById("instagram").value,
            loja: document.getElementById("loja-cadastrada").value,
            data: formatDate(document.getElementById("data-nascimento").value.replace("-", "/").replace("-", "/"))
        }
        const addRequest = await fetch("/api/clients", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newClient: newClient })
        })
        if (addRequest instanceof Error) {
            alert("Houve um erro " + addRequest)
            return
        }
        document.getElementById("nome").value = ""
        document.getElementById("telefone").value = ""
        document.getElementById("instagram").value = ""
        document.getElementById("loja-cadastrada").value = ""
        document.getElementById("data-nascimento").value = ""
        new usersActions().searchClient("")
        alert("Cliente Adicionado!")
    }
}
document.getElementById("user-search").addEventListener("input", () => { new usersActions().searchClient(document.getElementById("user-search").value) })
document.getElementById("add-btn").addEventListener("click", new usersActions().addClient)
new usersActions().searchClient(document.getElementById("user-search").value)
