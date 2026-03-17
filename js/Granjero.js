// clase que representa al jugador dentro del juego
class Granjero {

    constructor(nombre) {

        this.nombre = nombre;
        this.dinero = 100;    // dinero inicial del jugador
        this.energia = 100;   // energia del jugador (declarada pero sin uso actualmente)
        this.inventario = []; // lista de semillas que lleva el granjero

        // herramientas disponibles, de momento no afectan a la logica del juego
        this.herramientas = {
            azada: new Herramienta("Azada"),
            regadera: new Herramienta("Regadera"),
            hoz: new Herramienta("Hoz")
        };

    }

    // agrega una semilla al inventario del granjero
    agregarSemilla(semilla) {
        this.inventario.push(semilla);
    }

    // suma el precio de venta del cultivo al dinero del granjero
    vender(cultivo) {
        this.dinero += cultivo.precioVenta;
    }
}