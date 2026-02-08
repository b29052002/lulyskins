window.CONFIG = null;

window.loadConfig = async function () {
    try {
        const response = await fetch('/.netlify/functions/config');
        const data = await response.json();
        window.CONFIG = data;
        console.log("Config carregado:", data);
    } catch (error) {
        console.error("Erro ao carregar config:", error);
    }
};
