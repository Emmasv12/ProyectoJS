// clase que representa una herramienta del granjero (azada, regadera, hoz)
// por ahora solo almacena nombre y nivel, sin logica de uso implementada
class Herramienta {

    // nivel tiene valor por defecto 1 si no se especifica
    constructor(nombre, nivel = 1) {
        this.nombre = nombre;
        this.nivel = nivel;
    }

}