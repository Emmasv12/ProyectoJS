// ============================================================
// Semilla.js
// Clase que representa un tipo de semilla disponible en el juego.
// Actúa como modelo de datos: solo almacena propiedades sin lógica propia.
//
// CAMBIO FASE 2 — INTEGRACIÓN XML:
//   Se añaden dos campos nuevos que antes no existían porque los datos
//   estaban hardcodeados en Juego.js:
//     · precioCompra → para mostrar el precio en la tienda (viene del XML)
//     · tipo         → categoría (hortaliza/fruta/cereal/especial),
//                      usada por los filtros XPath de la tienda
// ============================================================
class Semilla {

    /**
     * @param {string} nombre            - Nombre del cultivo (Tomate, Maiz, etc.)
     * @param {number} tiempoMaduracion  - Ciclos que tarda en madurar
     * @param {number} precioVenta       - Dinero obtenido al cosechar
     * @param {string} imgSemilla        - Ruta imagen fase semilla
     * @param {string} imgCreciendo      - Ruta imagen fase creciendo
     * @param {string} imgMaduro         - Ruta imagen fase madura
     * @param {number} [precioCompra=0]  - Precio para comprar en la tienda (del XML)
     * @param {string} [tipo=""]         - Categoría de la semilla (del XML)
     */
    constructor(nombre, tiempoMaduracion, precioVenta,
                imgSemilla, imgCreciendo, imgMaduro,
                precioCompra = 0, tipo = "") {

        this.nombre           = nombre;
        this.tiempoMaduracion = tiempoMaduracion;
        this.precioVenta      = precioVenta;
        this.imgSemilla       = imgSemilla;
        this.imgCreciendo     = imgCreciendo;
        this.imgMaduro        = imgMaduro;

        // NUEVOS campos — alimentados desde datos.xml vía DatosXML.js
        this.precioCompra = precioCompra; // coste de compra en la tienda
        this.tipo         = tipo;         // categoría para filtros XPath
    }
}