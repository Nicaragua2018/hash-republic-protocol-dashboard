import unittest

import configurar

# Entrada SMTP por defecto tal como la crea Listmonk 6.2 al instalarse.
DEFAULT_SMTP = {
    "uuid": "aaaa", "name": "email-localhost", "enabled": True, "host": "localhost", "port": 25,
    "auth_protocol": "cram", "username": "username", "password": "", "hello_hostname": "",
    "max_conns": 10, "idle_timeout": "15s", "wait_timeout": "5s", "max_msg_retries": 2,
    "msg_retry_delay": "5s", "tls_type": "STARTTLS", "tls_skip_verify": False, "email_headers": [],
}


class SmtpEntryTest(unittest.TestCase):
    def test_conserva_los_campos_que_listmonk_exige(self):
        # Sin una entrada previa para el host nuevo, la nueva debe heredar los
        # campos de la existente (por ejemplo msg_retry_delay, sin el cual
        # Listmonk 6.2 no arranca).
        entry = configurar.smtp_entry([DEFAULT_SMTP], local=True)
        self.assertEqual(entry["host"], "mailpit")
        self.assertEqual(entry["msg_retry_delay"], "5s")
        # uuid y name los asigna Listmonk al guardar una entrada nueva.
        self.assertEqual(set(DEFAULT_SMTP) - set(entry), {"uuid", "name"})

    def test_hostinger_sin_contrasena_y_con_tls(self):
        entry = configurar.smtp_entry([DEFAULT_SMTP], local=False)
        self.assertEqual((entry["host"], entry["port"], entry["tls_type"]), ("smtp.hostinger.com", 465, "TLS"))
        self.assertEqual(entry["password"], "")
        self.assertTrue(entry["msg_retry_delay"])

    def test_remitente_es_el_buzon_existente_por_defecto(self):
        # El plan de correo solo permite un buzón: el boletín sale de info@.
        entry = configurar.smtp_entry([DEFAULT_SMTP], local=False)
        self.assertEqual(entry["username"], "info@opencivicsolutions.org")

    def test_remitente_configurable(self):
        entry = configurar.smtp_entry([DEFAULT_SMTP], local=False, sender="boletin@opencivicsolutions.org")
        self.assertEqual(entry["username"], "boletin@opencivicsolutions.org")

    def test_reutiliza_el_uuid_de_la_misma_entrada(self):
        # Con el mismo uuid y la contraseña vacía, Listmonk conserva la que
        # Carlos escribió en el panel.
        current = [{**DEFAULT_SMTP, "uuid": "hostinger-1", "host": "smtp.hostinger.com"}]
        self.assertEqual(configurar.smtp_entry(current, local=False)["uuid"], "hostinger-1")

    def test_sin_entradas_previas_usa_valores_seguros(self):
        entry = configurar.smtp_entry([], local=True)
        self.assertEqual(entry["msg_retry_delay"], "5s")
        self.assertEqual(entry["idle_timeout"], "15s")


class ListasDeEjemploTest(unittest.TestCase):
    def test_borra_solo_las_de_ejemplo_vacias(self):
        lists = [
            {"id": 1, "name": "Default list", "subscriber_count": 0},
            {"id": 2, "name": "Opt-in list", "subscriber_count": 0},
            {"id": 3, "name": "Blog OpenCivic", "subscriber_count": 0},
            {"id": 4, "name": "Revisión", "subscriber_count": 1},
        ]
        self.assertEqual(configurar.sample_lists_to_delete(lists), [1, 2])

    def test_no_borra_una_de_ejemplo_con_suscriptores(self):
        lists = [{"id": 1, "name": "Default list", "subscriber_count": 3}]
        self.assertEqual(configurar.sample_lists_to_delete(lists), [])


    def test_suscriptores_de_ejemplo_por_correo_y_nombre_exactos(self):
        subs = [
            {"id": 1, "email": "john@example.com", "name": "John Doe"},
            {"id": 2, "email": "anon@example.com", "name": "Anon Doe"},
            {"id": 3, "email": "john@example.com", "name": "Otra persona"},
            {"id": 4, "email": "ana@ejemplo.org", "name": "Ana"},
        ]
        self.assertEqual(configurar.sample_subscriber_ids(subs), [1, 2])


if __name__ == "__main__":
    unittest.main()
