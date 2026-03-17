// clase que representa un tipo de semilla disponible en el juego
// actua como modelo de datos, solo almacena propiedades sin logica propia
class Semilla {

    // nombre: nombre del cultivo (tomate, maiz, etc.)
    // tiempoMaduracion: cuantos ciclos tarda en madurar
    // precioVenta: dinero que se obtiene al cosechar
    // imgSemilla, imgCreciendo, imgMaduro: rutas de las imagenes para cada fase
    constructor(nombre, tiempoMaduracion, precioVenta, imgSemilla, imgCreciendo, imgMaduro) {
        this.nombre = nombre;
        this.tiempoMaduracion = tiempoMaduracion;
        this.precioVenta = precioVenta;

        this.imgSemilla = imgSemilla;
        this.imgCreciendo = imgCreciendo;
        this.imgMaduro = imgMaduro;
    }
}