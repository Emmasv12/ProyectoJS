// ============================================================
// Semilla.js
// Clase que representa un tipo de semilla disponible en el juego.
// Actúa como modelo de datos: solo almacena propiedades sin lógica propia.
// ============================================================
class Semilla {

    /**
     * @param {string} nombre          - Nombre del cultivo (Tomate, Maiz, etc.)
     * @param {number} tiempoMaduracion - Ciclos que tarda en madurar
     * @param {number} precioVenta      - Dinero obtenido al cosechar
     * @param {string} imgSemilla       - Ruta imagen fase semilla
     * @param {string} imgCreciendo     - Ruta imagen fase creciendo
     * @param {string} imgMaduro        - Ruta imagen fase madura
     */
    constructor(nombre, tiempoMaduracion, precioVenta, imgSemilla, imgCreciendo, imgMaduro) {
        this.nombre          = nombre;
        this.tiempoMaduracion = tiempoMaduracion;
        this.precioVenta     = precioVenta;
        this.imgSemilla      = imgSemilla;
        this.imgCreciendo    = imgCreciendo;
        this.imgMaduro       = imgMaduro;
    }
}