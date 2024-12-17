# Manejo Tablas
Script para crear tablas facilmente, con paginacion y busquedas por columnas.

## Modo de uso
Para poder crear una tabla necesitarás la clase `ManejoTabla` que se encuentra en el archivo `ManejoTabla.js`.

Utilizando esta clase puedes hacer tu tabla creando una instancia de la clase con las siguientes propiedades:
- **idContenedorTabla**: El id del contenedor donde se va a insertar la tabla.
- **datos**: Un arreglo de objetos con los datos que se van a mostrar en la tabla.
> Estas son las dos propiedades obligatorias, con ellas bastará para crear una tabla con paginación y busqueda por columnas.

### Ejemplo
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/index.css">
    <link rel="stylesheet" href="/ManejoTabla.css"> <!-- Estilos que puedes utilizar para la tabla. Estos se aplican a la clase "contenedorTabla" de este ejemplo. -->
    <title>Ejemplo de Manejo Tabla</title>
</head>
<body>
    <main class="contenido">
        <header>
            <h1>Manejo de Tabla</h1>
            <p>Estos son ejemplos de manejo de tabla con "ManejoTabla".</p>
        </header>
        <section class="contenedorTabla" id="tabla"> <!-- Aquí se insertará la tabla. -->
        </section>
    </main>
    <script src="./ManejoTabla.js"></script> <!-- Acá se agregará el script de ManejoTabla para tener acceso a la clase. -->
    <script>
    const datos = [
        {
            "id": 1,
            "Año de publicación": 1974,
            "Título": "Carrie",
            "Páginas": 199,
        },
        {
            "id": 2,
            "Año de publicación": 1975,
            "Título": "Salem's Lot",
            "Páginas": 439,
        },
        {
            "id": 3,
            "Año de publicación": 1977,
            "Título": "The Shining",
            "Páginas": 447,
        },
        {
            "id": 4,
            "Año de publicación": 1977,
            "Título": "Rage",
            "Páginas": 211,
        },
        {
            "id": 5,
            "Año de publicación": 1978,
            "Título": "The Stand",
            "Páginas": 823,
        }
    ];

    const tabla = new ManejoTabla({
        idContenedorTabla: 'tabla', // El id del contenedor donde se va a insertar la tabla
        datos // Un arreglo de objetos con los datos que se van a mostrar en la tabla
    });
    </script>
</body>
</html>
```
Con este código es sufienciente para crear una tabla con paginación y busqueda por columnas. 
### Consideraciones
1. Los datos en la tabla se muestran en el orden en que se encuentran en el arreglo.
2. Los nombres de las columnas en la tabla se toman de las llaves de los objetos en el arreglo.
3. Se muestran todos los campos de los objetos en el arreglo.
4. Valores por defecto:
    - **Paginación**: 5 filas por página.
    - **Busqueda**: el selector de busqueda por columnas toma el valor de la propiedad de los objetos en el arreglo.
    - **Acciones**: No se muestran acciones por defecto.
