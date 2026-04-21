// ============================================================
// Main.js
// Punto de entrada del juego.
//
// CAMBIO FASE 2 — INTEGRACIÓN XML:
//   Antes solo hacía: new Menu()
//   Ahora primero carga datos.xml con DatosXML y luego arranca
//   el menú, pasándole la instancia de DatosXML para que Menu
//   y Juego puedan acceder al catálogo de semillas y herramientas.
//
// FLUJO:
//   1. DOMContentLoaded → espera a que el HTML esté listo
//   2. new DatosXML().cargarXML() → carga y parsea datos.xml (async)
//   3. new Menu(datosXML) → arranca el sistema de menús con los datos
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {

    // Crea la instancia del gestor de XML
    const datosXML = new DatosXML();

    try {
        // Carga y parsea datos.xml de forma asíncrona
        // Sin await aquí el juego arrancaría sin semillas
        await datosXML.cargarXML();
        console.log("datos.xml cargado correctamente.");

    } catch (error) {
        // Si el XML falla el juego no puede funcionar: avisa al usuario
        console.error("Error al cargar datos.xml:", error);

        Swal.fire({
            title: "Error al cargar datos",
            text: "No se pudo cargar el archivo datos.xml. Comprueba que el servidor esté activo.",
            icon: "error",
            confirmButtonText: "Ok",
            background: "#1a2a10",
            color: "#f5c518"
        });

        // Detiene la ejecución: sin XML no hay catálogo de semillas
        return;
    }

    // Expone datosXML en window para que Juego.js pueda pasárselo a Tienda
    // al pulsar el botón "Tienda" (sin necesidad de refactorizar toda la cadena)
    window._datosXML = datosXML;

    // Arranca el menú pasándole la instancia de DatosXML
    // Menu lo usará para crear el Juego con las semillas del XML
    new Menu(datosXML);

});