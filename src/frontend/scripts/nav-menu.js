
document.getElementById("logout-btn-id").addEventListener("click", () => {
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("userLoja")
    window.location.replace("/")
})