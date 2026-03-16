class Granjero {

    constructor(nombre) {

        this.nombre = nombre;
        this.dinero = 100;
        this.energia = 100;
        this.inventario = [];

        this.herramientas = {
            azada: new Herramienta("Azada"),
            regadera: new Herramienta("Regadera"),
            hoz: new Herramienta("Hoz")
        };

    }

    agregarSemilla(semilla) {
        this.inventario.push(semilla);
    }

    vender(cultivo) {
        this.dinero += cultivo.precioVenta;
    }

}