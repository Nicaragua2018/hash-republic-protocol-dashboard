"""El .env.example del repositorio nombra todas las variables que usa docker-compose.yml."""

import re
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


class EnvEjemploTest(unittest.TestCase):
    def test_lista_todas_las_variables_del_compose(self):
        usadas = set(re.findall(r"\$\{([A-Z_][A-Z0-9_]*)", (RAIZ / "docker-compose.yml").read_text(encoding="utf-8")))
        ejemplo = (RAIZ / ".env.example").read_text(encoding="utf-8")
        listadas = set(re.findall(r"^([A-Z_][A-Z0-9_]*)=", ejemplo, flags=re.MULTILINE))
        self.assertEqual(usadas - listadas, set())

    def test_no_trae_secretos(self):
        ejemplo = (RAIZ / ".env.example").read_text(encoding="utf-8")
        for nombre in ["ANTHROPIC_API_KEY", "REMARK_SECRET", "BOLETIN_DB_PASSWORD", "BOLETIN_ADMIN_PASSWORD"]:
            with self.subTest(nombre=nombre):
                self.assertRegex(ejemplo, rf"(?m)^{nombre}=$")


if __name__ == "__main__":
    unittest.main()
