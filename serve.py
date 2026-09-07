import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))

class H(SimpleHTTPRequestHandler):
    def log_message(self, *a):  # keep the console quiet
        pass
    def end_headers(self):
        # no caching while developing, so edits show on refresh
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

if __name__ == "__main__":
    os.chdir(ROOT)
    srv = ThreadingHTTPServer(("127.0.0.1", 8899), H)
    srv.daemon_threads = True
    srv.serve_forever()
