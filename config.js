window.CONFIG_PROMISE = fetch('/.netlify/functions/config')
    .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar config");
        return res.json();
    })
    .then(data => {
        window.CONFIG = data;
        console.log("CONFIG carregado:", data);
        return data;
    })
    .catch(err => {
        console.error("Falha ao carregar config:", err);
        window.CONFIG = {};
    });
