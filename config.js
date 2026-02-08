window.CONFIG_PROMISE = fetch('/.netlify/functions/config')
    .then(res => res.json())
    .then(data => {
        window.CONFIG = data;
        console.log("CONFIG carregado:", data);
        return data;
    })
    .catch(err => {
        console.error("Erro ao carregar config:", err);
        window.CONFIG = {};
    });
