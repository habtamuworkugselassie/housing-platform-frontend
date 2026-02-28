# Troubleshooting

## net::ERR_CONNECTION_REFUSED

The browser could not open a TCP connection to the API host:port. Common causes:

### 1. Backend not running on the droplet

- SSH into the droplet and check: `docker ps` (or `docker compose ps` in `~/housing-platform`).
- Ensure the backend container/service is running and listening on the expected port (e.g. 8080).

### 2. Backend bound to localhost only

- The backend must listen on `0.0.0.0` (all interfaces), not `127.0.0.1`, so the browser (and other hosts) can reach it.
- Spring Boot default is `server.address: 0.0.0.0` when set in config; verify the backend’s `server.address` and port.

### 3. Firewall blocking the port

- **DigitalOcean**: Networking → Firewall → allow **Inbound TCP** for the API port (e.g. 8080).
- **On the droplet**: If using `ufw`, allow the port, e.g. `sudo ufw allow 8080` then `sudo ufw reload`.

### 4. Wrong BACKEND_URL for where you’re testing

- **Frontend on droplet, opened from the internet:**  
  `BACKEND_URL` (and thus the request URL) must be a URL the **browser** can reach, e.g.  
  `http://<droplet-public-ip>:8080/api/v1` (and port 8080 must be open and backend listening on 0.0.0.0).
- **Local dev:** Use `npm run dev`; the app uses `/api/v1` and Vite proxies to the backend. Ensure the proxy target in `vite.config.js` is correct and the backend is running locally.

### Quick checks

- From your machine (quote the URL in zsh/bash so `?` and `&` are not interpreted):  
  `curl -s -o /dev/null -w "%{http_code}" "http://209.38.204.219:8080/api/v1/properties?page=0&size=1"`  
  If this fails, the backend is not reachable (not running, wrong bind, or firewall).
- In the browser: DevTools → Network tab, click the failed request and note the **Request URL**. That host:port must be the one where the backend is running and reachable.
