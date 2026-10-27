/**
 * Datos de las películas en orden cronológico de la historia.
 *
 * Para añadir una película:
 *   1. Copia su póster en assets/images/movies/ (preferiblemente 500 × 750 px).
 *   2. Añade un objeto en la posición que ocupa dentro de la historia.
 *   3. Usa el nombre exacto del archivo en la propiedad "image".
 *
 * El campo "date" es la fecha de estreno (AAAA-MM-DD) y "minutes" la duración.
 * El orden del array es el orden de los acontecimientos, no el de estreno.
 * Si un póster no existe, la interfaz muestra un respaldo generado con CSS.
 */
window.CRONOLOGIA_MOVIES = [
    { title: "Capitán América: El primer vengador", date: "2011-07-22", minutes: 124, image: "Capitan_America_El_primer_vengador.jpeg" },
    { title: "Capitana Marvel", date: "2019-03-08", minutes: 123, image: "Capitana_Marvel.jpeg" },
    { title: "Iron Man", date: "2008-05-02", minutes: 103, image: "Iron_Man.jpeg" },
    { title: "El increíble Hulk", date: "2008-06-13", minutes: 124, image: "El_increible_Hulk.jpeg" },
    { title: "Iron Man 2", date: "2010-05-07", minutes: 124, image: "Iron_Man_2.jpeg" },
    { title: "Thor", date: "2011-05-06", minutes: 114, image: "Thor.jpeg" },
    { title: "Los Vengadores", date: "2012-05-04", minutes: 143, image: "Los_Vengadores.jpeg" },
    { title: "Thor: El mundo oscuro", date: "2013-11-08", minutes: 126, image: "Thor_El_mundo_oscuro.jpeg" },
    { title: "Iron Man 3", date: "2013-05-03", minutes: 130, image: "Iron_Man_3.jpeg" },
    { title: "Capitán América: El soldado de invierno", date: "2014-04-04", minutes: 139, image: "Capitan_America_El_soldado_de_invierno.jpeg" },
    { title: "Guardianes de la Galaxia", date: "2014-08-01", minutes: 122, image: "Guardianes_de_la_Galaxia.jpeg" },
    { title: "Guardianes de la Galaxia Vol. 2", date: "2017-05-05", minutes: 137, image: "Guardianes_de_la_Galaxia_Vol._2.jpeg" },
    { title: "Vengadores: La era de Ultrón", date: "2015-05-01", minutes: 129, image: "Vengadores_La_era_de_Ultron.jpeg" },
    { title: "Ant-Man: El hombre hormiga", date: "2015-07-17", minutes: 117, image: "Ant-Man_El_hombre_hormiga.jpeg" },
    { title: "Capitán América: Civil War", date: "2016-05-06", minutes: 147, image: "Capitan_America_Civil_War.jpeg" },
    { title: "Viuda Negra", date: "2021-07-09", minutes: 134, image: "Viuda_Negra.jpeg" },
    { title: "Black Panther", date: "2018-02-16", minutes: 134, image: "Black_Panther.jpeg" },
    { title: "Spider-Man: Homecoming", date: "2017-07-07", minutes: 133, image: "Spider-Man_Homecoming.jpeg" },
    { title: "Doctor Strange", date: "2016-11-04", minutes: 115, image: "Doctor_Strange.jpeg" },
    { title: "Thor: Ragnarok", date: "2017-11-03", minutes: 131, image: "Thor_Ragnarok.jpeg" },
    { title: "Ant-Man y la Avispa", date: "2018-07-06", minutes: 118, image: "Ant-Man_y_la_Avispa.jpeg" },
    { title: "Vengadores: Infinity War", date: "2018-04-27", minutes: 149, image: "Vengadores_Infinity_War.jpeg" },
    { title: "Vengadores: Endgame", date: "2019-04-26", minutes: 181, image: "Vengadores_Endgame.jpeg" },
    { title: "Thor: Love and Thunder", date: "2022-07-08", minutes: 119, image: "Thor_Love_and_Thunder.jpeg" },
    { title: "Shang-Chi y la leyenda de los Diez Anillos", date: "2021-09-03", minutes: 132, image: "Shang-Chi_y_la_leyenda_de_los_Diez_Anillos.jpeg" },
    { title: "Spider-Man: Lejos de casa", date: "2019-07-02", minutes: 129, image: "Spider-Man_Lejos_de_casa.jpeg" },
    { title: "Eternals", date: "2021-11-05", minutes: 156, image: "Eternals.jpeg" },
    { title: "Spider-Man: No Way Home", date: "2021-12-17", minutes: 148, image: "Spider-Man_No_Way_Home.jpeg" },
    { title: "Doctor Strange en el Multiverso de la Locura", date: "2022-05-06", minutes: 126, image: "Doctor_Strange_en_el_Multiverso_de_la_Locura.jpeg" },
    { title: "Black Panther: Wakanda Forever", date: "2022-11-11", minutes: 161, image: "Black_Panther_Wakanda_Forever.jpeg" },
    { title: "Hombre Lobo de noche", date: "2022-10-07", minutes: 53, image: "Hombre_Lobo_de_noche.jpeg" },
    { title: "The Marvels", date: "2023-11-10", minutes: 105, image: "The_Marvels.jpeg" },
    { title: "Ant-Man y la Avispa: Quantumía", date: "2023-02-17", minutes: 124, image: "Ant-Man_y_la_Avispa_Quantumía.jpeg" },
    { title: "Guardianes de la Galaxia Vol. 3", date: "2023-05-05", minutes: 150, image: "Guardianes_de_la_Galaxia_Vol._3.jpeg" },
    { title: "Capitán América: Brave New World", date: "2025-02-14", minutes: 118, image: "Capitan_America_Brave_New_World.jpeg" },
    { title: "Thunderbolts*", date: "2025-05-02", minutes: 126, image: "Thunderbolts.jpeg" },
    { title: "Spider-Man Un Nuevo Día", date: "2026-07-31", minutes: 150, image: "Spider-Man_Un_Nuevo_Dia.jpeg" },
    { title: "Avengers: Doomsday", date: "2026-12-18", minutes: 165, image: "Avengers_Doomsday.jpeg" }
];
