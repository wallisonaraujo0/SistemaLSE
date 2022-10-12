export const verifyToken = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
        alert("Acesso Negado!")
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("userLoja")
        window.location.replace("/")
        return
    }
    const validToken = await fetch("/api/verify", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({token})
    })
    const validTokenJson = await validToken.json()
    if (!validTokenJson.token) {
        alert("Token de sessão invalido")
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("userLoja")
        window.location.replace("/")
    }
    setInterval(async () => {
        const token = sessionStorage.getItem("token")
        if (!token) {
            alert("Acesso Negado!")
            sessionStorage.removeItem("token")
            sessionStorage.removeItem("userLoja")
            window.location.replace("/")
            return
        }
        const validToken = await fetch("/api/verify", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token})
        })
        const validTokenJson = await validToken.json()
        if (!validTokenJson.token) {
            alert("Token de sessão invalido")
            sessionStorage.removeItem("token")
            sessionStorage.removeItem("userLoja")
            window.location.replace("/")
        }
    }, 30000);
 }