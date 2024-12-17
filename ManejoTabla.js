class ManejoTabla {
    /*
        INFORMACION PARA EL USO DE LA CLASE
        * datos: Array de objetos JSON con los datos a mostrar en la tabla
        * idContenedorTabla: String con el id del contenedor de la tabla
        * paginacion: Número de filas por página
        * acciones: Booleano para mostrar o no las acciones
        * html: String con el html de las acciones
        * IMPORTANTE: en el html de las acciones se debe poner el campo a reemplazar entre [[campo]] y el campo debe ser el mismo que el nombre del
        * campo en el JSON, es decir, la clave del objeto JSON
        * IMPORTANTE X2: si se quiere evaluar una expresión en el html de las acciones se debe poner la expresión entre ${} PERO SE DEBE ESCAPAR EL $ CON UNA \ ANTES
        * DE ESTE, es decir, \$, ya que si no se escapa el $ la expresión será evaluada cuando creas la instancia de la clase y no cuando se vaya a mostrar
        * el html de las acciones, lo que puede provocar que te de un error de variable no definida
        * ocultarCampos: Array de strings con los nombres de los campos que se quieren ocultar
        * RECOMENDABLE NO USAR EL MÉTODO map PARA DIRECTAMENTE ELIMINAR los campos que no se quieren mostrar, ya que si se hace esto y en el html
        * de las acciones se usa un campo que se eliminó, se mostrará un error de variable no definida
        * 
        * IMPORTANTE X2: 
        * Para que funcione correctamente el uso de esta clase la estructura del htm de la tabla debe ser la siguiente:
        * 1. <div id="idContenedorTabla"></div> -> Contenedor de la tabla, el elemento padre que envolverá todo: el formulario
        * para la búsqueda, la tabla y el footer para la paginación
        * 2. <form> -> Formulario para la búsqueda que contendrá los elementos:
        * 2.1 <div> -> 
        *       2.1.1 <select> -> con un select con el id "filtro" que es donde se listarán los campos por los que se buscará
        *       2.1.2 <input> -> con un input con el id "buscar" que es donde se escribirá el texto a buscar
        *      2.1.3 <button> -> con un button que es el botón de búsqueda
        * 2.2 <div> ->
        *      2.2.1 <select> -> con un select con el id "mostrar" que es donde se seleccionará el número de filas por página
        * 3. <table> -> Tabla que contendrá los datos
        * 4. <thead> -> Cabecera de la tabla
        * 5. <tr> -> Fila de la cabecera
        * 6. <tbody> -> Cuerpo de la tabla
        * 7. <footer> -> Pie de la tabla, aquí irá la paginación, en este elemento se debe poner dos divs hijos, el primero
        * debe contener los botones de paginación con las clases btnPrimero, btnAnterior, btnSiguiente y btnUltimo y el segundo div
        * contendrá la información de la paginación (este div puede estar vacío)
        * 
        * AUTOR: ALDO 0303
        * FECHA DE LANZAMIENTO: 22/05/2024
        * VERSIÓN: 1.3
    */
    constructor({ datos = [], idContenedorTabla = '', paginacion = 5, acciones = false, tituloColAcciones = [], html = '', ocultarCampos = [], ordenColumnas = [], pdf = false, funcionPdf = null, parametrosPdf = []}) {
        this.datos = (typeof datos === 'string') ? JSON.parse(datos) : datos;
         ordenColumnas.length > 0 ? this.datos = this.datos.map(dato => {
            let newDato = {};
            ordenColumnas.forEach(col => {
                newDato[col] = dato[col];
            });
            return newDato;
        }) : null;
        this.contenedorTabla = document.getElementById(idContenedorTabla);
        if (!this.contenedorTabla) {
            console.error('No se encontró el contenedor de la tabla');
            return;
        }
        this.cuerpoTabla = this.contenedorTabla.querySelector('table').querySelector('tbody');
        this.formBusqueda = this.contenedorTabla.querySelector('form');
        if (pdf) {
            const btnPdf = document.createElement('button');
            btnPdf.textContent = 'PDF';
            btnPdf.classList.add('btn', 'btn-primary');
            this.formBusqueda.insertAdjacentElement('afterbegin', btnPdf);
            btnPdf.addEventListener('click', () => funcionPdf(...parametrosPdf));
        }
        this.idTimeout = null;
        this.buscar = this.buscar.bind(this);
        this.infoPaginacion = this.contenedorTabla.querySelector('footer').querySelectorAll('div')[1]
        this.btnsPaginacion = this.contenedorTabla.querySelector('footer').querySelectorAll('div')[0]
        this.btnsPaginacion.querySelector('button.btnPrimero').addEventListener('click', () => this.paginar('primera'));
        this.btnsPaginacion.querySelector('button.btnAnterior').addEventListener('click', () => this.paginar('anterior'));
        this.btnsPaginacion.querySelector('button.btnSiguiente').addEventListener('click', () => this.paginar('siguiente'));
        this.btnsPaginacion.querySelector('button.btnUltimo').addEventListener('click', () => this.paginar('ultima'));
        this.paginacion = paginacion;
        this.paginaActual = 1;
        this.totalPaginas = Math.ceil(this.datos.length / this.paginacion);
        this.datosViendo = this.datos
        this.acciones = acciones; this.html = html; this.ocultarCampos = ocultarCampos; this.tituloColAcciones = tituloColAcciones;
        if (this.datos.length === 0) {
            console.error('No hay datos');
            this.sinDatos(); this.mostarinfoPaginacion();
            return;
        }
        this.formBusqueda.addEventListener('submit', this.buscar);
        this.formBusqueda.querySelector('#filtro').innerHTML = Object.keys(this.datos[0]).map(key => {
            if (this.ocultarCampos.includes(key)) return '';
            return `<option value="${key}">${key.toUpperCase()}</option>`
        }).join('');
        this.formBusqueda.querySelector('#buscar').addEventListener('keyup', this.buscar);
        this.formBusqueda.querySelector('#mostrar').value = this.paginacion; this.formBusqueda.querySelector('#mostrar').addEventListener('change', e => {
            this.paginacion = parseInt(e.target.value);
            this.totalPaginas = Math.ceil(this.datosViendo.length / this.paginacion);
            this.paginaActual = 1;
            this.mostrarDatosViendo();
        });
        this.dibujarTabla();
    }

    dibujarTabla() {
        const tabla = this.contenedorTabla.querySelector('table');
        tabla.querySelector('thead').querySelector('tr').innerHTML = Object.keys(this.datos[0]).map(key => {
            if (this.ocultarCampos.includes(key)) return '';
            return `<th>${key.toUpperCase()}</th>`
        }).join('') + (this.acciones ? this.tituloColAcciones.map(titulo => `<th>${titulo}</th>`).join('') : '');
        if (this.datosViendo.length === 0) {
            this.sinDatos(); this.mostarinfoPaginacion(); return;
        }
        this.mostrarDatosViendo();
    }

    paginar(pagina) {
        switch (pagina) {
            case 'primera':
                if (this.paginaActual === 1) return;
                this.paginaActual = 1;
                break;
            case 'anterior':
                if (this.paginaActual === 1) return;
                this.paginaActual--;
                break;
            case 'siguiente':
                if (this.paginaActual === this.totalPaginas) return;
                this.paginaActual++;
                break;
            case 'ultima':
                if (this.paginaActual === this.totalPaginas) return;
                this.paginaActual = this.totalPaginas;
                break;
            default:
                return;
        }
        this.mostrarDatosViendo();
    }

    mostrarDatosViendo() {
        const inicio = (this.paginaActual - 1) * this.paginacion;
        const fin = inicio + this.paginacion;
        let rpaginaActual = this.datosViendo.slice(inicio, fin);
        if (this.datosViendo.length === 0) {
            this.sinDatos(); this.mostarinfoPaginacion(); return;
        }
        let htmlInsertar = ''
        rpaginaActual.forEach(dato => {
            htmlInsertar += `<tr>${Object.entries(dato).map((valor, i, arr) => {
                let valo1 = !valor[1] ? '' : valor[1];
                if (this.acciones && i === arr.length - 1) {
                    let variablesSustituidas = '';
                    if (!this.ocultarCampos.includes(valor[0])) variablesSustituidas = `<td>${valo1}</td>`;
                    // para insertar el html de las acciones sustituyendo las variables que estén
                    // dentro de un [[ ]] por su respectivo valor
                    const regexVariables = /\[\[(.*?)\]\]/g;
                    let coincidencias = [], match;
                    while ((match = regexVariables.exec(this.html)) !== null) coincidencias.push(match[1]);
                    if (coincidencias.length > 0) {
                        let columna = this.html;
                        coincidencias.forEach(campo => {
                            const rgex = new RegExp(`\\[\\[${campo}\\]\\]`, 'g');
                            columna = columna.replace(rgex, dato[campo]);
                        });
                        variablesSustituidas += `${columna}`
                    } else variablesSustituidas += `${this.html}`
                    // para evaluar aquellas expresiones que estén dentro de ${} que están escapadas
                    // en el html de las acciones con un \ antes del $. Si estás expresiones usaban variables
                    // estás ya han sido sustituidas por su valor
                    const regexEvaluar = /\${(.*?)}/g;
                    let coincidenciasEvaluar = [], matchEvaluar;
                    while ((matchEvaluar = regexEvaluar.exec(variablesSustituidas)) !== null) coincidenciasEvaluar.push(matchEvaluar[1]);
                    if (coincidenciasEvaluar.length > 0) {
                        coincidenciasEvaluar.forEach(campo => {
                            variablesSustituidas = variablesSustituidas.replace(`\${${campo}}`, eval(campo));
                        });
                    }
                    return variablesSustituidas;
                } else {
                    if (this.ocultarCampos.includes(valor[0])) return '';
                    return `<td>${valo1}</td>`
                }
            }).join('')}</tr>`;
        });
        this.cuerpoTabla.innerHTML = htmlInsertar;
        this.mostarinfoPaginacion();
        if (this.datosViendo.length <= this.paginacion) this.cambiarDesabilitadoBtns(true);
        else this.cambiarDesabilitadoBtns(false);
    }

    buscar(e) {
        if (e.type === 'submit') {
            e.preventDefault();
            const valor = e.target.querySelector('#buscar').value; 
            if (valor !== '') {
                const key = e.target.querySelector('#filtro').value;
                this.datosViendo = this.datos.filter(dato => (!dato[key] ? '' : dato[key]).toLowerCase().includes(valor.toLowerCase()));
                this.paginaActual = 1; this.totalPaginas = Math.ceil(this.datosViendo.length / this.paginacion);
            } else {
                this.datosViendo = this.datos;
                this.paginaActual = 1; this.totalPaginas = Math.ceil(this.datosViendo.length / this.paginacion);
            }
            this.mostrarDatosViendo();
        } else {
            clearTimeout(this.idTimeout);
            this.idTimeout = setTimeout(() => {
                this.formBusqueda.dispatchEvent(new Event('submit'));
            }, 500);
        }

    }

    sinDatos() {
        this.cuerpoTabla.innerHTML = '<tr><td colspan="100%">No hay datos</td></tr>';
        this.cambiarDesabilitadoBtns(true);
    }

    mostarinfoPaginacion() {
        this.infoPaginacion.innerHTML = `Página ${this.paginaActual} de ${this.totalPaginas}`;
    }

    cambiarDesabilitadoBtns(estado) {
        this.btnsPaginacion.querySelector('button.btnPrimero').disabled = estado;
        this.btnsPaginacion.querySelector('button.btnAnterior').disabled = estado;
        this.btnsPaginacion.querySelector('button.btnSiguiente').disabled = estado;
        this.btnsPaginacion.querySelector('button.btnUltimo').disabled = estado;
    }
}