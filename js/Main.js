// ============================================================
// Main.js
// Punto de entrada del juego.
// Espera a que el DOM esté completamente cargado antes de
// inicializar el sistema de menús.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    // Arranca el sistema de menús (que a su vez instanciará Juego cuando sea necesario)
    new Menu();

});