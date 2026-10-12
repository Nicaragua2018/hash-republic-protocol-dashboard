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

    def test_reutiliza_el_uuid_de_la_misma_entrada(self):
        # Con el mismo uuid y la contraseña vacía, Listmonk conserva la que
        # Carlos escribió en el panel.
        current = [{**DEFAULT_SMTP, "uuid": "hostinger-1", "host": "smtp.hostinger.com"}]
        self.assertEqual(configurar.smtp_entry(current, local=False)["uuid"], "hostinger-1")

    def test_sin_entradas_previas_usa_valores_seguros(self):
        entry = configurar.smtp_entry([], local=True)
        self.assertEqual(entry["msg_retry_delay"], "5s")
        self.assertEqual(entry["idle_timeout"], "15s")


if __name__ == "__main__":
    unittest.main()
