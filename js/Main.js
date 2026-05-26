// ============================================================
// Main.js
// Punto de entrada del juego.
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {

    // ============================================================
    // TUTORIAL: se muestra solo la primera vez que se entra a la página.
    // Se marca en localStorage para no volver a mostrarlo.
    // ============================================================
    const tutorialVisto = localStorage.getItem("tutorialVisto");

    if (!tutorialVisto) {
        // Marca que el tutorial ya se ha visto ANTES de mostrarlo,
        // para que aunque se recargue a mitad no vuelva a salir.
        localStorage.setItem("tutorialVisto", "true");

        await Swal.fire({
            title: "Bienvenido a Tu Granja Feliz",
            html: `
                <div style="text-align:left; font-size:0.95rem; line-height:1.7;">
                    <p><strong>¿Cómo jugar?</strong></p>
                    <ol style="padding-left:1.2rem;">
                        <li>Pulsa <strong>Recargar Semillas</strong> para añadir semillas a tu inventario.</li>
                        <li>Haz <strong>clic en una semilla</strong> del inventario para seleccionarla.</li>
                        <li>Haz <strong>clic en un macetero vacío</strong> para plantarla.<br>
                            Hay un 20% de probabilidad de que la semilla no prenda.</li>
                        <li>Espera unos ciclos a que madure y vuelve a hacer clic para <strong>cosecharla</strong>.</li>
                        <li><strong>Clic derecho</strong> sobre un cultivo para eliminarlo.</li>
                        <li>Ve a la <strong>Tienda</strong> para comprar semillas, mejorar o reparar herramientas.</li>
                        <li>¡Gana <strong>500 monedas</strong> vendiendo cultivos para desbloquear un logro!</li>
                    </ol>
                    <p style="margin-top:0.8rem; color:#f5c518;">
                        ⚒ La hoz se puede romper al cosechar. Si se rompe, repárala en la Tienda.
                    </p>
                </div>
            `,
            icon: "info",
            confirmButtonText: "¡Empezar a jugar!",
            background: "#1a2a10",
            color: "#f5c518",
            confirmButtonColor: "#4a7c2f",
            width: "600px"
        });
    }

    // Crea la instancia del gestor de XML
    const datosXML = new DatosXML();

    try {
        await datosXML.cargarXML();
        console.log("datos.xml cargado correctamente.");

    } catch (error) {
        console.error("Error al cargar datos.xml:", error);

        Swal.fire({
            title: "Error al cargar datos",
            text: "No se pudo cargar el archivo datos.xml. Comprueba que el servidor esté activo.",
            icon: "error",
            confirmButtonText: "Ok",
            background: "#1a2a10",
            color: "#f5c518"
        });

        return;
    }

    window._datosXML = datosXML;
    new Menu(datosXML);

});