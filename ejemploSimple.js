let datos = [];
fetch('https://stephen-king-api.onrender.com/api/books').then(res => res.json()).then(rsp => {
    datos = rsp.data.map(u => {
        return {
            id: u.id,
            titulo: u.Title,
            "año de publicación": u.Year,
            "páginas": u.Pages
        }
    });
}).catch(err => console.error(err)).finally(() => {
    new ManejoTabla({
        datos,
        idContenedorTabla: 'tabla',
    });
});