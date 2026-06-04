import json
import re
import unicodedata
from pathlib import Path

import pdfplumber


PDF_PATH = Path("PDF/listado_detenido_desaparecido.pdf")
OUTPUT_DIR = Path("data")
OUTPUT_JSON = OUTPUT_DIR / "detenidos-desaparecidos.json"

COLUMNAS = [
    "nombre",
    "calificacion",
    "categoria",
    "militancia",
    "fecha_detencion_muerte",
    "region",
    "ciudad",
    "comuna",
    "edad",
    "ocupacion"
]


def limpiar_texto(valor):
    if valor is None:
        return ""

    texto = str(valor)
    texto = texto.replace("\n", " ")
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def crear_id(nombre):
    texto = nombre.lower().strip()
    texto = unicodedata.normalize("NFD", texto)
    texto = texto.encode("ascii", "ignore").decode("utf-8")
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    texto = texto.strip("-")
    return texto


def fila_es_encabezado(fila):
    if not fila:
        return False

    primera_columna = limpiar_texto(fila[0]).lower()
    return primera_columna == "nombre"


def convertir_pdf_a_json():
    print("Iniciando conversión...")

    if not PDF_PATH.exists():
        raise FileNotFoundError(f"No encontré el PDF en esta ruta: {PDF_PATH}")

    personas = []

    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total de páginas detectadas: {len(pdf.pages)}")

        for numero_pagina, pagina in enumerate(pdf.pages, start=1):
            tablas = pagina.extract_tables()

            if not tablas:
                print(f"Página {numero_pagina}: sin tablas detectadas")
                continue

            print(f"Página {numero_pagina}: {len(tablas)} tabla(s) detectada(s)")

            for tabla in tablas:
                for fila in tabla:
                    if not fila:
                        continue

                    if fila_es_encabezado(fila):
                        continue

                    fila_limpia = [limpiar_texto(celda) for celda in fila]

                    while len(fila_limpia) < len(COLUMNAS):
                        fila_limpia.append("")

                    fila_limpia = fila_limpia[:len(COLUMNAS)]

                    persona = dict(zip(COLUMNAS, fila_limpia))

                    if not persona["nombre"]:
                        continue

                    persona["id"] = crear_id(persona["nombre"])
                    persona["pagina_origen"] = numero_pagina

                    personas.append(persona)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as archivo:
        json.dump(personas, archivo, ensure_ascii=False, indent=2)

    print("JSON creado correctamente.")
    print(f"Ruta: {OUTPUT_JSON}")
    print(f"Total de registros extraídos: {len(personas)}")

    if personas:
        print("Primer registro:")
        print(personas[0])


if __name__ == "__main__":
    convertir_pdf_a_json()