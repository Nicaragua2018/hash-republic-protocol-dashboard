"""Pruebas del conversor de .docx."""

import io
import tempfile
import unittest
import zipfile
from pathlib import Path

import docx_a_texto

W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
DOCUMENTO = (
    f"<w:document {W}><w:body>"
    "<w:p><w:r><w:t>Hash Rep</w:t></w:r><w:r><w:t>ublic</w:t></w:r></w:p>"
    "<w:p></w:p>"
    "<w:p><w:r><w:t>Uno</w:t><w:tab/><w:t>dos</w:t></w:r></w:p>"
    "</w:body></w:document>"
)


class ConvertirTest(unittest.TestCase):
    def test_une_fragmentos_separa_parrafos_y_pone_cabecera(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = Path(tmp) / "x.docx"
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, "w") as z:
                z.writestr("word/document.xml", DOCUMENTO)
            ruta.write_bytes(buf.getvalue())
            salida = docx_a_texto.convertir(ruta, "Whitepaper", "/proyectos", "v0.5")
        self.assertEqual(
            salida,
            "---\ntitulo: Whitepaper\nurl: /proyectos\nversion: v0.5\n---\nHash Republic\n\nUno dos\n",
        )


if __name__ == "__main__":
    unittest.main()
